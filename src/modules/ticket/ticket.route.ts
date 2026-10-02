import { Router } from "express";
import { validateZod } from "../../middlewares/validate.middleware.js";
import { purchaseTicketSchema } from "./ticket.schema.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
    eventTicketController,
    purchasedEventsController,
} from "./ticket.controller.js";

const router = Router();

router.post(
    "/event/:id/order",
    authenticate,
    validateZod(purchaseTicketSchema),
);

router.get("/ticket/my-events", authenticate, purchasedEventsController);

router.get("/ticket/my-events/:eventId", authenticate, eventTicketController);
