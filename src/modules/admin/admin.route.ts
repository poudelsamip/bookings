import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/auth.middleware.js";
import {
    getDashboardStatsHandler,
    getAllEventsHandler,
    updateEventStatusHandler,
    getAllUsersHandler,
    getAllPaymentsHandler,
    markRefundedHandler,
    getPendingPayoutsHandler,
    getPayoutHistoryHandler,
    releasePayoutHandler,
    getPayoutSummaryHandler,
    getPendingRefundsHandler,
    getPaymentsByEventHandler,
    getPaymentsByOrganizerHandler,
} from "./admin.controller.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get("/admin/stats", getDashboardStatsHandler);

// Events
router.get("/admin/events", getAllEventsHandler);
router.patch("/admin/events/:eventId/status", updateEventStatusHandler);

// Users
router.get("/admin/users", getAllUsersHandler);

// Payments (full list + grouped views)
router.get("/admin/payments", getAllPaymentsHandler);
router.get("/admin/payments/by-event", getPaymentsByEventHandler);
router.get("/admin/payments/by-organizer", getPaymentsByOrganizerHandler);

// Refunds
router.get("/admin/refunds", getPendingRefundsHandler);
router.patch("/admin/payments/:paymentId/refund", markRefundedHandler);

// Payouts to organizers
router.get("/admin/payouts", getPayoutHistoryHandler);
router.get("/admin/payouts/history", getPayoutHistoryHandler);
router.get("/admin/payouts/summary", getPayoutSummaryHandler);
router.post("/admin/payouts/release", releasePayoutHandler);

export default router;
