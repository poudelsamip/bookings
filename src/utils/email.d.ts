export interface TicketConfirmationData {
    to: string;
    userName: string;
    eventTitle: string;
    eventDate: Date;
    eventStartTime: Date;
    venueName?: string;
    venueAddress?: string;
    venueMapUrl?: string;
    orderId: string;
    tickets: {
        ticketTypeName: string;
        quantity: number;
        unitPrice: number;
        qrCodes: string[];
    }[];
    totalAmount: number;
}
interface FlatTicket {
    ticketTypeName: string;
    code: string;
    cid: string;
}
export declare function buildTicketConfirmationHtml(data: TicketConfirmationData, flat?: FlatTicket[]): string;
export declare const sendTicketConfirmationEmail: (data: TicketConfirmationData) => Promise<void>;
export {};
//# sourceMappingURL=email.d.ts.map