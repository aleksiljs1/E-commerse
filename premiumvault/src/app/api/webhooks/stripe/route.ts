import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (!orderId) return NextResponse.json({ received: true });
    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existingOrder || existingOrder.status === "PAID") return NextResponse.json({ received: true });
    const credentialToken = uuidv4();
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.order.update({ where: { id: orderId }, data: { status: "PAID", paymentId: session.id, credentialToken, tokenExpiresAt } });
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/credentials/send-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": process.env.NEXTAUTH_SECRET! },
      body: JSON.stringify({ orderId }),
    }).catch(() => null);
  }
  return NextResponse.json({ received: true });
}
