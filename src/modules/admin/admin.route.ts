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
router.get("/stats", getDashboardStatsHandler);

// Events
router.get("/events", getAllEventsHandler);
router.patch("/events/:eventId/status", updateEventStatusHandler);

// Users
router.get("/users", getAllUsersHandler);

// Payments (full list + grouped views)
router.get("/payments", getAllPaymentsHandler);
router.get("/payments/by-event", getPaymentsByEventHandler);
router.get("/payments/by-organizer", getPaymentsByOrganizerHandler);

// Refunds
router.get("/refunds", getPendingRefundsHandler);
router.patch("/payments/:paymentId/refund", markRefundedHandler);

// Payouts to organizers
router.get("/payouts", getPayoutHistoryHandler);
router.get("/payouts/history", getPayoutHistoryHandler);
router.get("/payouts/summary", getPayoutSummaryHandler);
router.post("/payouts/release", releasePayoutHandler);

export default router;
