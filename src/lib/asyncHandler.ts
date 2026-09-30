import type { NextFunction, Request, Response } from "express";

type AsyncRouteHandler<Req> = (
    req: Req,
    res: Response,
    next: NextFunction,
) => Promise<unknown>;

export function asyncHandler<Req = Request>(handler: AsyncRouteHandler<Req>) {
    return (req: Request, res: Response, next: NextFunction) => {
        handler(req as unknown as Req, res, next).catch(next);
    };
}
