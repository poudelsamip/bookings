import { asyncHandler } from "../../lib/asyncHandler.js";
import * as authService from "./auth.service.js";
import { AppError } from "../../utils/error.js";
export const REFRESH_COOKIE = "refreshToken";
export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
export const registerHandler = asyncHandler(async (req, res) => {
    const input = req.body;
    const user = await authService.register(input);
    res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: { user },
    });
});
export const loginHandler = asyncHandler(async (req, res) => {
    const input = req.body;
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
});
export const meHandler = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const user = await authService.me(userId);
    res.status(200).json({
        success: true,
        data: { user },
    });
});
export const refreshHandler = asyncHandler(async (req, res) => {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) {
        throw new AppError(401, "No refresh token provided");
    }
    const { user, tokens } = await authService.refresh(token);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
    res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
            user,
            accessToken: tokens.accessToken,
        },
    });
});
export const logoutHandler = asyncHandler(async (_req, res) => {
    res.clearCookie(REFRESH_COOKIE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});
//# sourceMappingURL=auth.controller.js.map