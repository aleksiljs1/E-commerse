import { escapeHtml } from "@/lib/email/html-escape";

export function emailVerificationTemplate({
  name,
  verifyUrl,
}: {
  name: string;
  verifyUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="background:#09090b;margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">PremiumVault</h1>
      <p style="color:#71717a;font-size:14px;margin-top:8px;">Account Upgrade Services</p>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;">
      <h2 style="color:#ffffff;font-size:20px;font-weight:600;margin-top:0;margin-bottom:8px;">
        Verify your email ✉️
      </h2>
      <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin-bottom:24px;">
        Hi ${escapeHtml(name)}, thanks for signing up. Click the button below to verify your email address and activate your account.
      </p>
      <a href="${verifyUrl}"
         style="display:block;background:#6366f1;color:#ffffff;text-align:center;padding:14px 24px;border-radius:10px;font-weight:600;font-size:16px;text-decoration:none;margin-bottom:16px;">
        Verify My Email →
      </a>
      <p style="color:#52525b;font-size:12px;text-align:center;margin:0;">
        Or copy this link: <span style="color:#71717a;">${verifyUrl}</span>
      </p>
    </div>
    <p style="text-align:center;color:#52525b;font-size:12px;margin-top:24px;">
      This link expires in 24 hours. If you didn't create an account, you can ignore this email.
    </p>
  </div>
</body>
</html>`;
}
