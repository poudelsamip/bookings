import { prisma } from "../../lib/prisma.lib.js";
import { AppError } from "../../utils/error.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { EventStatus } from "../../../generated/prisma/enums.js";
import { randomInt } from "node:crypto";
import type {
    EventInput,
    ListEventsQuery,
    UpdateEventInput,
} from "./event.schema.js";
import { slugify } from "../../utils/slugify.js";
import { cacheEvent, deleteCache, getCachedEvent } from "./event.cache.js";

const EVENT_INCLUDE = {
    venue: true,
    category: { select: { id: true, name: true, slug: true } },
    organizer: { select: { id: true, orgName: true, logoUrl: true } },
    ticketTypes: true,
} as const;

const LIST_EVENTS_SELECT = {
    id: true,
    title: true,
    slug: true,
    date: true,
    startTime: true,
    bannerUrl: true,
    organizer: {
        select: {
            id: true,
            orgName: true,
        },
    },
    venue: {
        select: {
            name: true,
            address: true,
            district: true,
        },
    },
    category: {
        select: {
            name: true,
            slug: true,
        },
    },
} as const;

async function createUniqueEventSlug(title: string): Promise<string> {
    const base = slugify(title, 74) || "event";
    let slug = base;

    // first try the clean slug, then add 5 random letters until it's free
    while (
        await prisma.event.findUnique({ where: { slug }, select: { id: true } })
    ) {
        const suffix = Array.from({ length: 5 }, () =>
            String.fromCharCode(97 + randomInt(26)),
        ).join("");
        slug = `${base}-${suffix}`;
    }

    return slug;
}

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

    const ticketTypes = input.ticketTypes.map((t) => ({
        name: t.name || "GENERAL",
        price: t.price,
        total: t.total,
        sold: 0, // MARK SOLD 0
    }));

    for (let attempt = 0; attempt < 5; attempt++) {
        const slug = await createUniqueEventSlug(input.title);

        try {
            return await prisma.event.create({
                data: {
                    organizerId: organizer.id,
                    categoryId: input.categoryId,
                    title: input.title,
                    slug,
                    status: "PUBLISHED",
                    description: input.description,
                    bannerUrl: input.bannerUrl ?? null,
                    date: new Date(input.date),
                    startTime: new Date(input.startTime),
                    endTime: input.endTime ? new Date(input.endTime) : null,
                    seatingType: input.seatingType,
                    ticketTypes: { create: ticketTypes },
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
        } catch (e) {
            if (
                e instanceof Prisma.PrismaClientKnownRequestError &&
                e.code === "P2002" &&
                String(e.meta?.target).includes("slug")
            ) {
                continue;
            }
            throw e;
        }
    }

    throw new AppError(500, "Failed to create event, Please try again");
}

export async function listEvents(query: ListEventsQuery) {
    const { categoryId, date, district, search, page, limit } = query;
    const skip = (page - 1) * limit;

    const where = {
        status: EventStatus.PUBLISHED,
        ...(categoryId && { categoryId }),
        ...(date && { date: new Date(date) }),
        ...(district && {
            venue: {
                district: { contains: district, mode: "insensitive" as const },
            },
        }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                {
                    description: {
                        contains: search,
                        mode: "insensitive" as const,
                    },
                },
            ],
        }),
    };

    const [total, events] = await prisma.$transaction([
        prisma.event.count({ where }),
        prisma.event.findMany({
            where,
            select: LIST_EVENTS_SELECT,
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

export async function getEventBySlug(slug: string) {
    const cachedEvent = await getCachedEvent(slug);

    if (cachedEvent) {
        console.log("CACHE HIT - EVENT : ", slug);
        return cachedEvent;
    }

    console.log("CACHE MISS - EVENT : ", slug);
    const event = await prisma.event.findUnique({
        where: { slug },
        include: EVENT_INCLUDE,
    });

    if (!event) {
        throw new AppError(404, "Event not found");
    }

    await cacheEvent(slug, event);

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

    await deleteCache(existingEvent.slug);

    const organizer = await prisma.organizer.findUnique({
        where: { userId: user.userId },
    });

    if (!organizer || organizer.id !== existingEvent.organizerId) {
        throw new AppError(403, "Only the event creator can update this event");
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
            ...(input.description !== undefined && {
                description: input.description,
            }),
            ...(input.categoryId !== undefined && {
                categoryId: input.categoryId,
            }),
            ...(input.bannerUrl !== undefined && {
                bannerUrl: input.bannerUrl,
            }),
            ...(input.date !== undefined && { date: new Date(input.date) }),
            ...(input.startTime !== undefined && {
                startTime: new Date(input.startTime),
            }),
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

    await deleteCache(existingEvent.slug);

    const organizer = await prisma.organizer.findUnique({
        where: { userId: user.userId },
    });

    if (!organizer || organizer.id !== existingEvent.organizerId) {
        throw new AppError(403, "Only the event creator can delete this event");
    }

    await prisma.event.delete({
        where: { id },
    });

    return { id };
}
