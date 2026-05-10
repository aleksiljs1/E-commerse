type AdminNotificationData = {
  type: "NEW_PURCHASE" | "CREDENTIALS_SUBMITTED" | "DROPSHIP_ORDER";
  orderNumber: string;
  customerEmail: string;
  items: { title: string; quantity: number; priceAtPurchase: number }[];
  totalAmount: number;
  hasUpgradeItems: boolean;
};

export function adminNotificationTemplate(data: AdminNotificationData): string {
  const isCredentials = data.type === "CREDENTIALS_SUBMITTED";
  const isDropship = data.type === "DROPSHIP_ORDER";

  const title = isCredentials
    ? "Credentials Submitted — Action Required"
    : isDropship
      ? "New Dropship Order — Action Required"
      : "New Order Received";

  const subtitle = isCredentials
    ? "A customer has submitted their credentials. Please log in and upgrade their account."
    : isDropship
      ? "A customer has placed a dropship order. Please source and deliver the account credentials within 4–5 business days."
      : data.hasUpgradeItems
        ? "A new upgrade order has been placed. You will be notified again when the customer submits their credentials."
        : "A new purchase order has been completed and the accounts have been delivered automatically.";

  const statusColor = isCredentials || isDropship ? "#f97316" : "#22c55e";
  const statusLabel = isCredentials || isDropship ? "ACTION REQUIRED" : "NEW ORDER";

  const itemRows = data.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#e2e8f0;font-size:14px">${i.title}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#94a3b8;font-size:14px;text-align:center">${i.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#94a3b8;font-size:14px;text-align:right">£${i.priceAtPurchase.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">
    <div style="background:#12121f;border:1px solid #1e1e35;border-radius:16px;overflow:hidden">
      <!-- Header -->
      <div style="padding:24px 32px;border-bottom:1px solid #1e1e35;text-align:center">
        <span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${statusColor}20;color:${statusColor};font-size:11px;font-weight:700;letter-spacing:1px">${statusLabel}</span>
        <h1 style="margin:12px 0 0;color:#fff;font-size:20px;font-weight:700">${title}</h1>
      </div>

      <!-- Body -->
      <div style="padding:24px 32px">
        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px">${subtitle}</p>

        <!-- Order info -->
        <div style="background:#0a0a1a;border-radius:12px;padding:16px;margin-bottom:20px">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:4px 0;color:#64748b;font-size:12px">Order</td>
              <td style="padding:4px 0;color:#fff;font-size:14px;font-weight:600;text-align:right;font-family:monospace">${data.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#64748b;font-size:12px">Customer</td>
              <td style="padding:4px 0;color:#e2e8f0;font-size:14px;text-align:right">${data.customerEmail}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#64748b;font-size:12px">Total</td>
              <td style="padding:4px 0;color:#f97316;font-size:16px;font-weight:700;text-align:right">£${data.totalAmount.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <!-- Items -->
        <table style="width:100%;border-collapse:collapse;background:#0a0a1a;border-radius:12px;overflow:hidden">
          <thead>
            <tr style="background:#1a1a2e">
              <th style="padding:10px 12px;color:#64748b;font-size:11px;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Item</th>
              <th style="padding:10px 12px;color:#64748b;font-size:11px;text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Qty</th>
              <th style="padding:10px 12px;color:#64748b;font-size:11px;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        ${isCredentials || isDropship ? `
        <div style="margin-top:24px;text-align:center">
          <a href="${(process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "")}/admin/dashboard/orders" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600">Go to Admin Panel →</a>
        </div>
        ` : ""}
      </div>

      <!-- Footer -->
      <div style="padding:16px 32px;border-top:1px solid #1e1e35;text-align:center">
        <p style="color:#475569;font-size:12px;margin:0">PremiumVault Admin Notification</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
