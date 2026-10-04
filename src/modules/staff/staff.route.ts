import { Router } from "express";
import {
    authenticate,
    requireOrganizer,
    requireStaff,
} from "../../middlewares/auth.middleware.js";
import { validateZod } from "../../middlewares/validate.middleware.js";
import {
    inviteStaffSchema,
    acceptInviteSchema,
    scanTicketSchema,
} from "./staff.schema.js";
import {
    inviteStaffHandler,
    acceptInviteHandler,
    listStaffHandler,
    listPendingInvitesHandler,
    removeStaffHandler,
    scanTicketHandler,
    getEventScanStatsHandler,
} from "./staff.controller.js";

const router = Router();

router.post(
    "/staff/accept-invite",
    validateZod(acceptInviteSchema),
    acceptInviteHandler,
);

router.post(
    "/staff/scan",
    authenticate,
    requireStaff,
    validateZod(scanTicketSchema),
    scanTicketHandler,
);

router.post(
    "/organizer/staff/invite",
    authenticate,
    requireOrganizer,
    validateZod(inviteStaffSchema),
    inviteStaffHandler,
);

router.get(
    "/organizer/staff",
    authenticate,
    requireOrganizer,
    listStaffHandler,
);

router.get(
    "/organizer/staff/invites",
    authenticate,
    requireOrganizer,
    listPendingInvitesHandler,
);

router.delete(
    "/organizer/staff/:staffId",
    authenticate,
    requireOrganizer,
    removeStaffHandler,
);

router.get(
    "/organizer/events/:eventId/scan-stats",
    authenticate,
    requireOrganizer,
    getEventScanStatsHandler,
);

export default router;
