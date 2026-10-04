import { prisma } from "../lib/prisma.lib.js";
import { addOrderExpiryJob } from "../queues/order-expiry.queue.js";

export const processOrderExpiry = async (orderId: string) => {
    await prisma.$transaction(async (tx) => {
        // get latest order
        const currentOrder = await tx.order.findUnique({
            where: { id: orderId },
            include: { items: true, payments: true },
        });

        if (!currentOrder || currentOrder.status !== "PENDING") {
            return;
        }

        if (currentOrder.payments && currentOrder.payments.length !== 0) {
            for (const payment of currentOrder.payments) {
                if (payment.status === "SUCCESS") {
                    await tx.payment.update({
                        where: { id: payment.id },
                        data: { status: "NEED_REFUND" },
                    });
                }
            }
        }

        // release hold from each ticket type
        for (const item of currentOrder.items) {
            await tx.ticketType.update({
                where: { id: item.ticketTypeId },
                data: {
                    held: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        // expire order
        await tx.order.update({
            where: { id: currentOrder.id },
            data: { status: "EXPIRED" },
        });

        console.log(`Order ID: ${currentOrder.id} set to EXPIRED`);
    });
};

export const syncPendingOrderExpiryJobs = async () => {
    try {
        const pendingOrders = await prisma.order.findMany({
            where: {
                status: "PENDING",
            },
            select: {
                id: true,
                expiresAt: true,
            },
        });

        for (const order of pendingOrders) {
            const delay = Math.max(0, order.expiresAt.getTime() - Date.now());
            await addOrderExpiryJob(order.id, delay);
        }

        if (pendingOrders.length > 0) {
            console.log(
                `Synced ${pendingOrders.length} pending order expiry job(s) to BullMQ`,
            );
        }
    } catch (err) {
        console.error("Failed to sync pending order expiry jobs:", err);
    }
};
