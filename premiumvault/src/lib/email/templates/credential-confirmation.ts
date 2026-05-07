type CredentialConfirmationData = {
  orderNumber: string;
  customerEmail: string;
  serviceCount: number;
  heading?: string;
  body?: string;
  footer?: string;
};

export function credentialConfirmationTemplate(data: CredentialConfirmationData): string {
  const heading = data.heading ?? "Credentials Received!";
  const body = (data.body ?? "Congratulations! We've received your account credentials for order {orderNumber}.")
    .replace(/\{orderNumber\}/g, data.orderNumber);
  const footer = data.footer ?? "Thank you for choosing PremiumVault.";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="background: #09090b; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 560px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">PremiumVault</h1>
      <p style="color: #71717a; font-size: 14px; margin-top: 8px;">Account Upgrade Services</p>
    </div>
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">&#x1F389;</div>
      <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 8px;">
        ${heading}
      </h2>
      <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        ${body}
      </p>
      <div style="background: #09090b; border: 1px solid #27272a; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #22c55e; font-size: 14px; font-weight: 600; margin: 0;">
          &#x2705; ${data.serviceCount} account${data.serviceCount > 1 ? "s" : ""} queued for upgrade
        </p>
      </div>
      <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 0;">
        Your account${data.serviceCount > 1 ? "s" : ""} will be upgraded within
        <strong style="color: #ffffff;">4&ndash;5 business days</strong>.
        We will notify you at <strong style="color: #ffffff;">${data.customerEmail}</strong> once complete.
      </p>
    </div>
    <p style="text-align: center; color: #52525b; font-size: 12px; margin-top: 24px;">
      ${footer}
    </p>
  </div>
</body>
</html>
  `;
}
