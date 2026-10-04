import { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as staffService from "./staff.service.js";
import type {
    InviteStaffInput,
    AcceptInviteInput,
    ScanTicketInput,
} from "./staff.schema.js";

export const inviteStaffHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const input = req.body as InviteStaffInput;
        const organizerId = req.user!.orgId!;

        const result = await staffService.inviteStaff(input, organizerId);

        res.status(200).json({ success: true, data: result });
    },
);

export const acceptInviteHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const input = req.body as AcceptInviteInput;
        const result = await staffService.acceptInvite(input);

        res.status(200).json({ success: true, data: result });
    },
);

export const listStaffHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const organizerId = req.user!.orgId!;
        const staff = await staffService.listStaff(organizerId);

        res.status(200).json({ success: true, data: { staff } });
    },
);

export const listPendingInvitesHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const organizerId = req.user!.orgId!;
        const invites = await staffService.listPendingInvites(organizerId);

        res.status(200).json({ success: true, data: { invites } });
    },
);

export const removeStaffHandler = asyncHandler(
    async (req: Request<{ staffId: string }>, res: Response) => {
        const organizerId = req.user!.orgId!;
        const { staffId } = req.params;

        const result = await staffService.removeStaff(staffId, organizerId);

        res.status(200).json({ success: true, data: result });
    },
);

export const scanTicketHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { qrCode } = req.body as ScanTicketInput;
        const organizerId = req.user!.orgId!;

        const result = await staffService.scanTicket(qrCode, organizerId);

        res.status(200).json({ success: true, data: result });
    },
);

export const getEventScanStatsHandler = asyncHandler(
    async (req: Request<{ eventId: string }>, res: Response) => {
        const organizerId = req.user!.orgId!;
        const { eventId } = req.params;

        const stats = await staffService.getEventScanStats(eventId, organizerId);

        res.status(200).json({ success: true, data: { ticketTypes: stats } });
    },
);
