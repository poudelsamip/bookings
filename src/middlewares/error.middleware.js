import { ZodError } from "zod";
import { AppError } from "../utils/error.js";
export const errorHandler = (err, _req, res, _next) => {
    console.log(err);
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: err.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }
    if (err instanceof AppError) {
        return res.status(err.status).json({
            success: false,
            message: err.message,
        });
    }
    return res.status(500).json({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
    });
};
//# sourceMappingURL=error.middleware.js.map