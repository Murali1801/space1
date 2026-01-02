import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: string, folder: 'images' | 'videos') {
    if (!process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Missing Cloudinary Credentials");
    }

    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: `ai-saas/${folder}`,
            resource_type: folder === 'videos' ? 'video' : 'image',
        });
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
}
