import { Queue, type JobsOptions } from "bullmq";
import { redis } from "../lib/redis.lib.js";

export interface OrderExpiryJobData {
    orderId: string;
}

export const ORDER_EXPIRY_QUEUE_NAME = "order-expiry";

export const orderExpiryQueue = new Queue<OrderExpiryJobData>(
    ORDER_EXPIRY_QUEUE_NAME,
    {
        connection: redis,
        defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: false,
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000,
            },
        },
    },
);

export const addOrderExpiryJob = async (
    orderId: string,
    delayMs: number,
    opts?: JobsOptions,
) => {
    return await orderExpiryQueue.add(
        "expire-order",
        { orderId },
        {
            delay: Math.max(0, delayMs),
            jobId: `order-expire-${orderId}`,
            ...opts,
        },
    );
};

export const cancelOrderExpiryJob = async (orderId: string) => {
    try {
        const job = await orderExpiryQueue.getJob(`order-expire-${orderId}`);
        if (job) {
            await job.remove();
        }
    } catch (err) {
        console.error(
            `Failed to cancel order expiry job for order ${orderId}:`,
            err,
        );
    }
};
