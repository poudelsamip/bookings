import { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { getOrgEventBySlug, listOrgEvents } from "./organizer.service.js";

export const orgEventController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const orgId = req.user!.orgId!;

        const events = await listOrgEvents(orgId, userId);

        return res.status(200).json({ data: events });
    },
);

export const orgEventBySlugController = asyncHandler(
    async (req: Request<{ slug: string }>, res: Response) => {
        const userId = req.user!.userId;
        const orgId = req.user!.orgId!;
        const slug = req.params.slug;

        const event = await getOrgEventBySlug(slug, orgId, userId);

        return res.status(200).json({ data: event });
    },
);
