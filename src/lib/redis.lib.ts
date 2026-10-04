import { Redis } from "ioredis";
import { ENV } from "../config/env.config.js";

export const redis = new Redis(ENV.REDIS_URL, {
    maxRetriesPerRequest: null,
});

redis.on("connect", () => {
    console.log("Redis Connected");
});
redis.on("error", (err) => {
    console.log("Redis Error : ", err);
});
