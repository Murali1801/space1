"use server"

import { GoogleAuth } from "google-auth-library"

export async function generateImage(
    prompt: string,
    modelId = 'imagen-3.0-generate-001',
    options: {
        sampleImageSize?: string,
        aspectRatio?: string,
        userId?: string,
        referenceImages?: string[] // Base64 string array
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
            const instance: any = { prompt: prompt };
            if (options.referenceImages && options.referenceImages.length > 0) {
                // Clean base64 strings
                const processedImages = options.referenceImages.map(img => ({
                    bytesBase64Encoded: img.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '')
                }));

                // If the model supports multiple 'image' fields or an array, standard is usually one 'image' for reference.
                // However, we will try to pass the primary one as 'image' and others? 
                // Or if the prompt is multimodal, we might pass them differently.
                // For now, to ensure "images are sent", we'll pick the first one as the primary reference 'image'.
                // If the API supports 'images' (plural) we would use that, but 'image' is the standard field documented for Reference Image.
                instance.image = processedImages[0];
            }

            const payload = {
                instances: [instance],
                parameters: {
                    sampleCount: 1,
                    // sampleImageSize: options.sampleImageSize || "1K", // Not supported/needed for Imagen 3
                    aspectRatio: options.aspectRatio || "1:1",
                }
            }

            console.log(`📷 Image Generation: Started with prompt: "${prompt}"`)
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

            console.log("✅ Image Generation: Success")

            // Log to file for debugging
            try {
                const fs = require('fs');
                const path = require('path');
                const logPath = path.join(process.cwd(), 'api_debug_log.json');
                fs.writeFileSync(logPath, JSON.stringify(res.data, null, 2));
                console.log("Raw response written to:", logPath);
            } catch (err) {
                console.error("Failed to write debug log:", err);
            }

            console.log("Raw Response:", JSON.stringify(res.data, null, 2))

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
            console.error(`❌ Image Generation: Failed with key ending in ...${selectedKey.slice(-10)}. Reason:`, error.message)
            if (error.response?.data) {
                console.error("API Error Details:", JSON.stringify(error.response.data, null, 2))
            }

            // Continue to the next key for ANY error
            console.warn(`Attempt failed with current SA. Trying next available SA...`)
            continue
        }
    }

    // If we reach here, it means either all keys failed or a non-recoverable error occurred
    return {
        success: false,
        error: lastError?.message || "Unknown error during generation",
        imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop"
    }
}
