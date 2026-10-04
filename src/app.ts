import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRouter from "./modules/auth/auth.route.js";
import eventRouter from "./modules/event/event.route.js";
import categoryRouter from "./modules/event/category.route.js";
import paymentRouter from "./modules/payment/payment.route.js";
import ticketRouter from "./modules/ticket/ticket.route.js";
import organizerRouter from "./modules/organizer/organizer.route.js";
import staffRouter from "./modules/staff/staff.route.js";

export function bootstrap() {
    const app = express();

    app.use(
        cors({
            origin: [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
            ],
            credentials: true,
        }),
    );
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
    app.use("/api", categoryRouter);
    app.use("/api/payment", paymentRouter);
    app.use("/api", ticketRouter);
    app.use("/api", organizerRouter);
    app.use("/api", staffRouter);

    app.use(errorHandler);

    return app;
}
