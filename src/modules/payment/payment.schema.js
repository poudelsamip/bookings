import { z } from "zod";
export const paymentSchema = z.object({
    params: z.object({
        orderId: z.uuid("Invalid order ID"),
    }),
});
//# sourceMappingURL=payment.schema.js.map