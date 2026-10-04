import { redis } from "../../lib/redis.lib.js";

const EVENT_CACHE_TTL = 10 * 60;
export const getCachedEvent = async (eventSlug: string) => {
    const data = await redis.get(`event:${eventSlug}`);

    return data ? JSON.parse(data) : null;
};

export const cacheEvent = async (eventSlug: string, event: unknown) => {
    await redis.set(
        `event:${eventSlug}`,
        JSON.stringify(event),
        "EX",
        EVENT_CACHE_TTL,
    );
};

export const deleteCache = async (eventSlug: string) => {
    await redis.del(`event:${eventSlug}`);
};
