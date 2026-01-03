"use server"

import { GoogleAuth } from "google-auth-library"

export async function generateImage(
    prompt: string,
    modelId = 'imagen-3.0-generate-001',
    options: {
        sampleImageSize?: string,
        aspectRatio?: string,
        userId?: string
    } = {}
) {
    // Identify all available keys
    const availableKeys = [
        process.env.GEMINI_INFERENCE_SA_KEY,
        process.env.GEMINI_INFERENCE_2_SA_KEY
    ].filter(Boolean) as string[]

    if (availableKeys.length === 0) throw new Error("No service account keys found")

    // Shuffle keys for random selection
    const shuffledKeys = [...availableKeys].sort(() => Math.random() - 0.5)
    let lastError: any = null

    for (const selectedKey of shuffledKeys) {
        try {
            const credentials = JSON.parse(selectedKey)

            if (credentials.private_key) {
                credentials.private_key = credentials.private_key.replace(/\\n/g, '\n')
            }

            const auth = new GoogleAuth({
                credentials,
                scopes: ["https://www.googleapis.com/auth/cloud-platform"],
            })

            const client = await auth.getClient()
            const token = await client.getAccessToken()

            const projectId = credentials.project_id
            const location = "us-central1"

            let vertexModelId = modelId || "imagen-3.0-generate-001"

            // Construct Vertex AI Prediction Endpoint
            const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${vertexModelId}:predict`

            // Construct Payload as per Imagen Docs
            const payload = {
                instances: [
                    { prompt: prompt }
                ],
                parameters: {
                    sampleCount: 1,
                    sampleImageSize: options.sampleImageSize || "1K",
                    aspectRatio: options.aspectRatio || "1:1",
                }
            }

            console.log(`Generating image with ${vertexModelId} using Project: ${projectId}...`)

            const res = await client.request({
                url,
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.token}`,
                    "Content-Type": "application/json; charset=utf-8"
                },
                data: payload,
            })

            console.log("Vertex AI Image Response Success.")

            const predictions = (res.data as any).predictions
            if (predictions && predictions.length > 0) {
                const prediction = predictions[0]
                if (prediction.bytesBase64Encoded) {
                    const base64Url = `data:${prediction.mimeType || 'image/png'};base64,${prediction.bytesBase64Encoded}`

                    // Try to upload to Cloudinary
                    let finalUrl = base64Url
                    let isCloudinary = false

                    try {
                        const { uploadToCloudinary } = await import("@/lib/cloudinary")
                        if (process.env.CLOUDINARY_API_SECRET) {
                            const folderPath = `space/user_${options.userId || 'anonymous'}/images`
                            finalUrl = await uploadToCloudinary(base64Url, 'images', folderPath)
                            isCloudinary = true
                        }
                    } catch (e) {
                        console.warn("Cloudinary upload failed, using base64:", e)
                    }

                    return {
                        success: true,
                        imageUrl: finalUrl,
                        isCloudinary
                    }
                }
            }

            throw new Error("No image data found in Vertex AI response")

        } catch (error: any) {
            lastError = error
            const errorStatus = error.response?.status
            const errorMessage = error.message || ""

            // If it's a quota or rate limit error, continue to the next key
            if (errorStatus === 429 || (errorStatus === 403 && errorMessage.toLowerCase().includes("quota"))) {
                console.warn(`SA quota exhausted for a project. Trying next available SA...`)
                continue
            }

            // For other structural errors, break and return
            console.error("Non-recoverable error during image generation:", error)
            break
        }
    }

    // If we reach here, it means either all keys failed or a non-recoverable error occurred
    return {
        success: false,
        error: lastError?.message || "Unknown error during generation",
        imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop"
    }
}
