import { asyncHandler } from "../../lib/asyncHandler.js";
import * as eventService from "./event.service.js";
export const createEventHandler = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const input = req.body;
    const event = await eventService.createEvent(userId, input);
    res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: { event },
    });
});
export const listEventsHandler = asyncHandler(async (req, res) => {
    const query = req.query;
    const { events, pagination } = await eventService.listEvents(query);
    res.status(200).json({
        success: true,
        data: {
            events,
            pagination,
        },
    });
});
export const getEventByIdHandler = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const event = await eventService.getEventById(id);
    res.status(200).json({
        success: true,
        data: { event },
    });
});
export const getEventBySlugHandler = asyncHandler(async (req, res) => {
    const slug = req.params.slug;
    const event = await eventService.getEventBySlug(slug);
    res.status(200).json({
        success: true,
        data: { event },
    });
});
export const updateEventHandler = asyncHandler(async (req, res) => {
    const user = req.user;
    const id = req.params.id;
    const input = req.body;
    const event = await eventService.updateEvent(id, user, input);
    res.status(200).json({
        success: true,
        message: "Event updated successfully",
        data: { event },
    });
});
export const deleteEventHandler = asyncHandler(async (req, res) => {
    const user = req.user;
    const id = req.params.id;
    await eventService.deleteEvent(id, user);
    res.status(200).json({
        success: true,
        message: "Event deleted successfully",
    });
});
//# sourceMappingURL=event.controller.js.map