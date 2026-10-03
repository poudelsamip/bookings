import { ENV } from "./env.config.js";
export const eSewaConfig = {
    merchantId: ENV.MERCHANT_ID,
    secret: ENV.SECRET,
    successUrl: ENV.SUCCESS_URL,
    failureUrl: ENV.FAILURE_URL,
    PAYMENT_URL: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    STATUS_URL: "https://rc-epay.esewa.com.np/api/epay/transaction/status/",
};
//# sourceMappingURL=esewa.config.js.map