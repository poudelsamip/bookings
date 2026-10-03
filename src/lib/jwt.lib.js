import jwt from "jsonwebtoken";
import { ENV } from "../config/env.config.js";
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
};
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET);
};
export const generateTokenPair = (payload) => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return { accessToken, refreshToken };
};
//# sourceMappingURL=jwt.lib.js.map