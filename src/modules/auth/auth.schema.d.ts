import { z } from "zod";
declare const userRegisterSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    role: z.ZodLiteral<"USER">;
    fullName: z.ZodString;
    phone: z.ZodString;
}, z.core.$strip>;
declare const organizerRegisterSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    role: z.ZodLiteral<"ORGANIZER">;
    orgName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodEmail>;
    contactPhone: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodURL>;
    logoUrl: z.ZodOptional<z.ZodURL>;
}, z.core.$strip>;
export declare const registerSchema: z.ZodObject<{
    body: z.ZodDiscriminatedUnion<[z.ZodObject<{
        email: z.ZodEmail;
        password: z.ZodString;
        role: z.ZodLiteral<"USER">;
        fullName: z.ZodString;
        phone: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        email: z.ZodEmail;
        password: z.ZodString;
        role: z.ZodLiteral<"ORGANIZER">;
        orgName: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        contactEmail: z.ZodOptional<z.ZodEmail>;
        contactPhone: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodURL>;
        logoUrl: z.ZodOptional<z.ZodURL>;
    }, z.core.$strip>], "role">;
}, z.core.$strip>;
export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type OrganizerRegisterInput = z.infer<typeof organizerRegisterSchema>;
export type RegisterInput = z.infer<typeof registerSchema>["body"];
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodEmail;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof loginSchema>["body"];
export {};
//# sourceMappingURL=auth.schema.d.ts.map