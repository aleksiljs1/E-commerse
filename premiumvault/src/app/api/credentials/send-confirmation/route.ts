import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { purchaseConfirmationTemplate } from "@/lib/email/templates/purchase-confirmation";
import { accountDeliveryTemplate } from "@/lib/email/templates/account-delivery";
import { getEmailSettings } from "@/lib/email/settings";
import { apiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  const internalSecret = req.headers.get("x-internal-secret");
  if (!internalSecret || internalSecret !== process.env.NEXTAUTH_SECRET) {
    return apiError("Unauthorized", 401);
  }

  let body: { orderId?: unknown };
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const orderId = typeof body.orderId === "string" ? body.orderId : null;
  if (!orderId) return apiError("orderId is required", 400);

  try {
    const [order, settings] = await Promise.all([
      prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, title: true, productType: true },
              },
            },
          },
        },
      }),
      getEmailSettings(),
    ]);

    if (!order) return apiError("Order not found", 404);

    const upgradeItems = order.items.filter((i) => i.product.productType === "UPGRADE");
    const purchaseItems = order.items.filter((i) => i.product.productType === "PURCHASE");

    // PURCHASE items: assign stock and email credentials directly
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
            console.warn(
              `[send-confirmation] Insufficient stock for product ${item.product.id} (need ${item.quantity}, have ${stocks.length})`
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
      });

      if (deliveredAccounts.length > 0) {
        await sendEmail({
          to: order.customerEmail,
          subject: `PremiumVault — Your Account Details (Order ${order.orderNumber})`,
          html: accountDeliveryTemplate({
            orderNumber: order.orderNumber,
            customerEmail: order.customerEmail,
            accounts: deliveredAccounts,
            supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? process.env.EMAIL_FROM ?? "",
          }),
        });
      }

      // If every item is PURCHASE, order is fully complete — no credential submission needed
      if (upgradeItems.length === 0) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "COMPLETED", credentialToken: null, tokenExpiresAt: null },
        });
      }
    }

    // UPGRADE items: send Order ID email so customer can submit credentials
    if (upgradeItems.length > 0 && order.credentialToken) {
      const subject = settings.purchaseSubject.replace(/\{orderNumber\}/g, order.orderNumber);
      await sendEmail({
        to: order.customerEmail,
        subject,
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
          appUrl: process.env.NEXT_PUBLIC_APP_URL!,
          heading: settings.purchaseHeading,
          body: settings.purchaseBody,
          ctaText: settings.purchaseCtaText,
          footer: settings.purchaseFooter,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError("Failed to process confirmation", 500, "send-confirmation", err);
  }
}
