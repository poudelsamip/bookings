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

router.get("/event", validateZod(listEventsSchema), listEventsHandler);

router.get("/event/:slug", validateZod(eventSlugParamSchema), getEventBySlugHandler);

router.post(
    "/event",
    authenticate,
    requireOrganizer,
    validateZod(createEventSchema),
    createEventHandler,
);

router.patch(
    "/event/:id",
    authenticate,
    requireOrganizer,
    validateZod(updateEventSchema),
    updateEventHandler,
);

router.delete(
    "/event/:id",
    authenticate,
    requireOrganizer,
    validateZod(deleteEventSchema),
    deleteEventHandler,
);

export default router;
