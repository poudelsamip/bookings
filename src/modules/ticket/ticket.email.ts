import { prisma } from "../../lib/prisma.lib.js";
import {
    sendTicketConfirmationEmail,
    type TicketConfirmationData,
} from "../../utils/email.js";

async function buildTicketEmailData(
    orderId: string,
): Promise<TicketConfirmationData> {
    const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
            user: true,
            event: {
                include: { venue: true },
            },
            tickets: {
                include: { ticketType: true },
            },
        },
    });

    // Group tickets by ticketType
    const groupedMap = new Map<
        string,
        { name: string; unitPrice: number; qrCodes: string[] }
    >();

    for (const ticket of order.tickets) {
        const key = ticket.ticketTypeId;
        if (!groupedMap.has(key)) {
            groupedMap.set(key, {
                name: ticket.ticketType.name,
                unitPrice: ticket.ticketType.price,
                qrCodes: [],
            });
        }
        groupedMap.get(key)!.qrCodes.push(ticket.qrCode);
    }

    const tickets = Array.from(groupedMap.values()).map((g) => ({
        ticketTypeName: g.name,
        quantity: g.qrCodes.length,
        unitPrice: g.unitPrice,
        qrCodes: g.qrCodes,
    }));

    return {
        to: order.user.email,
        userName: order.user.fullName ?? order.user.email,
        eventTitle: order.event.title,
        eventDate: order.event.date,
        eventStartTime: order.event.startTime,
        ...(order.event.venue?.name && { venueName: order.event.venue.name }),
        ...(order.event.venue?.address && {
            venueAddress: order.event.venue.address,
        }),
        orderId: order.id,
        tickets,
        totalAmount: order.total,
    };
}

export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
    const data = await buildTicketEmailData(orderId);
    await sendTicketConfirmationEmail(data);
}
