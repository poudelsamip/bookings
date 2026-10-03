import type { Prisma } from "../../../generated/prisma/client.js";
import { OrderStatus } from "../../../generated/prisma/enums.js";
import { PurchaseTicketInput } from "./ticket.schema.js";
export declare const holdTicket: (userId: string, eventId: string, input: PurchaseTicketInput) => Promise<{
    id: string;
    userId: string;
    eventId: string;
    total: number;
    status: OrderStatus;
    expiresAt: Date;
    createdAt: Date;
}>;
type TxClient = Prisma.TransactionClient;
type OrderItem = {
    ticketTypeId: string;
    quantity: number;
};
export declare const issueTickets: (tx: TxClient, userId: string, orderId: string, eventId: string, items: OrderItem[]) => Promise<void>;
export declare const releaseHeldTickets: (tx: TxClient, items: OrderItem[]) => Promise<void>;
export declare const getMyPurchasedEvents: (userId: string) => Promise<{
    id: string;
    title: string;
    slug: string;
    status: string;
    venue: {
        district: string;
        address: string;
    } | null;
    tickets: {
        name: string;
        quantity: number;
    }[];
}[]>;
export declare const getEventTickets: (userId: string, eventId: string) => Promise<{
    event: {
        category: {
            name: string;
            slug: string;
        };
        date: Date;
        id: string;
        organizer: {
            orgName: string;
        };
        seatingType: import("../../../generated/prisma/enums.js").SeatingType;
        slug: string;
        title: string;
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
    };
    tickets: {
        id: string;
        qrCode: string;
        ticketTypeId: string;
        ticketType: string;
    }[];
}>;
export {};
//# sourceMappingURL=ticket.service.d.ts.map