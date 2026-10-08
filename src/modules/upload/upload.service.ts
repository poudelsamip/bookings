import cloudinary from "../../config/cloudinary.config.js";
import { AppError } from "../../utils/error.js";

export async function uploadImageToCloudinary(
    file: Express.Multer.File,
): Promise<{ url: string; publicId: string }> {
    if (!file) {
        throw new AppError(400, "No file provided");
    }

    const result = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "ticket-app/events",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error || !result) {
                        reject(error ?? new Error("Cloudinary upload failed"));
                    } else {
                        resolve(result);
                    }
                },
            );
            uploadStream.end(file.buffer);
        },
    );

    return {
        url: result.secure_url,
        publicId: result.public_id,
    };
}
