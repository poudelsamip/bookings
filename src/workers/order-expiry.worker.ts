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
        const attempt = job.attemptsMade + 1;
        const maxAttempts = job.opts.attempts || 1;
        console.log(
            `[OrderExpiryWorker] Processing expiry for order ${orderId} (job: ${job.id}, attempt: ${attempt}/${maxAttempts})`,
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
    const attemptsMade = job?.attemptsMade ?? 0;
    const maxAttempts = job?.opts?.attempts ?? 1;

    if (attemptsMade < maxAttempts) {
        console.warn(
            `[OrderExpiryWorker] Job ${job?.id} failed attempt ${attemptsMade}/${maxAttempts}. Will retry. Error: ${err.message}`,
        );
    } else {
        console.error(
            `[OrderExpiryWorker] Job ${job?.id} failed permanently after ${attemptsMade} attempts:`,
            err.message,
        );
    }
});

orderExpiryWorker.on("error", (err) => {
    console.error("[OrderExpiryWorker] Worker error:", err);
});
