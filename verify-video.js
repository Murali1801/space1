const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

async function testVideoGeneration() {
    console.log("1. Reading .env.local...");
    const envPath = path.resolve(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');

    // Manual parsing
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            envVars[key] = value;
        }
    });

    // Key Rotation Logic Simulation
    const keys = [
        envVars.GEMINI_INFERENCE_SA_KEY,
        envVars.GEMINI_INFERENCE_2_SA_KEY
    ].filter(Boolean);

    if (keys.length === 0) {
        console.error("❌ No keys found");
        return;
    }

    const selectedKey = keys[0]; // Pick first for test
    const credentials = JSON.parse(selectedKey);
    console.log(`2. Authenticating as ${credentials.client_email}...`);

    if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }

    try {
        const auth = new GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        });

        const client = await auth.getClient();
        const token = await client.getAccessToken();

        const projectId = credentials.project_id;
        const location = "us-central1";
        const modelId = "veo-3.0-generate-001";

        const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predictLongRunning`;

        console.log(`3. Sending Video Request to ${url}...`);

        const res = await client.request({
            url,
            method: "POST",
            headers: {
                Authorization: `Bearer ${token.token}`,
                "Content-Type": "application/json; charset=utf-8"
            },
            data: {
                instances: [{ prompt: "A cinematic drone shot of a futuristic cyberpunk city at night, neon lights, rain" }],
                parameters: {
                    sampleCount: 1,
                    resolution: "1080p",
                    generateAudio: true,
                    durationSeconds: 4 // Short duration for test
                },
            },
        });

        const opName = res.data.name;
        console.log("✅ Operation Started:", opName);

        // Polling
        const pollUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:fetchPredictOperation`;

        console.log("4. Polling for result...");
        let attempts = 0;
        while (attempts < 60) {
            process.stdout.write(".");
            await new Promise(r => setTimeout(r, 5000));

            const pollRes = await client.request({
                url: pollUrl,
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.token}`,
                    "Content-Type": "application/json"
                },
                data: { operationName: opName }
            });

            const data = pollRes.data;
            if (data.done) {
                console.log("\n✅ Operation DONE");
                if (data.error) {
                    console.error("❌ Generation Failed:", JSON.stringify(data.error, null, 2));
                } else {
                    const videos = data.response?.videos || [];
                    if (videos.length > 0) {
                        console.log("✅ SUCCESS: Video generated!");
                        if (videos[0].bytesBase64Encoded) console.log("   - Format: Base64");
                        if (videos[0].gcsUri) console.log("   - Format: GCS URI");
                    } else {
                        console.error("❌ No videos in response");
                    }
                }
                break;
            }
            attempts++;
        }

    } catch (error) {
        console.error("\n❌ ERROR:", error.message);
        if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
    }
}

testVideoGeneration();
