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

    // Stock validation
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for "${product.title}"` }, { status: 400 });
      }
    }

    // Double-submit protection: check for duplicate pending order in last 60 seconds
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
    const existingOrder = await prisma.order.findFirst({
      where: {
        customerEmail: email,
        status: "PENDING",
        createdAt: { gte: sixtySecondsAgo },
        items: { every: { productId: { in: productIds } } },
      },
      include: { items: true },
    });
    if (existingOrder && existingOrder.items.length === items.length) {
      const isSameItems = items.every((item) =>
        existingOrder.items.some((ei) => ei.productId === item.productId && ei.quantity === item.quantity)
      );
      if (isSameItems) {
        if (paymentMethod === "STRIPE") {
          return NextResponse.json({ orderId: existingOrder.id, url: null, duplicate: true });
        }
        return NextResponse.json({ orderId: existingOrder.id, approveUrl: null, duplicate: true });
      }
    }

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return { productId: item.productId, quantity: item.quantity, priceAtPurchase: Number(product.price), lineTotal: Number(product.price) * item.quantity };
    });
    const totalAmount = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const orderNumber = `PV-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    // Use transaction for order creation + stock decrement
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber, customerEmail: email, totalAmount, paymentMethod, status: "PENDING",
          items: { create: orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity, priceAtPurchase: i.priceAtPurchase })) },
        },
      });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      return newOrder;
    });

    if (paymentMethod === "STRIPE") {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: orderItems.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return {
            price_data: {
              currency: "gbp",
              product_data: { name: product.title },
              unit_amount: Math.round(item.priceAtPurchase * 100),
            },
            quantity: item.quantity,
          };
        }),
        metadata: { orderId: order.id, orderNumber },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      });
      return NextResponse.json({ orderId: order.id, url: session.url });
    }
    const { id: paypalOrderId, approveUrl } = await createPayPalOrder(totalAmount);
    await prisma.order.update({ where: { id: order.id }, data: { paymentId: paypalOrderId } });
    return NextResponse.json({ orderId: order.id, approveUrl });
  } catch (error) {
    console.error("[orders/POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
