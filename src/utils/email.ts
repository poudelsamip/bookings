import QRCode from "qrcode";
import { transporter } from "../lib/mailer.lib.js";
import { ENV } from "../config/env.config.js";

export interface TicketConfirmationData {
    to: string;
    userName: string;
    eventTitle: string;
    eventDate: Date;
    eventStartTime: Date;
    venueName?: string;
    venueAddress?: string;
    venueMapUrl?: string; // Venue.googleMaps
    orderId: string;
    tickets: {
        ticketTypeName: string;
        quantity: number;
        unitPrice: number;
        qrCodes: string[];
    }[];
    totalAmount: number;
}

interface FlatTicket {
    ticketTypeName: string;
    code: string;
    cid: string;
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

function flattenTickets(
    tickets: TicketConfirmationData["tickets"],
): FlatTicket[] {
    let index = 0;
    return tickets.flatMap((t) =>
        t.qrCodes.map((code) => ({
            ticketTypeName: t.ticketTypeName,
            code,
            cid: `qr-${index++}@ticketbro`,
        })),
    );
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

function buildTicketBlocksHtml(flat: FlatTicket[]): string {
    return flat
        .map(
            (t, i) => `
              <tr>
                <td style="padding:24px 0 20px;${i < flat.length - 1 ? "border-bottom:1px solid #dddddd;" : ""}">
                  <div style="${TEXT}font-weight:700;">${escapeHtml(t.ticketTypeName)}</div>
                  <div style="${TEXT}">Ticket code: <span style="font-family:Menlo,Consolas,monospace;">${escapeHtml(t.code)}</span></div>
                  <img src="cid:${t.cid}" alt="QR code ${escapeHtml(t.code)}" width="160" height="160"
                       style="display:block;margin-top:12px;border:1px solid #dddddd;border-radius:12px;" />
                </td>
              </tr>`,
        )
        .join("");
}

export function buildTicketConfirmationHtml(
    data: TicketConfirmationData,
    flat: FlatTicket[] = flattenTickets(data.tickets),
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

              <!-- Tickets -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #dddddd;">
                ${buildTicketBlocksHtml(flat)}
              </table>

              <!-- Note -->
              <p style="margin:8px 0 0;${MUTED}">
                Tickets can only be scanned once. Please do not share your QR code with others.
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
    const flat = flattenTickets(data.tickets);
    const html = buildTicketConfirmationHtml(data, flat);

    const attachments = await Promise.all(
        flat.map(async (t) => ({
            filename: `${t.cid.split("@")[0]}.png`,
            content: await QRCode.toBuffer(t.code, { width: 320, margin: 1 }),
            contentType: "image/png",
            cid: t.cid,
        })),
    );

    await transporter.sendMail({
        from: ENV.EMAIL_FROM,
        to: data.to,
        subject: `Booking confirmed – ${data.eventTitle}`,
        html,
        attachments,
    });
};
