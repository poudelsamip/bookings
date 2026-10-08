import multer from "multer";

// Store files in memory so we can stream them to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
    fileFilter(_req, file, cb) {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
        }
    },
});
