import { Queue, type JobsOptions } from "bullmq";
import { redis } from "../lib/redis.lib.js";
import type { StaffInviteEmailData } from "../utils/staff-email.js";

export interface TicketConfirmationJobData {
    orderId: string;
}

export type StaffInviteJobData = StaffInviteEmailData;

export type EmailJobName = "ticket-confirmation" | "staff-invite";

export interface EmailJobMap {
    "ticket-confirmation": TicketConfirmationJobData;
    "staff-invite": StaffInviteJobData;
}

export type EmailJobData = EmailJobMap[EmailJobName];

export const EMAIL_QUEUE_NAME = "email";

export const emailQueue = new Queue<EmailJobData, any, EmailJobName>(
    EMAIL_QUEUE_NAME,
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

export const addEmailJob = async <T extends EmailJobName>(
    name: T,
    data: EmailJobMap[T],
    opts?: JobsOptions,
) => {
    return await emailQueue.add(name, data, opts);
};
