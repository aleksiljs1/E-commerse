import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { createPayPalOrder } from "@/lib/paypal";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const orderSchema = z.object({
  email: z.string().email(),
  paymentMethod: z.enum(["STRIPE", "PAYPAL"]),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const { email, paymentMethod, items } = parsed.data;
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, active: true } });
    if (products.length !== productIds.length) return NextResponse.json({ error: "One or more products not found" }, { status: 404 });
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return { productId: item.productId, quantity: item.quantity, priceAtPurchase: Number(product.price), lineTotal: Number(product.price) * item.quantity };
    });
    const totalAmount = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const orderNumber = `PV-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 6).toUpperCase()}`;
    const order = await prisma.order.create({
      data: {
        orderNumber, customerEmail: email, totalAmount, paymentMethod, status: "PENDING",
        items: { create: orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity, priceAtPurchase: i.priceAtPurchase })) },
      },
    });
    if (paymentMethod === "STRIPE") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), currency: "gbp",
        metadata: { orderId: order.id, orderNumber }, receipt_email: email,
      });
      return NextResponse.json({ orderId: order.id, clientSecret: paymentIntent.client_secret });
    }
    const { id: paypalOrderId, approveUrl } = await createPayPalOrder(totalAmount);
    await prisma.order.update({ where: { id: order.id }, data: { paymentId: paypalOrderId } });
    return NextResponse.json({ orderId: order.id, approveUrl });
  } catch (error) {
    console.error("[orders/POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
