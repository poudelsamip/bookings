import { randomBytes } from "crypto";
export function generateQrToken() {
    return randomBytes(24).toString("base64url");
}
//# sourceMappingURL=ticketToken.js.map