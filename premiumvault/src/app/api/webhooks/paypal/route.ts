import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { notifyAdminNewOrder } from "@/lib/email/notify-admin";
import { processOrderConfirmation } from "@/lib/email/process-order-confirmation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const token = searchParams.get("token");

  if (action !== "capture" || !token) {
    return NextResponse.redirect(new URL("/checkout?error=invalid", req.url));
  }

  try {
    const order = await prisma.order.findFirst({ where: { paymentId: token } });
    if (!order) return NextResponse.redirect(new URL("/checkout?error=order_not_found", req.url));

    // Already paid — idempotent redirect
    if (order.status === "PAID") {
      return NextResponse.redirect(new URL(`/checkout/success?orderId=${order.id}`, req.url));
    }

    const { status, captureId } = await capturePayPalOrder(token);
    if (status !== "COMPLETED") {
      console.warn("[webhook/paypal] Capture status not COMPLETED:", status, "order:", order.id);
      return NextResponse.redirect(new URL("/checkout?error=payment_failed", req.url));
    }

    const credentialToken = uuidv4();
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Atomic: only updates if still PENDING — idempotent
    const result = await prisma.order.updateMany({
      where: { id: order.id, status: "PENDING" },
      data: { status: "PAID", paymentId: captureId, credentialToken, tokenExpiresAt },
    });

    if (result.count > 0) {
      // Call directly — no internal HTTP roundtrip, errors are logged not swallowed
      await processOrderConfirmation(order.id).catch((err) =>
        console.error("[webhook/paypal] processOrderConfirmation failed for order", order.id, err)
      );

      // Await so the notification completes before we redirect the customer
      const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: { select: { title: true, productType: true } } } } },
      });
      if (fullOrder) {
        await notifyAdminNewOrder({
          orderNumber: fullOrder.orderNumber,
          customerEmail: fullOrder.customerEmail,
          items: fullOrder.items.map((i) => ({
            title: i.product.title,
            quantity: i.quantity,
            priceAtPurchase: Number(i.priceAtPurchase),
          })),
          totalAmount: Number(fullOrder.totalAmount),
          hasUpgradeItems: fullOrder.items.some((i) => i.product.productType === "UPGRADE"),
        }).catch((err) => console.error("[webhook/paypal] Admin notification failed:", err));
      }
    }

    return NextResponse.redirect(new URL(`/checkout/success?orderId=${order.id}`, req.url));
  } catch (err) {
    console.error("[webhook/paypal] Capture failed:", err);
    return NextResponse.redirect(new URL("/checkout?error=capture_failed", req.url));
  }
}
