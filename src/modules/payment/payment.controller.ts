import { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import {
    initiateEsewaPayment,
    esewaSuccess,
    esewaFailure,
    getPaymentInfo,
} from "./payment.service.js";
import { REFRESH_COOKIE, COOKIE_OPTIONS } from "../auth/auth.controller.js";
import { generateTokenPair } from "../../lib/jwt.lib.js";
import { prisma } from "../../lib/prisma.lib.js";
import { ENV } from "../../config/env.config.js";

export const initiateEsewaPaymentController = asyncHandler(
    async (req: Request<{ orderId: string }>, res: Response) => {
        const userId = req.user!.userId;
        const orderId = req.params.orderId;

        const paymentUrl = await initiateEsewaPayment(userId, orderId);

        res.json({ paymentUrl });
    },
);

export const esewaSuccessController = asyncHandler(
    async (req: Request, res: Response) => {
        const encodedData = req.query.data as string;

        if (!encodedData) {
            res.status(400).json({ message: "Missing payment data" });
            return;
        }

        const result = await esewaSuccess(encodedData);

        if (result.userId) {
            const user = await prisma.user.findUnique({
                where: { id: result.userId },
            });
            if (user) {
                const tokens = generateTokenPair({
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                });
                res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
            }
        }

        return res.redirect(
            `${ENV.CLIENT_URL}/payment-success?paymentid=${result.paymentId}`,
        );
    },
);

export const esewaFailureController = asyncHandler(
    async (req: Request, res: Response) => {
        const encodedData = req.query.data as string;

        const result = await esewaFailure(encodedData ?? "");

        if (result.userId) {
            const user = await prisma.user.findUnique({
                where: { id: result.userId },
            });
            if (user) {
                const tokens = generateTokenPair({
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                });
                res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
            }
        }

        return res.redirect(`${ENV.CLIENT_URL}/payment-failed`);
    },
);

export const paymentInfoController = asyncHandler(
    async (req: Request<{ paymentId: string }>, res: Response) => {
        const userId = req.user!.userId;
        const paymentId = req.params.paymentId;

        const payment = await getPaymentInfo(userId, paymentId);

        return res.status(200).json({ data: payment });
    },
);
