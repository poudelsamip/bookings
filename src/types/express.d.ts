import { TokenPaylod } from "../lib/jwt.lib.js";

declare global {
    namespace Express {
        interface Request {
            user?: TokenPaylod;
        }
    }
}

export {};
