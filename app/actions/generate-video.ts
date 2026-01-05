"use server"

import { GoogleAuth } from "google-auth-library"

export async function generateVideo(
    prompt: string,
    duration = 8,
    withAudio = true,
    modelId = "veo-3.0-generate-001",
    options: { aspectRatio?: string, userId?: string } = {}
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

            const projectId = credentials.project_id
            const location = "us-central1"

            const auth = new GoogleAuth({
                credentials,
                scopes: ["https://www.googleapis.com/auth/cloud-platform"],
            })

            const client = await auth.getClient()
            const token = await client.getAccessToken()

            // 1. Start Operation
            const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predictLongRunning`

            console.log(`🎥 Video Generation: Started with prompt: "${prompt}"`)
            console.log(`Starting video generation with ${modelId} using Project: ${projectId}...`)

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
                        durationSeconds: duration,
                        aspectRatio: options.aspectRatio || "16:9",
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
                                    const folderPath = `space/user_${options.userId || 'anonymous'}/videos`
                                    finalUrl = await uploadToCloudinary(base64Url, 'videos', folderPath)
                                    isCloudinary = true
                                }
                            } catch (e) {
                                console.error("Cloudinary upload failed, falling back to base64:", e)
                            }
                        } else if (vid.gcsUri) {
                            finalUrl = vid.gcsUri
                        }

                        if (finalUrl) {
                            console.log("✅ Video Generation: Success")
                            return {
                                success: true,
                                videoUrl: finalUrl,
                                isCloudinary,
                                storeInHistory: isCloudinary
                            }
                        }
                    }
                    break;
                }
                attempts++
            }

            throw new Error("Timeout waiting for video generation")

        } catch (error: any) {
            lastError = error
            console.error(`❌ Video Generation: Failed with key ending in ...${selectedKey.slice(-10)}. Reason:`, error.message)

            // Retry for ANY error during the initial request
            console.warn(`Attempt failed with current SA. Trying next available SA...`)
            continue
        }
    }

    return {
        success: false,
        error: lastError?.message || "Unknown error during video generation",
        videoUrl: "https://cdn.coverr.co/videos/coverr-cloudy-sky-2765/1080p.mp4"
    }
}
