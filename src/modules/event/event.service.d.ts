import { EventStatus } from "../../../generated/prisma/enums.js";
import type { EventInput, ListEventsQuery, UpdateEventInput } from "./event.schema.js";
export declare function createEvent(userId: string, input: EventInput): Promise<{
    category: {
        id: string;
        name: string;
        slug: string;
    };
    organizer: {
        id: string;
        logoUrl: string | null;
        orgName: string;
    };
    ticketTypes: {
        id: string;
        eventId: string;
        name: string;
        price: number;
        total: number;
        held: number;
        sold: number;
    }[];
    venue: {
        id: string;
        eventId: string;
        name: string;
        address: string;
        district: string;
        googleMaps: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
} & {
    id: string;
    organizerId: string;
    categoryId: string;
    title: string;
    slug: string;
    description: string;
    bannerUrl: string | null;
    date: Date;
    startTime: Date;
    endTime: Date | null;
    seatingType: import("../../../generated/prisma/enums.js").SeatingType;
    status: EventStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function listEvents(query: ListEventsQuery): Promise<{
    events: {
        bannerUrl: string | null;
        category: {
            name: string;
            slug: string;
        };
        date: Date;
        id: string;
        organizer: {
            id: string;
            orgName: string;
        };
        slug: string;
        startTime: Date;
        title: string;
        venue: {
            address: string;
            district: string;
            name: string;
        } | null;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare function getEventById(id: string): Promise<{
    category: {
        id: string;
        name: string;
        slug: string;
    };
    organizer: {
        id: string;
        logoUrl: string | null;
        orgName: string;
    };
    ticketTypes: {
        id: string;
        eventId: string;
        name: string;
        price: number;
        total: number;
        held: number;
        sold: number;
    }[];
    venue: {
        id: string;
        eventId: string;
        name: string;
        address: string;
        district: string;
        googleMaps: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
} & {
    id: string;
    organizerId: string;
    categoryId: string;
    title: string;
    slug: string;
    description: string;
    bannerUrl: string | null;
    date: Date;
    startTime: Date;
    endTime: Date | null;
    seatingType: import("../../../generated/prisma/enums.js").SeatingType;
    status: EventStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function getEventBySlug(slug: string): Promise<{
    category: {
        id: string;
        name: string;
        slug: string;
    };
    organizer: {
        id: string;
        logoUrl: string | null;
        orgName: string;
    };
    ticketTypes: {
        id: string;
        eventId: string;
        name: string;
        price: number;
        total: number;
        held: number;
        sold: number;
    }[];
    venue: {
        id: string;
        eventId: string;
        name: string;
        address: string;
        district: string;
        googleMaps: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
} & {
    id: string;
    organizerId: string;
    categoryId: string;
    title: string;
    slug: string;
    description: string;
    bannerUrl: string | null;
    date: Date;
    startTime: Date;
    endTime: Date | null;
    seatingType: import("../../../generated/prisma/enums.js").SeatingType;
    status: EventStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateEvent(id: string, user: {
    userId: string;
    role: string;
}, input: UpdateEventInput): Promise<{
    category: {
        id: string;
        name: string;
        slug: string;
    };
    organizer: {
        id: string;
        logoUrl: string | null;
        orgName: string;
    };
    ticketTypes: {
        id: string;
        eventId: string;
        name: string;
        price: number;
        total: number;
        held: number;
        sold: number;
    }[];
    venue: {
        id: string;
        eventId: string;
        name: string;
        address: string;
        district: string;
        googleMaps: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
} & {
    id: string;
    organizerId: string;
    categoryId: string;
    title: string;
    slug: string;
    description: string;
    bannerUrl: string | null;
    date: Date;
    startTime: Date;
    endTime: Date | null;
    seatingType: import("../../../generated/prisma/enums.js").SeatingType;
    status: EventStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteEvent(id: string, user: {
    userId: string;
    role: string;
}): Promise<{
    id: string;
}>;
//# sourceMappingURL=event.service.d.ts.map