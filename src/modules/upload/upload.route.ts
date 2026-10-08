import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { uploadImageHandler } from "./upload.controller.js";

const router = Router();

// POST /api/upload/image — any authenticated user
router.post(
    "/upload/image",
    authenticate,
    upload.single("image"),
    uploadImageHandler,
);

export default router;
