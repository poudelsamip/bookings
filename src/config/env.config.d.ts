import "dotenv/config";
import { z } from "zod";
declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DATABASE_URL: z.ZodString;
    ACCESS_TOKEN_SECRET: z.ZodString;
    REFRESH_TOKEN_SECRET: z.ZodString;
    MERCHANT_ID: z.ZodString;
    SECRET: z.ZodString;
    SUCCESS_URL: z.ZodString;
    FAILURE_URL: z.ZodString;
    SMTP_HOST: z.ZodString;
    SMTP_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    SMTP_USER: z.ZodString;
    SMTP_PASS: z.ZodString;
    EMAIL_FROM: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
export declare const ENV: {
    PORT: number;
    DATABASE_URL: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    MERCHANT_ID: string;
    SECRET: string;
    SUCCESS_URL: string;
    FAILURE_URL: string;
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USER: string;
    SMTP_PASS: string;
    EMAIL_FROM: string;
};
export {};
//# sourceMappingURL=env.config.d.ts.map