import { z } from "zod";
const baseRegisterFields = z.object({
    email: z.email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password must be at most 72 characters"),
});
const userRegisterSchema = baseRegisterFields.extend({
    role: z.literal("USER"),
    fullName: z.string().min(1, "Full name is required").max(120),
    phone: z.string().min(7, "Phone number is required").max(20),
});
const organizerRegisterSchema = baseRegisterFields.extend({
    role: z.literal("ORGANIZER"),
    orgName: z.string().min(1, "Organization name is required").max(120),
    description: z.string().max(500).optional(),
    contactEmail: z.email("Invalid contact email").optional(),
    contactPhone: z.string().max(20).optional(),
    website: z.url("Invalid website URL").optional(),
    logoUrl: z.url("Invalid logo URL").optional(),
});
export const registerSchema = z.object({
    body: z.discriminatedUnion("role", [
        userRegisterSchema,
        organizerRegisterSchema,
    ]),
});
export const loginSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});
//# sourceMappingURL=auth.schema.js.map