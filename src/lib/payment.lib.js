import crypto from "crypto";
export function generateEsewaSignature(signature_string, secret) {
    return crypto
        .createHmac("sha256", secret)
        .update(signature_string)
        .digest("base64");
}
//# sourceMappingURL=payment.lib.js.map