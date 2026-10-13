import { Router } from "express";
import { validateZod } from "../../middlewares/validate.middleware.js";
import { authenticate, requireOrganizer } from "../../middlewares/auth.middleware.js";
import {
    createEventSchema,
    listEventsSchema,
    updateEventSchema,
    deleteEventSchema,
    eventSlugParamSchema,
} from "./event.schema.js";
import {
    createEventHandler,
    listEventsHandler,
    getEventBySlugHandler,
    updateEventHandler,
    deleteEventHandler,
} from "./event.controller.js";

const router = Router();

router.get("/", validateZod(listEventsSchema), listEventsHandler);

router.get("/:slug", validateZod(eventSlugParamSchema), getEventBySlugHandler);

router.post(
    "/",
    authenticate,
    requireOrganizer,
    validateZod(createEventSchema),
    createEventHandler,
);

router.patch(
    "/:id",
    authenticate,
    requireOrganizer,
    validateZod(updateEventSchema),
    updateEventHandler,
);

router.delete(
    "/:id",
    authenticate,
    requireOrganizer,
    validateZod(deleteEventSchema),
    deleteEventHandler,
);

export default router;
