
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testConnection() {
    console.log("--- Cloudinary Diagnostic ---");

    // Check Variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:", cloudName ? `Present (${cloudName.substring(0, 3)}...)` : "MISSING");
    console.log("CLOUDINARY_API_KEY:", apiKey ? `Present (${apiKey.substring(0, 3)}...)` : "MISSING");
    console.log("CLOUDINARY_API_SECRET:", apiSecret ? "Present (Masked)" : "MISSING");

    if (!cloudName || !apiKey || !apiSecret) {
        console.error("❌ FAILURE: Missing one or more required environment variables.");
        return;
    }

    // Configure
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });

    console.log("Attempting test upload...");

    try {
        const result = await cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", {
            folder: 'test_diagnostics',
            resource_type: 'image'
        });
        console.log("✅ SUCCESS! Upload worked.");
        console.log("URL:", result.secure_url);
    } catch (error: any) {
        console.error("❌ UPLOAD FAILED");
        console.error("Error Message:", error.message);
        console.error("Detailed:", JSON.stringify(error, null, 2));
    }
}

testConnection();
