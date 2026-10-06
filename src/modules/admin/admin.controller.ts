import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as adminService from "./admin.service.js";

export const getDashboardStatsHandler = asyncHandler(
    async (_req: Request, res: Response) => {
        const data = await adminService.getDashboardStats();

        return res.status(200).json({ success: true, data });
    },
);


export const getAllEventsHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const status = req.query.status as string | undefined;
        const search = req.query.search as string | undefined;

        const data = await adminService.getAllEvents(page, limit, status, search);

        return res.status(200).json({ success: true, data });
    },
);

export const updateEventStatusHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { eventId } = req.params as { eventId: string };
        const { status } = req.body as {
            status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
        };

        const data = await adminService.updateEventStatus(eventId, status);

        return res.status(200).json({ success: true, data });
    },
);


export const getAllUsersHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const role = req.query.role as string | undefined;
        const search = req.query.search as string | undefined;

        const data = await adminService.getAllUsers(page, limit, role, search);

        return res.status(200).json({ success: true, data });
    },
);


export const getAllPaymentsHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const status = req.query.status as string | undefined;
        const search = req.query.search as string | undefined;

        const data = await adminService.getAllPayments(page, limit, status, search);

        return res.status(200).json({ success: true, data });
    },
);

export const markRefundedHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { paymentId } = req.params as { paymentId: string };

        const data = await adminService.markPaymentRefunded(paymentId);

        return res.status(200).json({ success: true, data, message: "Payment marked as refunded" });
    },
);


export const getPendingPayoutsHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const data = await adminService.getPendingPayouts(page, limit);

        return res.status(200).json({ success: true, data });
    },
);

export const getPayoutSummaryHandler = asyncHandler(
    async (_req: Request, res: Response) => {
        const data = await adminService.getPayoutSummaryByOrganizer();

        return res.status(200).json({ success: true, data });
    },
);


export const getPendingRefundsHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const data = await adminService.getPendingRefunds(page, limit);

        return res.status(200).json({ success: true, data });
    },
);


export const getPaymentsByEventHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const search = req.query.search as string | undefined;

        const data = await adminService.getPaymentsByEvent(page, limit, search);

        return res.status(200).json({ success: true, data });
    },
);

export const getPaymentsByOrganizerHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const search = req.query.search as string | undefined;

        const data = await adminService.getPaymentsByOrganizer(page, limit, search);

        return res.status(200).json({ success: true, data });
    },
);
