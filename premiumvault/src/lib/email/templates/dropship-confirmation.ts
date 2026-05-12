import { escapeHtml } from "@/lib/email/html-escape";

type DropshipConfirmationData = {
  orderNumber: string;
  customerEmail: string;
  items: { title: string; quantity: number; priceAtPurchase: number }[];
  totalAmount: number;
  supportEmail: string;
};

export function dropshipConfirmationTemplate(data: DropshipConfirmationData): string {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #27272a; color: #a1a1aa;">
            ${item.quantity}&times; ${escapeHtml(item.title)}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #27272a; text-align: right; color: #ffffff;">
            &pound;${(item.priceAtPurchase * item.quantity).toFixed(2)}
          </td>
        </tr>`
    )
    .join("");

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
        Order Confirmed &#x2705;
      </h2>
      <p style="color: #71717a; font-size: 14px; margin-top: 0; margin-bottom: 24px;">
        Order <strong style="color: #a1a1aa;">${escapeHtml(data.orderNumber)}</strong> &mdash; sent to ${escapeHtml(data.customerEmail)}
      </p>

      <!-- Message -->
      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">
        Your order has been confirmed and is now being processed. Your account credentials will be delivered to this email within <strong style="color: #ffffff;">4&ndash;5 business days</strong>.
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

      <!-- Ready note -->
      <p style="color: #52525b; font-size: 13px; text-align: center; margin: 0;">
        You&rsquo;ll receive another email as soon as your account is ready.
      </p>
    </div>

    <!-- Footer -->
    <p style="text-align: center; color: #52525b; font-size: 12px; margin-top: 24px;">
      Questions? Contact our support team at <a href="mailto:${escapeHtml(data.supportEmail)}" style="color: #71717a;">${escapeHtml(data.supportEmail)}</a>
    </p>
  </div>
</body>
</html>
  `;
}
