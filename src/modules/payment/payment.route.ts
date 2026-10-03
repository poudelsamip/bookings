import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateZod } from "../../middlewares/validate.middleware.js";
import { paymentSchema } from "./payment.schema.js";
import {
    initiateEsewaPaymentController,
    esewaSuccessController,
    esewaFailureController,
    paymentInfoController,
} from "./payment.controller.js";

const router = Router();

router.get("/esewa/success", esewaSuccessController);
router.get("/esewa/failure", esewaFailureController);

router.post(
    "/:orderId",
    authenticate,
    validateZod(paymentSchema),
    initiateEsewaPaymentController,
);

router.get("/:paymentId", authenticate, paymentInfoController);

export default router;
