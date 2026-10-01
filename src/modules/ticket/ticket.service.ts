import { EventStatus, OrderStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.lib.js";
import { AppError } from "../../utils/error.js";
import { PurchaseTicketInput } from "./ticket.schema.js";

export const holdTicket = async (
    userId: string,
    eventId: string,
    input: PurchaseTicketInput,
) => {
    return await prisma.$transaction(async (tx) => {
        const event = await tx.event.findUnique({ where: { id: eventId } });

        if (!event || event.status !== EventStatus.PUBLISHED) {
            throw new AppError(404, "Event not found");
        }

        const items = input.items;

        const orderItems: {
            ticketTypeId: string;
            quantity: number;
            unitPrice: number;
        }[] = [];

        let total = 0;

        for (const item of items) {
            const ticketType = await tx.ticketType.findFirst({
                where: {
                    id: item.ticketTypeId,
                    eventId,
                },
            });

            if (!ticketType) {
                throw new AppError(404, "Ticket type not found");
            }

            const available =
                ticketType.total - ticketType.sold - ticketType.held;

            if (item.quantity > available) {
                throw new AppError(
                    400,
                    `Only ${available} are available for ${ticketType.name}`,
                );
            }

            total += ticketType.price * item.quantity;

            await tx.ticketType.update({
                where: { id: ticketType.id },
                data: {
                    held: {
                        increment: item.quantity,
                    },
                },
            });

            orderItems.push({
                ticketTypeId: ticketType.id,
                quantity: item.quantity,
                unitPrice: ticketType.price,
            });
        }

        const order = await tx.order.create({
            data: {
                userId,
                eventId,
                total,
                status: OrderStatus.PENDING,
                items: {
                    createMany: {
                        data: orderItems,
                    },
                },
            },
        });

        return order;
    });
};
