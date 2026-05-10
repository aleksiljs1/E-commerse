import { prisma } from "@/lib/db";
import { sendEmail } from "./send";
import { purchaseConfirmationTemplate } from "./templates/purchase-confirmation";
import { accountDeliveryTemplate } from "./templates/account-delivery";
import { getEmailSettings } from "./settings";

export async function processOrderConfirmation(orderId: string): Promise<void> {
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true, productType: true } },
          },
        },
      },
    }),
    getEmailSettings(),
  ]);

  if (!order) throw new Error(`Order not found: ${orderId}`);

  const upgradeItems = order.items.filter((i) => i.product.productType === "UPGRADE");
  const purchaseItems = order.items.filter((i) => i.product.productType === "PURCHASE");

  // PURCHASE items: assign stock and deliver credentials by email
  if (purchaseItems.length > 0) {
    const deliveredAccounts: { productTitle: string; username: string; password: string }[] = [];

    await prisma.$transaction(async (tx) => {
      for (const item of purchaseItems) {
        const stocks = await tx.accountStock.findMany({
          where: { productId: item.product.id, isUsed: false },
          take: item.quantity,
          orderBy: { createdAt: "asc" },
        });

        if (stocks.length < item.quantity) {
          // Throws → transaction rolls back → no stock is consumed
          throw new Error(
            `Insufficient stock for product ${item.product.id} — need ${item.quantity}, have ${stocks.length}`
          );
        }

        for (const stock of stocks) {
          await tx.accountStock.update({
            where: { id: stock.id },
            data: { isUsed: true, usedAt: new Date(), orderId: order.id },
          });
          deliveredAccounts.push({
            productTitle: item.product.title,
            username: stock.username,
            password: stock.password,
          });
        }
      }

      // Mark COMPLETED inside the transaction — order state stays consistent
      // even if the delivery email send fails after this point
      if (upgradeItems.length === 0) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "COMPLETED", credentialToken: null, tokenExpiresAt: null },
        });
      }
    });

    // Fire-and-forget: order is already COMPLETED in DB, email failure doesn't corrupt state
    if (deliveredAccounts.length > 0) {
      sendEmail({
        to: order.customerEmail,
        subject: `PremiumVault — Your Account Details (Order ${order.orderNumber})`,
        orderId: order.id,
        html: accountDeliveryTemplate({
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          accounts: deliveredAccounts,
          supportEmail: settings.supportEmail,
        }),
      }).catch((err) =>
        console.error("[process-order-confirmation] Delivery email failed for order", order.id, err)
      );
    }
  }

  // UPGRADE items: send Order ID email so customer can submit credentials
  if (upgradeItems.length > 0 && order.credentialToken) {
    const subject = settings.purchaseSubject.replace(/\{orderNumber\}/g, order.orderNumber);
    await sendEmail({
      to: order.customerEmail,
      subject,
      orderId: order.id,
      html: purchaseConfirmationTemplate({
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        items: order.items.map((i) => ({
          title: i.product.title,
          quantity: i.quantity,
          priceAtPurchase: Number(i.priceAtPurchase),
        })),
        totalAmount: Number(order.totalAmount),
        credentialToken: order.credentialToken,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
        heading: settings.purchaseHeading,
        body: settings.purchaseBody,
        ctaText: settings.purchaseCtaText,
        footer: settings.purchaseFooter,
      }),
    }).catch((err) =>
      console.error("[process-order-confirmation] Upgrade confirmation email failed for order", order.id, err)
    );
  }
}
