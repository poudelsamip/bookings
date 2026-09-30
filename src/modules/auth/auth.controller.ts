import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as authService from "./auth.service.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import { AppError } from "../../utils/error.util.js";

const REFRESH_COOKIE = "refreshToken";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const registerHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const input = req.body as RegisterInput;
        const user = await authService.register(input);

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: { user },
        });
    },
);

export const loginHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const input = req.body as LoginInput;
        const { user, tokens } = await authService.login(input);

        res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            data: {
                user,
                accessToken: tokens.accessToken,
            },
        });
    },
);

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = await authService.me(userId);

    res.status(200).json({
        success: true,
        data: { user },
    });
});

export const refreshHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token: string | undefined = req.cookies[REFRESH_COOKIE];

        if (!token) {
            throw new AppError(401, "No refresh token provided");
        }

        const tokens = await authService.refresh(token);

        res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken: tokens.accessToken,
            },
        });
    },
);

export const logoutHandler = asyncHandler(
    async (_req: Request, res: Response) => {
        res.clearCookie(REFRESH_COOKIE, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    },
);
