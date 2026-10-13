import { Router } from "express";
import {
    authenticate,
    requireOrganizer,
} from "../../middlewares/auth.middleware.js";
import {
    orgEventBySlugController,
    orgEventController,
} from "./organizer.controller.js";

const router = Router();

router.get("/events", authenticate, requireOrganizer, orgEventController);
router.get(
    "/events/:slug",
    authenticate,
    requireOrganizer,
    orgEventBySlugController,
);

export default router;
