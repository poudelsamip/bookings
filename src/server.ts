import { bootstrap } from "./app.js";
import { ENV } from "./config/env.config.js";
import { syncPendingOrderExpiryJobs } from "./jobs/expireOrder.js";
import { prisma } from "./lib/prisma.lib.js";
import { emailQueue } from "./queues/email.queue.js";
import { orderExpiryQueue } from "./queues/order-expiry.queue.js";
import { emailWorker } from "./workers/email.worker.js";
import { orderExpiryWorker } from "./workers/order-expiry.worker.js";

async function main() {
    console.log("CONNECTING TO DATABASE ...");
    await prisma.$connect();
    console.log("DATABASE CONNECTION ESTABLISHED");

    // Sync any existing pending orders with BullMQ delayed queue
    await syncPendingOrderExpiryJobs();

    const app = bootstrap();
    const server = app.listen(ENV.PORT, () => {
        console.log(`SERVER RUNNING ON http://localhost:${ENV.PORT}`);
    });

    const shutdown = async (signal: string) => {
        console.log(`SHUTTING DOWN SERVER (${signal}) ...`);
        server.close(async () => {
            try {
                await Promise.allSettled([
                    emailWorker.close(),
                    orderExpiryWorker.close(),
                    emailQueue.close(),
                    orderExpiryQueue.close(),
                ]);
            } catch (err) {
                console.error("Error closing workers or queues:", err);
            }

            await prisma.$disconnect();
            console.log("SERVER SHUTDOWN COMPLETE");
            process.exit(0);
        });
    };

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
    console.log("ERROR DURING STARTUP:");
    console.log(err);
    process.exit(1);
});
