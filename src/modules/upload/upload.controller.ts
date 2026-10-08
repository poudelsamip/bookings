import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { uploadImageToCloudinary } from "./upload.service.js";
import { AppError } from "../../utils/error.js";

export const uploadImageHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError(400, "No file provided");
    }

    const result = await uploadImageToCloudinary(req.file);

    return res.status(200).json({
        data: {
            url: result.url,
            publicId: result.publicId,
        },
    });
});
