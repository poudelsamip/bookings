import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { holdTicket } from "./ticket.service.js";
import { PurchaseTicketInput } from "./ticket.schema.js";

export const ticketHoldController = asyncHandler(
    async (
        req: Request<{ id: string }, {}, PurchaseTicketInput>,
        res: Response,
    ) => {
        const userId = req.user!.userId;
        const eventId = req.params.id;

        const ticketOrder = await holdTicket(userId, eventId, req.body);

        return res.status(201).json({
            data: ticketOrder,
        });
    },
);
