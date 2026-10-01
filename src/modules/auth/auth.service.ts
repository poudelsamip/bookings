import { prisma } from "../../lib/prisma.lib.js";
import { hashPassword, comparePassword } from "../../lib/password.lib.js";
import { generateTokenPair, verifyRefreshToken } from "../../lib/jwt.lib.js";
import { AppError } from "../../utils/error.js";
import type {
    RegisterInput,
    LoginInput,
    OrganizerRegisterInput,
} from "./auth.schema.js";

export async function register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (existing) {
        throw new AppError(409, "An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);

    if (input.role === "ORGANIZER") {
        const org = input as OrganizerRegisterInput;

        const user = await prisma.user.create({
            data: {
                email: org.email,
                passwordHash,
                role: "ORGANIZER",
                organizer: {
                    create: {
                        orgName: org.orgName,
                        description: org.description ?? null,
                        contactEmail: org.contactEmail ?? null,
                        contactPhone: org.contactPhone ?? null,
                        website: org.website ?? null,
                        logoUrl: org.logoUrl ?? null,
                    },
                },
            },
            include: { organizer: true },
        });

        return sanitizeUser(user);
    }

    const user = await prisma.user.create({
        data: {
            email: input.email,
            passwordHash,
            fullName: input.fullName,
            phone: input.phone,
            role: "USER",
        },
    });

    return sanitizeUser(user);
}

export async function login(input: LoginInput) {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (!user) {
        throw new AppError(401, "Invalid email or password");
    }

    const passwordMatch = await comparePassword(
        input.password,
        user.passwordHash,
    );

    if (!passwordMatch) {
        throw new AppError(401, "Invalid email or password");
    }

    const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const tokens = generateTokenPair(tokenPayload);

    return { user: sanitizeUser(user), tokens };
}

export async function me(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organizer: true },
    });

    if (!user) {
        throw new AppError(404, "User not found");
    }

    return sanitizeUser(user);
}

export async function refresh(refreshToken: string) {
    let payload;
    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        throw new AppError(401, "Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    });

    if (!user) {
        throw new AppError(401, "User no longer exists");
    }

    const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const tokens = generateTokenPair(tokenPayload);

    return tokens;
}

function sanitizeUser<
    T extends {
        id: string;
        email: string;
        fullName?: string | null;
        phone?: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
        organizer?: unknown;
    },
>(user: T) {
    const { passwordHash: _ph, ...safe } = user;
    return safe;
}
