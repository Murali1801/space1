const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

async function testGeneration() {
    console.log("1. Reading .env.local...");
    const envPath = path.resolve(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');

    // Manual parsing of .env.local for this test script
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if (value.startsWith("'") && value.endsWith("'")) {
                value = value.slice(1, -1);
            }
            envVars[key] = value;
        }
    });

    const saKey = envVars.GEMINI_INFERENCE_SA_KEY;
    if (!saKey) {
        console.error("❌ GEMINI_INFERENCE_SA_KEY not found in .env.local");
        return;
    }
    console.log("✅ Found Service Account Key");

    try {
        const credentials = JSON.parse(saKey);
        // Fix potential newline escaping issues in private_key
        if (credentials.private_key) {
            credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }
        console.log(`2. Authenticating as ${credentials.client_email}...`);

        const auth = new GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/generative-language"],
        });

        const client = await auth.getClient();
        const token = await client.getAccessToken();
        console.log("✅ Authentication successful");

        const modelId = 'gemini-3-pro-image-preview';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

        console.log(`3. Sending request to ${url}...`);

        const res = await client.request({
            url,
            method: "POST",
            headers: {
                Authorization: `Bearer ${token.token}`,
                "Content-Type": "application/json"
            },
            data: {
                contents: [{ parts: [{ text: "A futuristic city with flying cars, cinematic lighting" }] }],
                generationConfig: {
                    responseModalities: ["IMAGE"],
                    imageConfig: { imageSize: "1K" }
                }
            },
        });

        console.log("4. Response Received");
        // console.log(JSON.stringify(res.data, null, 2));

        if (res.data.candidates && res.data.candidates.length > 0) {
            console.log("✅ SUCCESS: Image candidates received!");
        } else {
            console.error("❌ FAILURE: No candidates in response.");
        }

    } catch (error) {
        console.error("❌ ERROR FAILED:");
        console.error(error.message);
        if (error.response) {
            console.error("API Error Details:", error.response.data);
        }
    }
}

testGeneration();
