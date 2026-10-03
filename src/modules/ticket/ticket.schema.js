import z from "zod";
const MAX_PER_TYPE = 10;
const qrCodeSchema = z.string().regex(/^[A-Za-z0-9_-]{32}$/, "Invalid QR code");
export const purchaseTicketSchema = z.object({
    params: z.object({
        eventId: z.uuid("Invalid event ID"),
    }),
    body: z
        .object({
        items: z
            .array(z.object({
            ticketTypeId: z.uuid("Invalid ticket type ID"),
            quantity: z
                .number()
                .int("Quantity must be whole number")
                .min(1, "Quantity must be at least 1")
                .max(MAX_PER_TYPE, `You can only order ${MAX_PER_TYPE} tickets per order`),
        }))
            .min(1, "Select at least one ticket"),
    })
        .superRefine((data, ctx) => {
        // the same ticket type can't appear twice in one request
        const seen = new Set();
        data.items.forEach((item, i) => {
            if (seen.has(item.ticketTypeId)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["items", i, "ticketTypeId"],
                    message: "Each ticket type can only be listed once",
                });
            }
            seen.add(item.ticketTypeId);
        });
    }),
});
//# sourceMappingURL=ticket.schema.js.map