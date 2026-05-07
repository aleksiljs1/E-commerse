type OrderItem = {
  title: string;
  quantity: number;
  priceAtPurchase: number;
};

type PurchaseConfirmationData = {
  orderNumber: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  credentialToken: string;
  appUrl: string;
  heading?: string;
  body?: string;
  ctaText?: string;
  footer?: string;
};

export function purchaseConfirmationTemplate(data: PurchaseConfirmationData): string {
  const heading = data.heading ?? "Payment Confirmed &#x2705;";
  const ctaText = data.ctaText ?? "Go to Submission Page &rarr;";
  const footer = (
    data.footer ??
    "Your account will be upgraded within 4–5 business days after credential submission.\nQuestions? Contact our support team."
  ).replace(/\n/g, "<br>");

  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #27272a; color: #a1a1aa;">
            ${item.quantity}&times; ${item.title}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #27272a; text-align: right; color: #ffffff;">
            &pound;${(item.priceAtPurchase * item.quantity).toFixed(2)}
          </td>
        </tr>`
    )
    .join("");

  const submitUrl = `${data.appUrl.replace(/\/$/, "")}/submit-credentials`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="background: #09090b; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 560px; margin: 0 auto;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">PremiumVault</h1>
      <p style="color: #71717a; font-size: 14px; margin-top: 8px;">Account Upgrade Services</p>
    </div>

    <!-- Card -->
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px;">
      <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 4px;">
        ${heading}
      </h2>
      <p style="color: #71717a; font-size: 14px; margin-top: 0; margin-bottom: 24px;">
        Order <strong style="color: #a1a1aa;">${data.orderNumber}</strong> &mdash; sent to ${data.customerEmail}
      </p>

      <!-- Items table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        ${itemRows}
        <tr>
          <td style="padding-top: 12px; font-weight: 700; color: #ffffff;">Total</td>
          <td style="padding-top: 12px; font-weight: 700; color: #ffffff; text-align: right;">
            &pound;${data.totalAmount.toFixed(2)}
          </td>
        </tr>
      </table>

      <!-- Divider -->
      <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />

      <!-- Next steps -->
      <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin-bottom: 8px;">
        Next step: Submit your account credentials
      </p>
      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.7; margin-bottom: 20px;">
        Visit the link below and enter your <strong style="color: #ffffff;">Order ID</strong> on the page, then fill in the credentials for the accounts you want upgraded.
      </p>

      <!-- Order ID box -->
      <div style="background: #09090b; border: 2px solid #6366f1; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <p style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 10px 0;">
          Your Order ID
        </p>
        <p style="color: #ffffff; font-size: 15px; font-weight: 700; font-family: 'Courier New', monospace; margin: 0 0 14px 0; word-break: break-all; letter-spacing: 0.5px;">
          ${data.credentialToken}
        </p>
        <div style="background: #450a0a; border: 1px solid #7f1d1d; border-radius: 8px; padding: 8px 12px; display: inline-block;">
          <p style="color: #fca5a5; font-size: 12px; font-weight: 600; margin: 0;">
            &#x1F512; Do not share this ID with anyone
          </p>
        </div>
      </div>

      <!-- Numbered steps -->
      <ol style="color: #a1a1aa; font-size: 14px; line-height: 1.8; padding-left: 20px; margin-bottom: 24px;">
        <li>Click the button below to open the submission page</li>
        <li>Enter your Order ID from above</li>
        <li>Fill in your account credentials and submit</li>
      </ol>

      <a href="${submitUrl}"
         style="display: block; background: #6366f1; color: #ffffff; text-align: center;
                padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 16px;
                text-decoration: none; margin-bottom: 16px;">
        ${ctaText}
      </a>

      <p style="color: #52525b; font-size: 12px; text-align: center; margin: 0;">
        Or copy this link: <span style="color: #71717a;">${submitUrl}</span>
      </p>
    </div>

    <!-- Footer -->
    <p style="text-align: center; color: #52525b; font-size: 12px; margin-top: 24px;">
      ${footer}
    </p>
  </div>
</body>
</html>
  `;
}
