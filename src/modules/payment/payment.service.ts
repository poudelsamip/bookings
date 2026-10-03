import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma.lib.js";
import { AppError } from "../../utils/error.js";
import { eSewaConfig } from "../../config/esewa.config.js";
import { generateEsewaSignature } from "../../lib/payment.lib.js";
import { issueTickets, releaseHeldTickets } from "../ticket/ticket.service.js";
import axios from "axios";
import { sendTicketConfirmationEmail } from "../../utils/email.js";

export const initiateEsewaPayment = async (userId: string, orderId: string) => {
    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
            userId: userId,
        },
    });

    if (!order) {
        throw new AppError(404, "Order not found, Payment Cancelled");
    }

    const transaction_uuid = randomUUID();

    const signature_string = `total_amount=${order.total},transaction_uuid=${transaction_uuid},product_code=${eSewaConfig.merchantId}`;
    const signature = generateEsewaSignature(
        signature_string,
        eSewaConfig.secret,
    );

    await prisma.payment.create({
        data: {
            orderId,
            transactionId: transaction_uuid,
            amount: order.total,
            status: "INITIATED",
        },
    });

    const paymentData = {
        amount: order.total,
        tax_amount: "0",
        total_amount: order.total,
        product_delivery_charge: "0",
        product_service_charge: "0",
        product_code: eSewaConfig.merchantId,
        transaction_uuid,
        success_url: eSewaConfig.successUrl,
        failure_url: eSewaConfig.failureUrl,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
    };

    const response = await axios.post(eSewaConfig.PAYMENT_URL, null, {
        params: paymentData,
    });

    return response.request.res.responseUrl as string;
};

interface EsewaCallbackData {
    transaction_code: string;
    status: string;
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
    signed_field_names: string;
    signature: string;
}

function decodeEsewaData(encodedData: string): EsewaCallbackData {
    const json = Buffer.from(encodedData, "base64").toString("utf-8");
    return JSON.parse(json) as EsewaCallbackData;
}

function verifyEsewaSignature(data: EsewaCallbackData): boolean {
    const fields = data.signed_field_names.split(",");
    const signatureString = fields
        .map((f) => `${f}=${data[f as keyof EsewaCallbackData]}`)
        .join(",");

    const expected = generateEsewaSignature(
        signatureString,
        eSewaConfig.secret,
    );
    return expected === data.signature;
}

export const esewaSuccess = async (encodedData: string) => {
    const data = decodeEsewaData(encodedData);

    if (!verifyEsewaSignature(data)) {
        throw new AppError(400, "Invalid eSewa signature");
    }

    const payment = await prisma.payment.findUnique({
        where: {
            provider_transactionId: {
                provider: "ESEWA",
                transactionId: data.transaction_uuid,
            },
        },
        include: {
            order: {
                include: {
                    items: {
                        include: { ticketType: true },
                    },
                },
            },
        },
    });

    if (!payment) {
        throw new AppError(
            404,
            `Payment record not found. If the amount is deducted from your eSewa account,
            please contact us and we will refund your amount`,
        );
    }

    if (payment.status === "SUCCESS") {
        return { paymentId: payment.id, userId: payment.order.userId };
    }

    if (
        Number(data.total_amount.replace(/,/g, "")) !== Number(payment.amount)
    ) {
        throw new AppError(400, "Amount mismatch");
    }

    const statusRes = await axios.get(eSewaConfig.STATUS_URL, {
        params: {
            product_code: eSewaConfig.merchantId,
            transaction_uuid: data.transaction_uuid,
            total_amount: data.total_amount,
        },
        timeout: 10_000,
    });

    const statusData = statusRes.data as { status: string };

    if (statusData.status !== "COMPLETE") {
        throw new AppError(
            400,
            `eSewa payment not complete. Status: ${statusData.status}`,
        );
    }

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { id: payment.id },
            data: {
                status: "SUCCESS",
                rawResponse: statusRes.data as object,
            },
        });

        await tx.order.update({
            where: { id: payment.orderId },
            data: { status: "PAID" },
        });

        await issueTickets(
            tx,
            payment.order.userId,
            payment.orderId,
            payment.order.eventId,
            payment.order.items,
        );
    });

    // const emailData = await buildTicketEmailData(payment.orderId);
    // await sendTicketConfirmationEmail(emailData);

    return { paymentId: payment.id, userId: payment.order.userId };
};

async function buildTicketEmailData(orderId: string) {
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

export const esewaFailure = async (encodedData: string) => {
    let transactionUuid: string | null = null;

    try {
        const data = decodeEsewaData(encodedData);
        transactionUuid = data.transaction_uuid ?? null;
    } catch {
        // If decoding fails we still want to respond gracefully
    }

    if (!transactionUuid) {
        // Nothing we can do without a transaction ID
        return { message: "Payment failed", userId: null };
    }

    const payment = await prisma.payment.findUnique({
        where: {
            provider_transactionId: {
                provider: "ESEWA",
                transactionId: transactionUuid,
            },
        },
        include: {
            order: {
                include: {
                    items: true,
                },
            },
        },
    });

    if (!payment || payment.status !== "INITIATED") {
        return { message: "Payment failed", userId: payment?.order?.userId ?? null };
    }

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
        });

        await tx.order.update({
            where: { id: payment.orderId },
            data: { status: "FAILED" },
        });

        await releaseHeldTickets(tx, payment.order.items);
    });

    return { message: "Payment failed", userId: payment.order.userId };
};

export const getPaymentInfo = async (userId: string, paymentId: string) => {
    const payment = await prisma.payment.findUnique({
        where: {
            id: paymentId,
            order: {
                userId,
            },
        },
        include: {
            order: true,
        },
    });

    if (!payment) {
        throw new AppError(404, "Payment not found");
    }

    return payment;
};
