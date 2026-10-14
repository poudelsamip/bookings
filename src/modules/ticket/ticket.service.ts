import type { Prisma } from "../../generated/prisma/client.js";
import { EventStatus, OrderStatus } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.lib.js";
import { AppError } from "../../utils/error.js";
import { generateQrToken } from "../../utils/ticketToken.js";
import { PurchaseTicketInput } from "./ticket.schema.js";
import { addEmailJob } from "../../queues/email.queue.js";
import { addOrderExpiryJob } from "../../queues/order-expiry.queue.js";

export const holdTicket = async (
    userId: string,
    eventId: string,
    input: PurchaseTicketInput,
) => {
    const order = await prisma.$transaction(async (tx) => {
        // idempotency check, return existing pending order for this (user, event)
        const existingOrder = await tx.order.findFirst({
            where: {
                userId,
                eventId,
                status: OrderStatus.PENDING,
                expiresAt: { gt: new Date() },
            },
        });

        if (existingOrder) {
            return existingOrder;
        }

        const event = await tx.event.findUnique({ where: { id: eventId } });

        if (!event || event.status !== EventStatus.PUBLISHED) {
            throw new AppError(404, "Event not found");
        }

        // block purchases for events that have already passed
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (event.date < today) {
            throw new AppError(400, "Cannot purchase tickets for a past event");
        }

        const items = input.items;

        const orderItems: {
            ticketTypeId: string;
            quantity: number;
            unitPrice: number;
        }[] = [];

        let total = 0;

        for (const item of items) {
            const updated = await tx.$executeRaw`
                UPDATE "ticket_type"
                SET held = held + ${item.quantity}
                WHERE id = ${item.ticketTypeId}
                  AND "event_id" = ${eventId}
                  AND (total - sold - held) >= ${item.quantity}
            `;

            if (updated === 0) {
                // either the ticket type doesnt exist for this event or there arent
                // enough seats left. fetch the row to give a precise error
                const ticketType = await tx.ticketType.findFirst({
                    where: { id: item.ticketTypeId, eventId },
                });

                if (!ticketType) {
                    throw new AppError(404, "Ticket type not found");
                }

                const available =
                    ticketType.total - ticketType.sold - ticketType.held;
                throw new AppError(
                    400,
                    `Only ${available} are available for ${ticketType.name}`,
                );
            }

            const ticketType = await tx.ticketType.findUniqueOrThrow({
                where: { id: item.ticketTypeId },
                select: { price: true },
            });

            total += ticketType.price * item.quantity;
            orderItems.push({
                ticketTypeId: item.ticketTypeId,
                quantity: item.quantity,
                unitPrice: ticketType.price,
            });
        }

        const newOrder = await tx.order.create({
            data: {
                userId,
                eventId,
                total,
                status: OrderStatus.PENDING,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                items: {
                    createMany: { data: orderItems },
                },
            },
        });

        return newOrder;
    });

    const delayMs = Math.max(0, order.expiresAt.getTime() - Date.now());
    await addOrderExpiryJob(order.id, delayMs);

    return order;
};

type TxClient = Prisma.TransactionClient;

type OrderItem = {
    ticketTypeId: string;
    quantity: number;
};

export const issueTickets = async (
    tx: TxClient,
    userId: string,
    orderId: string,
    eventId: string,
    items: OrderItem[],
) => {
    for (const item of items) {
        const ticketData = Array.from({ length: item.quantity }, () => ({
            orderId,
            userId,
            ticketTypeId: item.ticketTypeId,
            eventId,
            qrCode: generateQrToken(),
        }));

        await tx.ticket.createMany({ data: ticketData });

        await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: {
                held: { decrement: item.quantity },
                sold: { increment: item.quantity },
            },
        });
    }

    // await addEmailJob("ticket-confirmation", { orderId });

    // sendOrderConfirmationEmail(orderId).catch((err) =>
    //     console.error("[issueTickets] Failed to send confirmation email:", err),
    // );
};

export const releaseHeldTickets = async (tx: TxClient, items: OrderItem[]) => {
    for (const item of items) {
        await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: {
                held: { decrement: item.quantity },
            },
        });
    }
};

export const getMyPurchasedEvents = async (userId: string) => {
    const tickets = await prisma.ticket.findMany({
        where: { userId, status: "VALID" },
        select: {
            event: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    status: true,
                    venue: { select: { district: true, address: true } },
                },
            },
            ticketType: { select: { name: true } },
        },
    });

    const eventMap = new Map<
        string,
        {
            id: string;
            title: string;
            slug: string;
            status: string;
            venue: { district: string; address: string } | null;
            counts: Map<string, number>;
        }
    >();

    for (const { event, ticketType } of tickets) {
        let entry = eventMap.get(event.id);
        if (!entry) {
            entry = { ...event, counts: new Map() };
            eventMap.set(event.id, entry);
        }
        entry.counts.set(
            ticketType.name,
            (entry.counts.get(ticketType.name) ?? 0) + 1,
        );
    }

    return Array.from(eventMap.values()).map(({ counts, ...event }) => ({
        ...event,
        tickets: Array.from(counts, ([name, quantity]) => ({ name, quantity })),
    }));
};

export const getEventTickets = async (userId: string, eventId: string) => {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
            id: true,
            title: true,
            slug: true,
            date: true,
            seatingType: true,
            organizer: {
                select: {
                    orgName: true,
                },
            },
            category: {
                select: {
                    name: true,
                    slug: true,
                },
            },
            venue: true,
        },
    });

    if (!event) {
        throw new AppError(404, "Event not found");
    }

    const rows = await prisma.ticket.findMany({
        where: { userId, eventId, status: "VALID" },
        select: {
            id: true,
            qrCode: true,
            ticketType: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    const tickets = rows
        .map((t) => ({
            id: t.id,
            qrCode: t.qrCode,
            ticketTypeId: t.ticketType.id,
            ticketType: t.ticketType.name,
        }))
        .sort(
            (a, b) =>
                a.ticketType.localeCompare(b.ticketType, undefined, {
                    sensitivity: "base",
                }) || a.id.localeCompare(b.id),
        );

    return { event, tickets };
};
