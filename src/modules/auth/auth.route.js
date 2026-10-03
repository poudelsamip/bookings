import { Router } from "express";
import { validateZod } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { registerHandler, loginHandler, meHandler, refreshHandler, logoutHandler, } from "./auth.controller.js";
const router = Router();
router.post("/register", validateZod(registerSchema), registerHandler);
router.post("/login", validateZod(loginSchema), loginHandler);
router.get("/me", authenticate, meHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", authenticate, logoutHandler);
export default router;
//# sourceMappingURL=auth.route.js.map