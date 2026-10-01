import { Router } from "express";
import { validateZod } from "../../middlewares/validate.middleware.js";
import { purchaseTicketSchema } from "./ticket.schema.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/event/:id/order",
    authenticate,
    validateZod(purchaseTicketSchema),
);
