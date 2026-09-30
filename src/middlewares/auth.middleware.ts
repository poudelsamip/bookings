import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/error.util.js";
import { verifyAccessToken } from "../lib/jwt.lib.js";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const header = req.headers.authorization;

    const [scheme, token] = header?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
        throw new AppError(401, "User unauthenticated");
    }

    try {
        req.user = verifyAccessToken(token);
        next();
    } catch (error) {
        throw new AppError(401, "Invalid or expired token");
    }
};
