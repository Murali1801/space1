import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: string, type: 'images' | 'videos', folderPath: string) {
    if (!process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Missing Cloudinary Credentials");
    }

    try {
        let result: any;
        const options = {
            folder: folderPath,
            resource_type: (type === 'videos' ? 'video' : 'image') as 'video' | 'image',
        };

        if (type === 'videos') {
            result = await cloudinary.uploader.upload_large(file, options);
        } else {
            result = await cloudinary.uploader.upload(file, options);
        }

        return result.secure_url;
    } catch (error: any) {
        console.error("Cloudinary Upload Error Details:");
        console.error("- Message:", error.message);
        console.error("- HTTP Code:", error.http_code);
        console.error("- Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
        throw error;
    }
}
