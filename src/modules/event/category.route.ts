import { Router } from "express";
import { prisma } from "../../lib/prisma.lib.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import type { Request, Response } from "express";

const router = Router();

router.get(
    "/categories",
    asyncHandler(async (_req: Request, res: Response) => {
        const categories = await prisma.eventCategory.findMany({
            select: { id: true, name: true, slug: true },
            orderBy: { name: "asc" },
        });

        res.json({ success: true, data: { categories } });
    }),
);

export default router;
