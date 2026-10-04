import { transporter } from "../lib/mailer.lib.js";
import { ENV } from "../config/env.config.js";
import { prisma } from "../lib/prisma.lib.js";

export interface TicketConfirmationData {
    to: string;
    userName: string;
    eventTitle: string;
    eventDate: Date;
    eventStartTime: Date;
    venueName?: string;
    venueAddress?: string;
    venueMapUrl?: string;
    orderId: string;
    tickets: {
        ticketTypeName: string;
        quantity: number;
        unitPrice: number;
    }[];
    totalAmount: number;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

const TEXT = "font-size:14px;line-height:1.6;color:#111111;";
const MUTED = "font-size:13px;line-height:1.5;color:#666666;";

function buildEventDetailsHtml(data: TicketConfirmationData): string {
    const lines: string[] = [
        `<strong>${escapeHtml(data.eventTitle)}</strong>`,
        `Date: ${escapeHtml(formatDate(data.eventDate))}, ${escapeHtml(formatTime(data.eventStartTime))}`,
    ];

    if (data.venueName) lines.push(`Venue: ${escapeHtml(data.venueName)}`);
    if (data.venueAddress)
        lines.push(`Address: ${escapeHtml(data.venueAddress)}`);
    if (data.venueMapUrl && /^https?:\/\//i.test(data.venueMapUrl)) {
        lines.push(
            `Map: <a href="${escapeHtml(data.venueMapUrl)}" style="color:#1a56db;">View on Google Maps</a>`,
        );
    }

    return lines.join("<br/>");
}

function buildTicketCountsHtml(
    tickets: TicketConfirmationData["tickets"],
): string {
    return tickets
        .map((t) => `${escapeHtml(t.ticketTypeName)}: ${t.quantity}`)
        .join("<br/>");
}

export function buildTicketConfirmationHtml(
    data: TicketConfirmationData,
): string {
    const firstName = escapeHtml(data.userName.split(" ")[0] ?? "");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;color:#111111;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;border:1px solid #dddddd;">
          <tr>
            <td style="padding:28px 32px;">

              <!-- Header -->
              <p style="margin:0 0 24px;text-align:center;font-size:20px;font-weight:800;letter-spacing:1px;color:#111111;">TICKET BRO</p>

              <!-- Greeting -->
              <p style="margin:0 0 20px;${TEXT}">
                Hey ${firstName},<br/>
                Your tickets for <strong>${escapeHtml(data.eventTitle)}</strong> have been confirmed.
              </p>

              <!-- Event details -->
              <p style="margin:0 0 20px;${TEXT}">${buildEventDetailsHtml(data)}</p>

              <!-- Ticket counts -->
              <p style="margin:0;${TEXT}">
                <strong>Tickets details:</strong><br/>
                ${buildTicketCountsHtml(data.tickets)}
              </p>

              <!-- CTA -->
              <p style="margin:24px 0 0;${TEXT}">
                Please login to <strong>Ticket Bro</strong> to get your tickets.
              </p>
              <p style="margin:16px 0 0;text-align:center;">
                <a href="${ENV.CLIENT_URL}" style="display:inline-block;padding:12px 32px;background:#111111;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">Open Ticket Bro</a>
              </p>

              <!-- Note -->
              <p style="margin:16px 0 0;${MUTED}">
                Need help? Reply to this email.
              </p>

            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#999999;">&copy; ${new Date().getFullYear()} Ticket Bro. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const sendTicketConfirmationEmail = async (
    data: TicketConfirmationData,
) => {
    const html = buildTicketConfirmationHtml(data);

    await transporter.sendMail({
        from: ENV.EMAIL_FROM,
        to: data.to,
        subject: `Booking confirmed – ${data.eventTitle}`,
        html,
    });
};

export const processTicketConfirmation = async (orderId: string) => {
    const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
            user: true,
            event: { include: { venue: true } },
            tickets: { include: { ticketType: true } },
        },
    });

    // Group tickets by type
    const groupedMap = new Map<
        string,
        { name: string; unitPrice: number; count: number }
    >();

    for (const ticket of order.tickets) {
        const key = ticket.ticketTypeId;
        if (!groupedMap.has(key)) {
            groupedMap.set(key, {
                name: ticket.ticketType.name,
                unitPrice: ticket.ticketType.price,
                count: 0,
            });
        }
        groupedMap.get(key)!.count++;
    }

    const tickets = Array.from(groupedMap.values()).map((g) => ({
        ticketTypeName: g.name,
        quantity: g.count,
        unitPrice: g.unitPrice,
    }));

    const venue = order.event.venue;

    await sendTicketConfirmationEmail({
        to: order.user.email,
        userName: order.user.fullName ?? order.user.email,
        eventTitle: order.event.title,
        eventDate: order.event.date,
        eventStartTime: order.event.startTime,
        venueName: venue?.name || "",
        venueAddress: venue?.address || "",
        venueMapUrl: venue?.googleMaps || "",
        orderId: order.id,
        tickets,
        totalAmount: order.total,
    });
};
