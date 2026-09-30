import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),

    DATABASE_URL: z.url("DATABASE_URL is missing or invalid"),

    ACCESS_TOKEN_SECRET: z.string("ACCESS_TOKEN_SECRET is missing"),
    REFRESH_TOKEN_SECRET: z.string("REFRESH_TOKEN_SECRET is missing"),
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
