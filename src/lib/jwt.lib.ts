import jwt from "jsonwebtoken";
import { ENV } from "../config/env.config.js";

export interface TokenPaylod {
    userId: string;
    email: string;
    role: string;
    orgId?: string;
}

export interface InviteTokenPayload {
    email: string;
    organizerId: string;
    inviteId: string;
}

export const generateAccessToken = (payload: TokenPaylod) => {
    return jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
};

export const generateRefreshToken = (payload: TokenPaylod) => {
    return jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET) as TokenPaylod;
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET) as TokenPaylod;
};

export const generateTokenPair = (payload: TokenPaylod) => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { accessToken, refreshToken };
};

export const generateInviteToken = (payload: InviteTokenPayload) => {
    return jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, { expiresIn: "24h" });
};

export const verifyInviteToken = (token: string) => {
    return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET) as InviteTokenPayload;
};
