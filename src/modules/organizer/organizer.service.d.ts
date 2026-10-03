export declare const listOrgEvents: (orgId: string, userId: string) => Promise<{
    category: {
        name: string;
    };
    date: Date;
    id: string;
    slug: string;
    status: import("../../../generated/prisma/enums.js").EventStatus;
    title: string;
    venue: {
        address: string;
        district: string;
        name: string;
    } | null;
}[]>;
export declare const getOrgEventBySlug: (slug: string, orgId: string, userId: string) => Promise<{
    bannerUrl: string | null;
    category: {
        name: string;
    };
    date: Date;
    description: string;
    endTime: Date | null;
    id: string;
    seatingType: import("../../../generated/prisma/enums.js").SeatingType;
    slug: string;
    startTime: Date;
    status: import("../../../generated/prisma/enums.js").EventStatus;
    ticketTypes: {
        id: string;
        name: string;
        price: number;
        sold: number;
        total: number;
    }[];
    title: string;
    venue: {
        address: string;
        district: string;
        googleMaps: string | null;
        name: string;
    } | null;
} | null>;
//# sourceMappingURL=organizer.service.d.ts.map