import { Router } from "express";
import { validateZod } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
    createEventSchema,
    listEventsSchema,
    updateEventSchema,
    deleteEventSchema,
} from "./event.schema.js";
import {
    createEventHandler,
    listEventsHandler,
    getEventByIdHandler,
    updateEventHandler,
    deleteEventHandler,
} from "./event.controller.js";

const router = Router();

router.get("/", validateZod(listEventsSchema), listEventsHandler);

router.get("/:id", validateZod(deleteEventSchema), getEventByIdHandler);

router.post("/", authenticate, validateZod(createEventSchema), createEventHandler);

router.patch("/:id", authenticate, validateZod(updateEventSchema), updateEventHandler);

router.delete("/:id", authenticate, validateZod(deleteEventSchema), deleteEventHandler);

export default router;
