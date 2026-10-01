import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRouter from "./modules/auth/auth.route.js";
import eventRouter from "./modules/event/event.route.js";

export function bootstrap() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.get("/health", (_req: Request, res: Response) => {
        res.json({
            data: {
                status: "ok",
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            },
        });
    });

    app.get("/", (req: Request, res: Response) => {
        res.json({
            data: "Hello World",
        });
    });

    app.use("/api/auth", authRouter);
    app.use("/api", eventRouter);

    app.use(errorHandler);

    return app;
}
