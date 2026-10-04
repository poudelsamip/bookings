import { z } from "zod";

export const inviteStaffSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
    }),
});

export const acceptInviteSchema = z.object({
    body: z.object({
        token: z.string().min(1, "Invite token is required"),
        fullName: z.string().min(1, "Full name is required").max(120),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(72, "Password must be at most 72 characters"),
    }),
});

export const scanTicketSchema = z.object({
    body: z.object({
        qrCode: z.string().min(1, "QR code is required"),
    }),
});

export type InviteStaffInput = z.infer<typeof inviteStaffSchema>["body"];
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>["body"];
export type ScanTicketInput = z.infer<typeof scanTicketSchema>["body"];
