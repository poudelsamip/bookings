import { TokenPaylod } from "../lib/jwt.lib.ts";

declare global {
    namespace Express {
        interface Request {
            user?: TokenPaylod;
        }
    }
}

export {};
