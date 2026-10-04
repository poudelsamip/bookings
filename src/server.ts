import { bootstrap } from "./app.js";
import { ENV } from "./config/env.config.js";
import { expireOrder } from "./jobs/expireOrder.js";
import { prisma } from "./lib/prisma.lib.js";
import cron from "node-cron";

async function main() {
    console.log("CONNECTING TO DATABSE ...");
    await prisma.$connect();
    console.log("DATABASE CONNECTION ESTABLISHED");

    cron.schedule("* * * * *", expireOrder);

    const app = bootstrap();
    const server = app.listen(ENV.PORT, () => {
        console.log(`SERVER RUNNING ON http://localhost:${ENV.PORT}`);
    });

    const shutdown = async (signal: string) => {
        console.log("SHUTTING DOWN SERVER");
        server.close(async () => {
            await prisma.$disconnect();
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
