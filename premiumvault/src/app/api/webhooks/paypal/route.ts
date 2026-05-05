import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const token = searchParams.get("token");
  if (action !== "capture" || !token) return NextResponse.redirect(new URL("/checkout?error=invalid", req.url));
  try {
    const order = await prisma.order.findFirst({ where: { paymentId: token } });
    if (!order) return NextResponse.redirect(new URL("/checkout?error=order_not_found", req.url));
    if (order.status === "PAID") return NextResponse.redirect(new URL(`/checkout/success?orderId=${order.id}`, req.url));
    const { status, captureId } = await capturePayPalOrder(token);
    if (status !== "COMPLETED") return NextResponse.redirect(new URL("/checkout?error=payment_failed", req.url));
    const credentialToken = uuidv4();
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.order.update({ where: { id: order.id }, data: { status: "PAID", paymentId: captureId, credentialToken, tokenExpiresAt } });
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/credentials/send-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": process.env.NEXTAUTH_SECRET! },
      body: JSON.stringify({ orderId: order.id }),
    }).catch(() => null);
    return NextResponse.redirect(new URL(`/checkout/success?orderId=${order.id}`, req.url));
  } catch {
    return NextResponse.redirect(new URL("/checkout?error=capture_failed", req.url));
  }
}
