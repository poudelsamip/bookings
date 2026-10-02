import { Router } from "express";
import { validateZod } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
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
    validateZod(createEventSchema),
    createEventHandler,
);

router.patch(
    "/event/:id",
    authenticate,
    validateZod(updateEventSchema),
    updateEventHandler,
);

router.delete(
    "/event/:id",
    authenticate,
    validateZod(deleteEventSchema),
    deleteEventHandler,
);

export default router;
