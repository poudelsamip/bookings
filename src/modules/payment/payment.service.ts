import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma.lib.js";
import { AppError } from "../../utils/error.js";
import { eSewaConfig } from "../../config/esewa.config.js";
import { generateEsewaSignature } from "../../lib/payment.lib.js";
import { issueTickets, releaseHeldTickets } from "../ticket/ticket.service.js";
import axios from "axios";

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
        tax_amoutn: "0",
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

    const expected = generateEsewaSignature(signatureString, eSewaConfig.secret);
    return expected === data.signature;
}

export const esewaSuccess = async (encodedData: string) => {
    const data = decodeEsewaData(encodedData);

    if (!verifyEsewaSignature(data)) {
        throw new AppError(400, "Invalid eSewa signature");
    }

    const statusRes = await axios.get(eSewaConfig.STATUS_URL, {
        params: {
            product_code: eSewaConfig.merchantId,
            transaction_uuid: data.transaction_uuid,
            total_amount: data.total_amount,
        },
    });

    const statusData = statusRes.data as { status: string };

    if (statusData.status !== "COMPLETE") {
        throw new AppError(400, `eSewa payment not complete. Status: ${statusData.status}`);
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
        throw new AppError(404, "Payment record not found");
    }

    if (payment.status === "SUCCESS") {
        return { orderId: payment.orderId };
    }

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { id: payment.id },
            data: {
                status: "SUCCESS",
                rawResponse: statusRes as object,
            },
        });

        await tx.order.update({
            where: { id: payment.orderId },
            data: { status: "PAID" },
        });

        await issueTickets(tx, payment.orderId, payment.order.eventId, payment.order.items);
    });

    return { orderId: payment.orderId };
};

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
        return { message: "Payment failed" };
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
        return { message: "Payment failed" };
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

    return { message: "Payment failed" };
};

