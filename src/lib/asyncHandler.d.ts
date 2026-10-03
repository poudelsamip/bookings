import type { NextFunction, Request, Response } from "express";
type AsyncRouteHandler<Req> = (req: Req, res: Response, next: NextFunction) => Promise<unknown>;
export declare function asyncHandler<Req = Request>(handler: AsyncRouteHandler<Req>): (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=asyncHandler.d.ts.map