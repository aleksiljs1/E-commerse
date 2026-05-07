import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { purchaseConfirmationTemplate } from "@/lib/email/templates/purchase-confirmation";
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
        include: { items: { include: { product: true } } },
      }),
      getEmailSettings(),
    ]);

    if (!order || !order.credentialToken) {
      return apiError("Order not found or missing credential token", 404);
    }

    const subject = settings.purchaseSubject.replace(/\{orderNumber\}/g, order.orderNumber);

    await sendEmail({
      to: order.customerEmail,
      subject,
      html: purchaseConfirmationTemplate({
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        items: order.items.map((i) => ({ title: i.product.title, quantity: i.quantity, priceAtPurchase: Number(i.priceAtPurchase) })),
        totalAmount: Number(order.totalAmount),
        credentialToken: order.credentialToken,
        appUrl: process.env.NEXT_PUBLIC_APP_URL!,
        heading: settings.purchaseHeading,
        body: settings.purchaseBody,
        ctaText: settings.purchaseCtaText,
        footer: settings.purchaseFooter,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError("Failed to send confirmation email", 500, "send-confirmation", err);
  }
}
