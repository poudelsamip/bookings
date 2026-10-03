import { asyncHandler } from "../../lib/asyncHandler.js";
import { getEventTickets, getMyPurchasedEvents, holdTicket, } from "./ticket.service.js";
export const ticketHoldController = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const eventId = req.params.eventId;
    const ticketOrder = await holdTicket(userId, eventId, req.body);
    return res.status(201).json({
        data: ticketOrder,
    });
});
export const purchasedEventsController = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const purchasedEvents = await getMyPurchasedEvents(userId);
    return res.status(200).json({ data: purchasedEvents });
});
export const eventTicketController = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const eventId = req.params.eventId;
    const { event, tickets } = await getEventTickets(userId, eventId);
    return res.status(200).json({ data: { event, tickets } });
});
//# sourceMappingURL=ticket.controller.js.map