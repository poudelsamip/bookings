import { prisma } from "../../lib/prisma.lib.js";
import { AppError } from "../../utils/error.js";


export const getDashboardStats = async () => {
    const [
        totalUsers,
        totalOrganizers,
        totalEvents,
        publishedEvents,
        totalTicketsSold,
        totalRevenue,
        pendingRefunds,
        pendingPayoutsResult,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.organizer.count(),
        prisma.event.count(),
        prisma.event.count({ where: { status: "PUBLISHED" } }),
        prisma.ticket.count({ where: { status: "VALID" } }),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: "SUCCESS" },
        }),
        prisma.payment.count({ where: { status: "NEED_REFUND" } }),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: {
                status: "SUCCESS",
                order: { status: "PAID", event: { status: "COMPLETED" } },
            },
        }),
    ]);

    return {
        totalUsers,
        totalOrganizers,
        totalEvents,
        publishedEvents,
        totalTicketsSold,
        totalRevenue: totalRevenue._sum.amount ?? 0,
        pendingRefunds,
        pendingPayouts: pendingPayoutsResult._sum.amount ?? 0,
    };
};


export const getAllEvents = async (
    page = 1,
    limit = 20,
    status?: string,
    search?: string,
) => {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { organizer: { orgName: { contains: search, mode: "insensitive" } } },
        ];
    }

    const [events, total] = await Promise.all([
        prisma.event.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                organizer: { select: { id: true, orgName: true, user: { select: { email: true } } } },
                category: { select: { name: true } },
                venue: { select: { name: true, district: true } },
                ticketTypes: { select: { total: true, sold: true, held: true, price: true, name: true } },
                _count: { select: { tickets: true, orders: true } },
            },
        }),
        prisma.event.count({ where }),
    ]);

    return {
        events: events.map((e) => ({
            ...e,
            ticketsSold: e._count.tickets,
            totalOrders: e._count.orders,
            totalCapacity: e.ticketTypes.reduce((s, t) => s + t.total, 0),
            revenue: e.ticketTypes.reduce((s, t) => s + t.sold * t.price, 0),
        })),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const updateEventStatus = async (
    eventId: string,
    status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED",
) => {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError(404, "Event not found");

    return prisma.event.update({
        where: { id: eventId },
        data: { status },
        select: { id: true, title: true, status: true },
    });
};


export const getAllUsers = async (
    page = 1,
    limit = 20,
    role?: string,
    search?: string,
) => {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
        where.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { fullName: { contains: search, mode: "insensitive" } },
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                role: true,
                createdAt: true,
                organizer: { select: { orgName: true } },
                _count: { select: { tickets: true, orders: true } },
            },
        }),
        prisma.user.count({ where }),
    ]);

    return {
        users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};


export const getAllPayments = async (
    page = 1,
    limit = 20,
    status?: string,
    search?: string,
) => {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
        where.OR = [
            { transactionId: { contains: search, mode: "insensitive" } },
            { order: { user: { email: { contains: search, mode: "insensitive" } } } },
        ];
    }

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                order: {
                    include: {
                        user: { select: { id: true, email: true, fullName: true } },
                        event: { select: { id: true, title: true, slug: true } },
                    },
                },
            },
        }),
        prisma.payment.count({ where }),
    ]);

    return {
        payments,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const markPaymentRefunded = async (paymentId: string) => {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
    });

    if (!payment) throw new AppError(404, "Payment not found");
    if (payment.status !== "NEED_REFUND") {
        throw new AppError(400, `Cannot mark as refunded - current status is ${payment.status}`);
    }

    return prisma.payment.update({
        where: { id: paymentId },
        data: { status: "REFUNDED" },
        select: { id: true, status: true, amount: true },
    });
};


export const getPendingPayouts = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const where = {
        status: "SUCCESS" as const,
        order: {
            status: "PAID" as const,
            event: { status: "COMPLETED" as const },
        },
    };

    const [payments, total, totalAmount] = await Promise.all([
        prisma.payment.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                order: {
                    include: {
                        user: { select: { email: true, fullName: true } },
                        event: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                organizer: {
                                    select: {
                                        id: true,
                                        orgName: true,
                                        contactEmail: true,
                                        user: { select: { email: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),
        prisma.payment.count({ where }),
        prisma.payment.aggregate({ _sum: { amount: true }, where }),
    ]);

    return {
        payments,
        totalAmount: totalAmount._sum.amount ?? 0,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getPayoutSummaryByOrganizer = async () => {
    const rows = await prisma.payment.findMany({
        where: {
            status: "SUCCESS",
            order: { status: "PAID", event: { status: "COMPLETED" } },
        },
        select: {
            amount: true,
            order: {
                select: {
                    event: {
                        select: {
                            organizer: {
                                select: {
                                    id: true,
                                    orgName: true,
                                    contactEmail: true,
                                    user: { select: { email: true } },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const map = new Map<
        string,
        { organizerId: string; orgName: string; email: string; totalAmount: number; count: number }
    >();

    for (const row of rows) {
        const org = row.order.event.organizer;
        const key = org.id;
        const email = org.contactEmail ?? org.user.email;

        if (!map.has(key)) {
            map.set(key, {
                organizerId: org.id,
                orgName: org.orgName,
                email,
                totalAmount: 0,
                count: 0,
            });
        }

        const entry = map.get(key)!;
        entry.totalAmount += row.amount;
        entry.count += 1;
    }

    return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
};


export const getPendingRefunds = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const where = { status: "NEED_REFUND" as const };

    const [payments, total, totalAmount] = await Promise.all([
        prisma.payment.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                order: {
                    include: {
                        user: { select: { id: true, email: true, fullName: true, phone: true } },
                        event: { select: { id: true, title: true, slug: true } },
                    },
                },
            },
        }),
        prisma.payment.count({ where }),
        prisma.payment.aggregate({ _sum: { amount: true }, where }),
    ]);

    return {
        payments,
        totalAmount: totalAmount._sum.amount ?? 0,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getPaymentsByEvent = async (
    page = 1,
    limit = 20,
    search?: string,
) => {
    const skip = (page - 1) * limit;

    // Find events that have at least one payment
    const whereEvent: Record<string, unknown> = {};
    if (search) {
        whereEvent.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { organizer: { orgName: { contains: search, mode: "insensitive" } } },
        ];
    }

    const [events, total] = await Promise.all([
        prisma.event.findMany({
            where: {
                ...whereEvent,
                orders: { some: { payments: { some: {} } } },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                date: true,
                organizer: {
                    select: {
                        id: true,
                        orgName: true,
                        contactEmail: true,
                        user: { select: { email: true } },
                    },
                },
                orders: {
                    select: {
                        payments: {
                            select: {
                                amount: true,
                                status: true,
                            },
                        },
                    },
                },
                _count: { select: { tickets: true } },
            },
        }),
        prisma.event.count({
            where: {
                ...whereEvent,
                orders: { some: { payments: { some: {} } } },
            },
        }),
    ]);

    const result = events.map((e) => {
        const allPayments = e.orders.flatMap((o) => o.payments);
        const totalCollected = allPayments
            .filter((p) => p.status === "SUCCESS")
            .reduce((s, p) => s + p.amount, 0);
        const totalRefunded = allPayments
            .filter((p) => p.status === "REFUNDED")
            .reduce((s, p) => s + p.amount, 0);
        const pendingRefunds = allPayments.filter((p) => p.status === "NEED_REFUND").length;
        const failed = allPayments.filter((p) => p.status === "FAILED").length;
        const successCount = allPayments.filter((p) => p.status === "SUCCESS").length;

        return {
            eventId: e.id,
            title: e.title,
            slug: e.slug,
            status: e.status,
            date: e.date,
            organizer: {
                id: e.organizer.id,
                orgName: e.organizer.orgName,
                email: e.organizer.contactEmail ?? e.organizer.user.email,
            },
            totalCollected,
            totalRefunded,
            pendingRefunds,
            failed,
            successCount,
            ticketsSold: e._count.tickets,
        };
    });

    return {
        events: result,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};


export const getPaymentsByOrganizer = async (
    page = 1,
    limit = 20,
    search?: string,
) => {
    const skip = (page - 1) * limit;

    const whereOrg: Record<string, unknown> = {};
    if (search) {
        whereOrg.OR = [
            { orgName: { contains: search, mode: "insensitive" } },
            { contactEmail: { contains: search, mode: "insensitive" } },
            { user: { email: { contains: search, mode: "insensitive" } } },
        ];
    }

    const [organizers, total] = await Promise.all([
        prisma.organizer.findMany({
            where: {
                ...whereOrg,
                events: { some: { orders: { some: { payments: { some: {} } } } } },
            },
            skip,
            take: limit,
            orderBy: { orgName: "asc" },
            select: {
                id: true,
                orgName: true,
                contactEmail: true,
                user: { select: { email: true } },
                events: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        orders: {
                            select: {
                                payments: {
                                    select: {
                                        amount: true,
                                        status: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),
        prisma.organizer.count({
            where: {
                ...whereOrg,
                events: { some: { orders: { some: { payments: { some: {} } } } } },
            },
        }),
    ]);

    const result = organizers.map((org) => {
        const allPayments = org.events.flatMap((e) =>
            e.orders.flatMap((o) => o.payments),
        );

        const totalCollected = allPayments
            .filter((p) => p.status === "SUCCESS")
            .reduce((s, p) => s + p.amount, 0);
        const totalRefunded = allPayments
            .filter((p) => p.status === "REFUNDED")
            .reduce((s, p) => s + p.amount, 0);
        const pendingRefundsAmount = allPayments
            .filter((p) => p.status === "NEED_REFUND")
            .reduce((s, p) => s + p.amount, 0);
        const pendingRefundCount = allPayments.filter(
            (p) => p.status === "NEED_REFUND",
        ).length;
        const successCount = allPayments.filter((p) => p.status === "SUCCESS").length;

        // Owed = completed events revenue (pending payout)
        const completedEventsPayments = org.events
            .filter((e) => e.status === "COMPLETED")
            .flatMap((e) => e.orders.flatMap((o) => o.payments))
            .filter((p) => p.status === "SUCCESS");
        const totalOwed = completedEventsPayments.reduce((s, p) => s + p.amount, 0);

        return {
            organizerId: org.id,
            orgName: org.orgName,
            email: org.contactEmail ?? org.user.email,
            totalEvents: org.events.length,
            totalCollected,
            totalRefunded,
            pendingRefundsAmount,
            pendingRefundCount,
            successCount,
            totalOwed, // amount owed for completed events
        };
    });

    // Sort by totalCollected desc
    result.sort((a, b) => b.totalCollected - a.totalCollected);

    return {
        organizers: result,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
