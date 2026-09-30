import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as eventService from "./event.service.js";
import type {
    EventInput,
    ListEventsQuery,
    UpdateEventInput,
} from "./event.schema.js";

export const createEventHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const input = req.body as EventInput;

        const event = await eventService.createEvent(userId, input);

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: { event },
        });
    },
);

export const listEventsHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const query = req.query as unknown as ListEventsQuery;
        const result = await eventService.listEvents(query);

        res.status(200).json({
            success: true,
            data: result,
        });
    },
);

export const getEventByIdHandler = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
        const id = req.params.id;
        const event = await eventService.getEventById(id);

        res.status(200).json({
            success: true,
            data: { event },
        });
    },
);

export const updateEventHandler = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
        const user = req.user!;
        const id = req.params.id;
        const input = req.body as UpdateEventInput;

        const event = await eventService.updateEvent(id, user, input);

        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: { event },
        });
    },
);

export const deleteEventHandler = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
        const user = req.user!;
        const id = req.params.id;

        await eventService.deleteEvent(id, user);

        res.status(200).json({
            success: true,
            message: "Event deleted successfully",
        });
    },
);

