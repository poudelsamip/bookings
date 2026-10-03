import { bootstrap } from "./app.js";
import { prisma } from "./lib/prisma.lib.js";
async function main() {
    console.log("CONNECTING TO DATABSE ...");
    await prisma.$connect();
    console.log("DATABASE CONNECTION ESTABLISHED");
    const app = bootstrap();
    const server = app.listen(3000, () => {
        console.log("SERVER RUNNING ON http://localhost:3000");
    });
    const shutdown = async (signal) => {
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
//# sourceMappingURL=server.js.map