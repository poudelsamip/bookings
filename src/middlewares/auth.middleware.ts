import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/error.js";
import { verifyAccessToken } from "../lib/jwt.lib.js";
import { prisma } from "../lib/prisma.lib.js";
import { UserRole } from "../generated/prisma/enums.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const authenticate = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        const header = req.headers.authorization;
        const [scheme, token] = header?.split(" ") ?? [];

        if (scheme !== "Bearer" || !token) {
            throw new AppError(401, "User unauthenticated");
        }

        let user;
        try {
            user = verifyAccessToken(token);
        } catch {
            throw new AppError(401, "Invalid or expired token");
        }

        req.user = user;
        next();
    },
);

export const requireOrganizer = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        if (req.user?.role !== UserRole.ORGANIZER) {
            throw new AppError(403, "Organizer access required");
        }

        const organizer = await prisma.organizer.findUnique({
            where: { userId: req.user.userId },
        });
        if (!organizer) {
            throw new AppError(403, "Organizer account not found");
        }

        req.user = { ...req.user, orgId: organizer.id };
        next();
    },
);

export const requireStaff = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        if (req.user?.role !== UserRole.STAFF) {
            throw new AppError(403, "Staff access required");
        }

        const staffEntry = await prisma.staff.findFirst({
            where: { userId: req.user.userId },
        });
        if (!staffEntry) {
            throw new AppError(403, "Staff membership not found");
        }

        req.user = { ...req.user, orgId: staffEntry.organizerId };
        next();
    },
);

export const requireAdmin = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        if (req.user?.role !== UserRole.ADMIN) {
            throw new AppError(403, "Admin access required");
        }
        next();
    },
);
