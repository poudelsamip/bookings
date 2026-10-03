import { Router } from "express";
import { validateZod } from "../../middlewares/validate.middleware.js";
import { purchaseTicketSchema } from "./ticket.schema.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { eventTicketController, purchasedEventsController, ticketHoldController, } from "./ticket.controller.js";
const router = Router();
router.post("/event/:eventId/order", authenticate, validateZod(purchaseTicketSchema), ticketHoldController);
router.get("/ticket/my-events", authenticate, purchasedEventsController);
router.get("/ticket/my-events/:eventId", authenticate, eventTicketController);
export default router;
//# sourceMappingURL=ticket.route.js.map