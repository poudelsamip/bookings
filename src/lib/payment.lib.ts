import crypto from "crypto";

export function generateEsewaSignature(
    signature_string: string,
    secret: string,
) {
    return crypto
        .createHmac("sha256", secret)
        .update(signature_string)
        .digest("base64");
}
