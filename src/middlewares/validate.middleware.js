export const validateZod = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            if (validatedData.body)
                req.body = validatedData.body;
            if (validatedData.query) {
                Object.defineProperty(req, "query", {
                    value: validatedData.query,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            }
            if (validatedData.params) {
                Object.defineProperty(req, "params", {
                    value: validatedData.params,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            }
            next();
        }
        catch (error) {
            console.error(`[ZodValidation Failed] on ${req.method} ${req.originalUrl}`);
            next(error);
        }
    };
};
//# sourceMappingURL=validate.middleware.js.map