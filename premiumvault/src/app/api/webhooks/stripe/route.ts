import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook/stripe] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      console.warn("[webhook/stripe] Received event with no orderId in metadata, session:", session.id);
      return NextResponse.json({ received: true });
    }

    try {
      const credentialToken = uuidv4();
      const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Atomic: only updates if still PENDING — makes webhook idempotent
      const result = await prisma.order.updateMany({
        where: { id: orderId, status: "PENDING" },
        data: { status: "PAID", paymentId: session.id, credentialToken, tokenExpiresAt },
      });

      if (result.count === 0) {
        // Already processed by a previous delivery
        return NextResponse.json({ received: true });
      }

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/credentials/send-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-secret": process.env.NEXTAUTH_SECRET! },
        body: JSON.stringify({ orderId }),
      }).catch((err) => console.error("[webhook/stripe] Failed to send confirmation email for order", orderId, err));
    } catch (err) {
      console.error("[webhook/stripe] Failed to process payment for order", orderId, err);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
