import type { RegisterInput, LoginInput } from "./auth.schema.js";
export declare function register(input: RegisterInput): Promise<Omit<{
    id: string;
    email: string;
    passwordHash: string;
    fullName: string | null;
    phone: string | null;
    role: import("../../../generated/prisma/enums.js").UserRole;
    createdAt: Date;
    updatedAt: Date;
}, "passwordHash">>;
export declare function login(input: LoginInput): Promise<{
    user: Omit<{
        id: string;
        email: string;
        passwordHash: string;
        fullName: string | null;
        phone: string | null;
        role: import("../../../generated/prisma/enums.js").UserRole;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}>;
export declare function me(userId: string): Promise<Omit<{
    organizer: {
        id: string;
        userId: string;
        orgName: string;
        description: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        website: string | null;
        logoUrl: string | null;
    } | null;
} & {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string | null;
    phone: string | null;
    role: import("../../../generated/prisma/enums.js").UserRole;
    createdAt: Date;
    updatedAt: Date;
}, "passwordHash">>;
export declare function refresh(refreshToken: string): Promise<{
    user: Omit<{
        organizer: {
            id: string;
            userId: string;
            orgName: string;
            description: string | null;
            contactEmail: string | null;
            contactPhone: string | null;
            website: string | null;
            logoUrl: string | null;
        } | null;
    } & {
        id: string;
        email: string;
        passwordHash: string;
        fullName: string | null;
        phone: string | null;
        role: import("../../../generated/prisma/enums.js").UserRole;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}>;
//# sourceMappingURL=auth.service.d.ts.map