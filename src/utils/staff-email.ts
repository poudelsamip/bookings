import { transporter } from "../lib/mailer.lib.js";
import { ENV } from "../config/env.config.js";

export interface StaffInviteEmailData {
    to: string;
    orgName: string;
    magicLink: string;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

const TEXT = "font-size:14px;line-height:1.6;color:#111111;";
const MUTED = "font-size:13px;line-height:1.5;color:#666666;";

export function buildStaffInviteHtml(data: StaffInviteEmailData): string {
    const safeOrg = escapeHtml(data.orgName);
    const safeLink = escapeHtml(data.magicLink);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Staff Invitation</title>
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

              <!-- Title -->
              <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#111111;">You're invited to join ${safeOrg}</p>

              <!-- Body -->
              <p style="${TEXT}margin:0 0 20px;">
                You've been invited to join <strong>${safeOrg}</strong> as a staff member on Ticket Bro.
                Click the button below to accept the invitation and set your password.
              </p>

              <p style="${MUTED}margin:0 0 24px;">
                This link expires in <strong>24 hours</strong>. If you didn't expect this invitation, you can safely ignore this email.
              </p>

              <!-- CTA -->
              <p style="margin:0 0 24px;text-align:center;">
                <a href="${safeLink}"
                   style="display:inline-block;padding:12px 32px;background:#111111;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
                  Accept Invitation
                </a>
              </p>

              <!-- Footer note -->
              <p style="margin:0;${MUTED}">
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

export const sendStaffInviteEmail = async (data: StaffInviteEmailData) => {
    const html = buildStaffInviteHtml(data);

    await transporter.sendMail({
        from: ENV.EMAIL_FROM,
        to: data.to,
        subject: `You're invited to join ${data.orgName} as Staff`,
        html,
    });
};
