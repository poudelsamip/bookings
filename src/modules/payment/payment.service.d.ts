export declare const initiateEsewaPayment: (userId: string, orderId: string) => Promise<string>;
export declare const esewaSuccess: (encodedData: string) => Promise<{
    paymentId: string;
    userId: string;
}>;
export declare const esewaFailure: (encodedData: string) => Promise<{
    message: string;
    userId: string | null;
}>;
export declare const getPaymentInfo: (userId: string, paymentId: string) => Promise<{
    order: {
        id: string;
        userId: string;
        eventId: string;
        total: number;
        status: import("../../../generated/prisma/enums.js").OrderStatus;
        expiresAt: Date;
        createdAt: Date;
    };
} & {
    id: string;
    orderId: string;
    provider: import("../../../generated/prisma/enums.js").PaymentProvider;
    transactionId: string | null;
    amount: number;
    status: import("../../../generated/prisma/enums.js").PaymentStatus;
    rawResponse: import("@prisma/client/runtime/client").JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=payment.service.d.ts.map