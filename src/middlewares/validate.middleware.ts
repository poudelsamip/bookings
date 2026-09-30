import type { NextFunction, Request, Response } from "express";

export const validateZod = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            req.body = validatedData.body;
            next();
        } catch (error) {
            console.error(
                `[ZodValidation Failed] on ${req.method} ${req.originalUrl}`,
            );

            next(error);
        }
    };
};
