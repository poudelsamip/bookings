import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is missing or invalid"),

    ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is missing"),
    REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is missing"),

    MERCHANT_ID: z.string().min(1, "MERCHANT_ID is missing"),
    SECRET: z.string().min(1, "eSEWA secret is missing"),

    SUCCESS_URL: z.string().min(1, "SUCCESS_URL is missing or invalid"),
    FAILURE_URL: z.string().min(1, "FAILURE_URL is missing or invalid"),

    SMTP_HOST: z.string().min(1, "SMTP_HOST is missing"),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().min(1, "SMTP_USER is missing"),
    SMTP_PASS: z.string().min(1, "SMTP_PASS is missing"),
    EMAIL_FROM: z.string().default("Ticket App <no-reply@ticketapp.com>"),

    REDIS_URL: z.string().min(1, "REDIS_URL is missing"),

    CLIENT_URL: z.string().min(1, "CLIENT_URL is missing"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        const issues = parsed.error.issues
            .map((issue) => ` - ${issue.path.join(".")}: ${issue.message}`)
            .join("\n");

        throw new Error(
            `Invalid Environment Variable Configuration: \n${issues}`,
        );
    }

    return parsed.data;
}

export const ENV = loadEnv();
