import crypto from "crypto";
import { prisma } from "../../lib/prisma.lib.js";
import { transporter } from "../../lib/mailer.lib.js";
import { hashPassword } from "../../lib/password.lib.js";
import { generateInviteToken, verifyInviteToken } from "../../lib/jwt.lib.js";
import { AppError } from "../../utils/error.js";
import { ENV } from "../../config/env.config.js";
import type { InviteStaffInput, AcceptInviteInput } from "./staff.schema.js";

export const inviteStaff = async (
    input: InviteStaffInput,
    organizerId: string,
) => {
    const organizer = await prisma.organizer.findUnique({
        where: { id: organizerId },
    });
    if (!organizer) throw new AppError(404, "Organizer not found");

    // Check if user already exists and is staff for this org
    const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
        include: { staffEntries: { where: { organizerId } } },
    });

    if (existingUser?.staffEntries.length) {
        throw new AppError(
            409,
            "This user is already a staff member of your organization",
        );
    }

    // Check for existing pending invite
    const existingInvite = await prisma.staffInvite.findFirst({
        where: {
            email: input.email,
            organizerId,
            status: "PENDING",
            expiresAt: { gt: new Date() },
        },
    });
    if (existingInvite) {
        throw new AppError(
            409,
            "A pending invite already exists for this email",
        );
    }

    // Create invite record
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const inviteId = crypto.randomUUID();

    const invite = await prisma.staffInvite.create({
        data: {
            id: inviteId,
            email: input.email,
            organizerId,
            expiresAt,
            status: "PENDING",
            token: crypto.randomBytes(32).toString("hex"), // placeholder; overwritten below
        },
    });

    const jwtToken = generateInviteToken({
        email: input.email,
        organizerId,
        inviteId: invite.id,
    });

    // Update the invite with the JWT token for lookup
    await prisma.staffInvite.update({
        where: { id: invite.id },
        data: { token: jwtToken },
    });

    const magicLink = `${ENV.CLIENT_URL}/staff/accept-invite?token=${jwtToken}`;

    await transporter.sendMail({
        from: ENV.EMAIL_FROM,
        to: input.email,
        subject: `You're invited to join ${organizer.orgName} as Staff`,
        html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #111;">Staff Invitation</h2>
        <p>You've been invited to join <strong>${organizer.orgName}</strong> as a staff member on Ticket App.</p>
        <p>Click the button below to accept the invitation and set your password. This link expires in <strong>24 hours</strong>.</p>
        <a href="${magicLink}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
          Accept Invitation
        </a>
        <p style="color:#666;font-size:13px;">If you didn't expect this invitation, you can ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#999;font-size:12px;">Ticket App</p>
      </div>
    `,
    });

    return { message: "Invitation sent successfully", email: input.email };
};

export const acceptInvite = async (input: AcceptInviteInput) => {
    let payload;
    try {
        payload = verifyInviteToken(input.token);
    } catch {
        throw new AppError(400, "Invalid or expired invite link");
    }

    const invite = await prisma.staffInvite.findUnique({
        where: { token: input.token },
    });

    if (!invite) throw new AppError(404, "Invite not found");
    if (invite.status !== "PENDING")
        throw new AppError(400, "This invite has already been used or expired");
    if (invite.expiresAt < new Date())
        throw new AppError(400, "This invite link has expired");

    const passwordHash = await hashPassword(input.password);

    // Upsert the user (they may not have an account yet)
    let user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (user) {
        // User already exists — update their password and set role to STAFF
        user = await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                fullName: input.fullName,
                role: "STAFF",
            },
        });
    } else {
        // Create a new user
        user = await prisma.user.create({
            data: {
                email: payload.email,
                passwordHash,
                fullName: input.fullName,
                role: "STAFF",
            },
        });
    }

    // Create the Staff link
    await prisma.staff.upsert({
        where: {
            userId_organizerId: {
                userId: user.id,
                organizerId: payload.organizerId,
            },
        },
        create: {
            userId: user.id,
            organizerId: payload.organizerId,
        },
        update: {},
    });

    // Mark invite as accepted
    await prisma.staffInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" },
    });

    return { message: "Invitation accepted. You can now log in." };
};

export const listStaff = async (organizerId: string) => {
    const staff = await prisma.staff.findMany({
        where: { organizerId },
        select: {
            id: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    phone: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return staff;
};

export const listPendingInvites = async (organizerId: string) => {
    const invites = await prisma.staffInvite.findMany({
        where: { organizerId, status: "PENDING", expiresAt: { gt: new Date() } },
        select: {
            id: true,
            email: true,
            createdAt: true,
            expiresAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
    return invites;
};

export const removeStaff = async (staffId: string, organizerId: string) => {
    const entry = await prisma.staff.findFirst({
        where: { id: staffId, organizerId },
    });
    if (!entry) throw new AppError(404, "Staff member not found");

    await prisma.staff.delete({ where: { id: staffId } });

    // Downgrade role back to USER if they have no other staff entries
    const otherEntries = await prisma.staff.count({
        where: { userId: entry.userId },
    });
    if (otherEntries === 0) {
        await prisma.user.update({
            where: { id: entry.userId },
            data: { role: "USER" },
        });
    }

    return { message: "Staff member removed" };
};

export const scanTicket = async (qrCode: string, organizerId: string) => {
    const ticket = await prisma.ticket.findUnique({
        where: { qrCode },
        include: {
            event: {
                select: {
                    id: true,
                    title: true,
                    organizerId: true,
                },
            },
            ticketType: {
                select: { id: true, name: true },
            },
            user: {
                select: { fullName: true, email: true },
            },
        },
    });

    if (!ticket) throw new AppError(404, "Ticket not found — invalid QR code");

    if (ticket.event.organizerId !== organizerId) {
        throw new AppError(403, "This ticket does not belong to your organization");
    }

    if (ticket.status === "CANCELLED") {
        throw new AppError(400, "This ticket has been cancelled");
    }

    if (ticket.checkedInAt) {
        const timeStr = new Date(ticket.checkedInAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
        throw new AppError(409, `Ticket already checked in at ${timeStr}`);
    }

    const updated = await prisma.ticket.update({
        where: { id: ticket.id },
        data: { checkedInAt: new Date() },
    });

    return {
        alreadyScanned: false,
        checkedInAt: updated.checkedInAt,
        ticket: {
            id: ticket.id,
            ticketType: ticket.ticketType.name,
            event: ticket.event.title,
            holder: ticket.user.fullName ?? ticket.user.email,
        },
    };
};

export const getEventScanStats = async (eventId: string, organizerId: string) => {
    // Ensure the event belongs to this organizer
    const event = await prisma.event.findFirst({
        where: { id: eventId, organizerId },
        select: { id: true, title: true },
    });
    if (!event) throw new AppError(404, "Event not found");

    const ticketTypes = await prisma.ticketType.findMany({
        where: { eventId },
        select: {
            id: true,
            name: true,
            price: true,
            total: true,
            sold: true,
            tickets: {
                where: { checkedInAt: { not: null } },
                select: { id: true },
            },
        },
        orderBy: { name: "asc" },
    });

    return ticketTypes.map((tt) => ({
        id: tt.id,
        name: tt.name,
        price: tt.price,
        total: tt.total,
        sold: tt.sold,
        scanned: tt.tickets.length,
    }));
};
