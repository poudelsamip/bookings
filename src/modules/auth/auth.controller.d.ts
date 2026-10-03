import type { Request, Response } from "express";
export declare const REFRESH_COOKIE = "refreshToken";
export declare const COOKIE_OPTIONS: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge: number;
};
export declare const registerHandler: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const loginHandler: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const meHandler: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const refreshHandler: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const logoutHandler: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=auth.controller.d.ts.map