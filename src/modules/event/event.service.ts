import { prisma } from "../../lib/prisma.lib.js";
import { AppError } from "../../utils/error.util.js";
import { EventStatus } from "../../../generated/prisma/enums.js";
import type {
    EventInput,
    ListEventsQuery,
    UpdateEventInput,
} from "./event.schema.js";

const EVENT_INCLUDE = {
    venue: true,
    category: { select: { id: true, name: true } },
    organizer: { select: { id: true, orgName: true, logoUrl: true } },
} as const;

export async function createEvent(userId: string, input: EventInput) {
    const organizer = await prisma.organizer.findUnique({
        where: { userId },
    });

    if (!organizer) {
        throw new AppError(
            403,
            "Only organizers can create events. No organizer profile found for this account.",
        );
    }

    const category = await prisma.eventCategory.findUnique({
        where: { id: input.categoryId },
    });

    if (!category) {
        throw new AppError(404, "Event category not found");
    }

    const event = await prisma.event.create({
        data: {
            organizerId: organizer.id,
            categoryId: input.categoryId,
            title: input.title,
            description: input.description,
            bannerUrl: input.bannerUrl ?? null,
            date: new Date(input.date),
            startTime: new Date(input.startTime),
            endTime: input.endTime ? new Date(input.endTime) : null,
            ...(input.venue && {
                venue: {
                    create: {
                        name: input.venue.name,
                        address: input.venue.address,
                        district: input.venue.district,
                        googleMaps: input.venue.googleMaps ?? null,
                    },
                },
            }),
        },
        include: EVENT_INCLUDE,
    });

    return event;
}

export async function listEvents(query: ListEventsQuery) {
    const { categoryId, date, district, search, page, limit } = query;
    const skip = (page - 1) * limit;

    const where = {
        status: EventStatus.PUBLISHED,
        ...(categoryId && { categoryId }),
        ...(date && { date: new Date(date) }),
        ...(district && {
            venue: { district: { contains: district, mode: "insensitive" as const } },
        }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { description: { contains: search, mode: "insensitive" as const } },
            ],
        }),
    };

    const [total, events] = await prisma.$transaction([
        prisma.event.count({ where }),
        prisma.event.findMany({
            where,
            include: EVENT_INCLUDE,
            orderBy: { date: "asc" },
            skip,
            take: limit,
        }),
    ]);

    return {
        events,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getEventById(id: string) {
    const event = await prisma.event.findUnique({
        where: { id },
        include: EVENT_INCLUDE,
    });

    if (!event) {
        throw new AppError(404, "Event not found");
    }

    return event;
}

export async function updateEvent(
    id: string,
    user: { userId: string; role: string },
    input: UpdateEventInput,
) {
    const existingEvent = await prisma.event.findUnique({
        where: { id },
    });

    if (!existingEvent) {
        throw new AppError(404, "Event not found");
    }

    const organizer = await prisma.organizer.findUnique({
        where: { userId: user.userId },
    });

    if (!organizer || organizer.id !== existingEvent.organizerId) {
        throw new AppError(
            403,
            "Only the event creator can update this event",
        );
    }

    if (input.categoryId) {
        const category = await prisma.eventCategory.findUnique({
            where: { id: input.categoryId },
        });

        if (!category) {
            throw new AppError(404, "Event category not found");
        }
    }

    const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
            ...(input.title !== undefined && { title: input.title }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
            ...(input.bannerUrl !== undefined && { bannerUrl: input.bannerUrl }),
            ...(input.date !== undefined && { date: new Date(input.date) }),
            ...(input.startTime !== undefined && { startTime: new Date(input.startTime) }),
            ...(input.endTime !== undefined && {
                endTime: input.endTime ? new Date(input.endTime) : null,
            }),
            ...(input.status !== undefined && { status: input.status }),
            ...(input.venue && {
                venue: {
                    upsert: {
                        create: {
                            name: input.venue.name,
                            address: input.venue.address,
                            district: input.venue.district,
                            googleMaps: input.venue.googleMaps ?? null,
                        },
                        update: {
                            name: input.venue.name,
                            address: input.venue.address,
                            district: input.venue.district,
                            googleMaps: input.venue.googleMaps ?? null,
                        },
                    },
                },
            }),
        },
        include: EVENT_INCLUDE,
    });

    return updatedEvent;
}

export async function deleteEvent(
    id: string,
    user: { userId: string; role: string },
) {
    const existingEvent = await prisma.event.findUnique({
        where: { id },
    });

    if (!existingEvent) {
        throw new AppError(404, "Event not found");
    }

    const organizer = await prisma.organizer.findUnique({
        where: { userId: user.userId },
    });

    if (!organizer || organizer.id !== existingEvent.organizerId) {
        throw new AppError(
            403,
            "Only the event creator can delete this event",
        );
    }

    await prisma.event.delete({
        where: { id },
    });

    return { id };
}
