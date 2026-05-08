import { sendEmail } from "./send";
import { getEmailSettings } from "./settings";
import { adminNotificationTemplate } from "./templates/admin-notification";

type OrderData = {
  orderNumber: string;
  customerEmail: string;
  items: { title: string; quantity: number; priceAtPurchase: number }[];
  totalAmount: number;
  hasUpgradeItems: boolean;
};

export async function notifyAdminNewOrder(order: OrderData): Promise<void> {
  const settings = await getEmailSettings();
  console.log("[notify-admin] Admin email:", settings.adminNotificationEmail || "(not set)");
  if (!settings.adminNotificationEmail) return;

  console.log("[notify-admin] Sending new order notification for", order.orderNumber, "to", settings.adminNotificationEmail);
  await sendEmail({
    to: settings.adminNotificationEmail,
    subject: `New Order ${order.orderNumber} — ${order.hasUpgradeItems ? "Upgrade" : "Purchase"}`,
    html: adminNotificationTemplate({ type: "NEW_PURCHASE", ...order }),
  });
  console.log("[notify-admin] Notification sent successfully for", order.orderNumber);
}

export async function notifyAdminCredentialsSubmitted(order: OrderData): Promise<void> {
  const settings = await getEmailSettings();
  if (!settings.adminNotificationEmail) return;

  await sendEmail({
    to: settings.adminNotificationEmail,
    subject: `Action Required — Credentials Submitted for ${order.orderNumber}`,
    html: adminNotificationTemplate({ type: "CREDENTIALS_SUBMITTED", ...order }),
  });
}
