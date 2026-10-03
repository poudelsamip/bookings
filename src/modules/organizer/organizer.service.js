import { prisma } from "../../lib/prisma.lib.js";
export const listOrgEvents = async (orgId, userId) => {
    const events = await prisma.event.findMany({
        where: {
            organizerId: orgId,
            organizer: {
                userId: userId,
            },
        },
        select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            date: true,
            category: {
                select: {
                    name: true,
                },
            },
            venue: {
                select: {
                    name: true,
                    address: true,
                    district: true,
                },
            },
        },
    });
    return events;
};
export const getOrgEventBySlug = async (slug, orgId, userId) => {
    const event = await prisma.event.findFirst({
        where: {
            slug,
            organizerId: orgId,
            organizer: {
                userId: userId,
            },
        },
        select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            date: true,
            startTime: true,
            endTime: true,
            bannerUrl: true,
            description: true,
            seatingType: true,
            category: {
                select: {
                    name: true,
                },
            },
            venue: {
                select: {
                    name: true,
                    address: true,
                    district: true,
                    googleMaps: true,
                },
            },
            ticketTypes: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    total: true,
                    sold: true,
                },
            },
        },
    });
    return event;
};
//# sourceMappingURL=organizer.service.js.map