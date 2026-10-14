import { Worker, type Job } from "bullmq";
import { redis } from "../lib/redis.lib.js";
import { processTicketConfirmation } from "../utils/user-email.js";
import { sendStaffInviteEmail } from "../utils/staff-email.js";
import {
    EMAIL_QUEUE_NAME,
    type EmailJobData,
    type EmailJobName,
    type StaffInviteJobData,
    type TicketConfirmationJobData,
} from "../queues/email.queue.js";

export const emailWorker = new Worker<EmailJobData, void, EmailJobName>(
    EMAIL_QUEUE_NAME,
    async (job: Job<EmailJobData, void, EmailJobName>) => {
        if (job.name === "staff-invite") {
            const data = job.data as StaffInviteJobData;
            await sendStaffInviteEmail(data);
            return;
        }

        if (job.name === "ticket-confirmation") {
            const data = job.data as TicketConfirmationJobData;
            await processTicketConfirmation(data.orderId);
            return;
        }
    },
    {
        connection: redis,
        concurrency: 5,
    },
);

emailWorker.on("completed", (job) => {
    console.log(`[EmailWorker] Job ${job.id} (${job.name}) completed`);
});

emailWorker.on("failed", (job, err) => {
    console.error(`[EmailWorker] Job ${job?.id} (${job?.name}) failed:`, err.message);
});

emailWorker.on("error", (err) => {
    console.error("[EmailWorker] Worker error:", err);
});
