import { Worker } from "bullmq";
import { redis } from "../lib/redis.lib.js";
import {
    ORDER_EXPIRY_QUEUE_NAME,
    OrderExpiryJobData,
} from "../queues/order-expiry.queue.js";
import { processOrderExpiry } from "../jobs/expireOrder.js";

export const orderExpiryWorker = new Worker<OrderExpiryJobData>(
    ORDER_EXPIRY_QUEUE_NAME,
    async (job) => {
        const { orderId } = job.data;
        console.log(
            `[OrderExpiryWorker] Processing expiry for order ${orderId} (job: ${job.id})`,
        );
        await processOrderExpiry(orderId);
    },
    {
        connection: redis,
    },
);

orderExpiryWorker.on("completed", (job) => {
    console.log(`[OrderExpiryWorker] Job ${job.id} completed`);
});

orderExpiryWorker.on("failed", (job, err) => {
    console.error(`[OrderExpiryWorker] Job ${job?.id} failed:`, err.message);
});

orderExpiryWorker.on("error", (err) => {
    console.error("[OrderExpiryWorker] Worker error:", err);
});
