import { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import {
    initiateEsewaPayment,
    esewaSuccess,
    esewaFailure,
} from "./payment.service.js";

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

        // res.json({
        //     message: "Payment successful",
        //     orderId: result.orderId,
        // });

        return res.redirect("http://localhost:5173/payment-success");
    },
);

export const esewaFailureController = asyncHandler(
    async (req: Request, res: Response) => {
        const encodedData = req.query.data as string;

        const result = await esewaFailure(encodedData ?? "");

        // res.status(200).json(result);

        return res.redirect("http://localhost:5173/payment-failed");
    },
);
