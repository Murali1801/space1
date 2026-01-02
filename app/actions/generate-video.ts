"use server"

import { GoogleAuth } from "google-auth-library"

export async function generateVideo(prompt: string, duration = 8, withAudio = true, modelId = "veo-3.0-generate-001") {
    try {
        // Randomly select between the two keys
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

        const projectId = credentials.project_id
        const location = "us-central1"
        // modelId is now passed in args

        const auth = new GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        })

        const client = await auth.getClient()
        const token = await client.getAccessToken() // Ensure we get a token

        // 1. Start Operation
        // Docs: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo
        const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predictLongRunning`

        const res = await client.request({
            url,
            method: "POST",
            headers: {
                Authorization: `Bearer ${token.token}`,
                "Content-Type": "application/json; charset=utf-8"
            },
            data: {
                instances: [{ prompt }],
                parameters: {
                    sampleCount: 1,
                    resolution: "1080p",
                    generateAudio: withAudio,
                    durationSeconds: duration
                },
            },
        })

        // 2. Poll Operation
        const opName = (res.data as any).name
        console.log("Veo 3 Operation Started:", opName)

        const pollUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:fetchPredictOperation`

        let attempts = 0
        const maxAttempts = 60 // 5 minutes approx (5s interval)

        while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 5000)) // Wait 5s

            const pollRes = await client.request({
                url: pollUrl,
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.token}`,
                    "Content-Type": "application/json"
                },
                data: { operationName: opName }
            })

            const data = (pollRes.data as any)

            if (data.done) {
                if (data.error) {
                    throw new Error(`Generation failed: ${JSON.stringify(data.error)}`)
                }

                const videos = data.response?.videos || []
                if (videos.length > 0) {
                    const vid = videos[0]
                    let finalUrl = ""
                    let isCloudinary = false

                    if (vid.bytesBase64Encoded) {
                        const base64Url = `data:video/mp4;base64,${vid.bytesBase64Encoded}`
                        finalUrl = base64Url

                        // Try to upload
                        try {
                            const { uploadToCloudinary } = await import("@/lib/cloudinary")
                            if (process.env.CLOUDINARY_API_SECRET) {
                                finalUrl = await uploadToCloudinary(base64Url, 'videos')
                                isCloudinary = true
                            }
                        } catch (e) {
                            console.warn("Cloudinary upload failed", e)
                        }
                    } else if (vid.gcsUri) {
                        // GCS URI is not directly viewable without public access, usually
                        // But for now return it
                        finalUrl = vid.gcsUri
                    }

                    if (finalUrl) {
                        return {
                            success: true,
                            videoUrl: finalUrl,
                            isCloudinary
                        }
                    }
                }
                break;
            }
            attempts++
        }

        throw new Error("Timeout waiting for video generation")

    } catch (error) {
        console.error("Error generating video:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            videoUrl: "https://cdn.coverr.co/videos/coverr-cloudy-sky-2765/1080p.mp4" // Fallback
        }
    }
}
