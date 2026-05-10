import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { v4 as uuidv4 } from "uuid";
import { processOrderConfirmation } from "@/lib/email/process-order-confirmation";
import { notifyAdminNewOrder } from "@/lib/email/notify-admin";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return apiError("Forbidden", 403);

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { title: true, productType: true } } } } },
  });

  if (!order) return apiError("Order not found", 404);
  if (order.paymentMethod !== "PAYPAL") return apiError("This action is only for PayPal F&F orders", 400);
  if (order.status !== "PENDING") return apiError("Order is not pending — cannot confirm payment", 400);

  const credentialToken = uuidv4();
  const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Atomic update: only transitions if still PENDING
  const result = await prisma.order.updateMany({
    where: { id, status: "PENDING" },
    data: { status: "PAID", credentialToken, tokenExpiresAt },
  });

  if (result.count === 0) {
    return apiError("Order was already processed", 409);
  }

  // Increment coupon usage now that payment is confirmed
  if (order.couponId) {
    await prisma.coupon.update({
      where: { id: order.couponId },
      data: { timesUsed: { increment: 1 } },
    });
  }

  // Process order confirmation (sends emails, delivers accounts for PURCHASE items)
  await processOrderConfirmation(order.id).catch((err) =>
    console.error("[confirm-payment] processOrderConfirmation failed for order", order.id, err)
  );

  // Notify admin
  await notifyAdminNewOrder({
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    items: order.items.map((i) => ({
      title: i.product.title,
      quantity: i.quantity,
      priceAtPurchase: Number(i.priceAtPurchase),
    })),
    totalAmount: Number(order.totalAmount),
    hasUpgradeItems: order.items.some((i) => i.product.productType === "UPGRADE"),
  }).catch((err) => console.error("[confirm-payment] Admin notification failed:", err));

  return NextResponse.json({ success: true, message: "Payment confirmed and order processed" });
}
