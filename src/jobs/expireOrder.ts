import { prisma } from "../lib/prisma.lib.js";

export const expireOrder = async () => {
    const expiredOrders = await prisma.order.findMany({
        where: {
            status: "PENDING",
            expiresAt: {
                lte: new Date(),
            },
        },
    });

    for (const order of expiredOrders) {
        await prisma.$transaction(async (tx) => {
            // get latest order
            const currentOrder = await tx.order.findUnique({
                where: { id: order.id },
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
    }
};
