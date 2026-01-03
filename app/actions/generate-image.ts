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
    try {
        // ... (keys logic same)
        const keys = [
            process.env.GEMINI_INFERENCE_SA_KEY,
            process.env.GEMINI_INFERENCE_2_SA_KEY
        ].filter(Boolean)

        if (keys.length === 0) throw new Error("No service account keys found")

        const selectedKey = keys[Math.floor(Math.random() * keys.length)] || "{}"
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

        console.log(`Generating image with ${vertexModelId} on Vertex AI...`)
        console.log("Payload:", JSON.stringify(payload, null, 2))

        const res = await client.request({
            url,
            method: "POST",
            headers: {
                Authorization: `Bearer ${token.token}`,
                "Content-Type": "application/json; charset=utf-8"
            },
            data: payload,
        })

        console.log("Vertex AI Image Response:", res.data)

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

        return {
            success: false,
            error: "No image data found in Vertex AI response"
        }

    } catch (error) {
        console.error("Error generating image:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            // Fallback for demo if API fails
            imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop"
        }
    }
}
