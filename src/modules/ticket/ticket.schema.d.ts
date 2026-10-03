import z from "zod";
export declare const purchaseTicketSchema: z.ZodObject<{
    params: z.ZodObject<{
        eventId: z.ZodUUID;
    }, z.core.$strip>;
    body: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            ticketTypeId: z.ZodUUID;
            quantity: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type PurchaseTicketInput = z.infer<typeof purchaseTicketSchema>["body"];
//# sourceMappingURL=ticket.schema.d.ts.map