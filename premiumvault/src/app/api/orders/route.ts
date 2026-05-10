import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { apiError } from "@/lib/api-error";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { getTierConfig, getDiscountPercent } from "@/lib/discount-tiers";
import { emailSchema } from "@/lib/email-validation";

const orderSchema = z.object({
  email: emailSchema,
  paymentMethod: z.enum(["STRIPE", "PAYPAL"]),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1),
  couponCode: z.string().optional(),
});

async function rollbackOrder(orderId: string, items: { productId: string; quantity: number }[]) {
  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
    for (const item of items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
  }).catch((e) => console.error("[orders/rollback] Failed to roll back order", orderId, e));
}

/** Cancel PENDING orders older than 1 hour and restore their stock */
async function cleanupStalePendingOrders() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const staleOrders = await prisma.order.findMany({
    where: { status: "PENDING", paymentMethod: "STRIPE", createdAt: { lt: oneHourAgo } },
    include: { items: { select: { productId: true, quantity: true } } },
  });

  for (const order of staleOrders) {
    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { id: order.id, status: "PENDING" },
        data: { status: "CANCELLED" },
      });
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }).catch((e) => console.error("[orders/cleanup] Failed to cancel stale order", order.id, e));
  }

  if (staleOrders.length > 0) {
    console.log(`[orders/cleanup] Cancelled ${staleOrders.length} stale PENDING order(s)`);
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return apiError("Invalid request", 400);
  const { email, paymentMethod, items, couponCode } = parsed.data;

  try {
    // Clean up abandoned orders older than 1 hour — restores reserved stock
    await cleanupStalePendingOrders();

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, active: true } });
    if (products.length !== productIds.length) return apiError("One or more products not found", 404);

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        return apiError(`Insufficient stock for "${product.title}"`, 400);
      }
    }

    // FIX 4: Double-submit protection — also checks that coupon code matches the existing order
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
    const existingOrder = await prisma.order.findFirst({
      where: { customerEmail: email, status: "PENDING", createdAt: { gte: sixtySecondsAgo }, items: { every: { productId: { in: productIds } } } },
      include: { items: true, coupon: { select: { code: true } } },
    });
    if (existingOrder && existingOrder.items.length === items.length) {
      const isSame = items.every((item) => existingOrder.items.some((ei) => ei.productId === item.productId && ei.quantity === item.quantity));
      const sameCoupon = (couponCode ?? "") === (existingOrder.coupon?.code ?? "");
      if (isSame && sameCoupon) {
        return NextResponse.json({ orderId: existingOrder.id, ...(paymentMethod === "STRIPE" ? { url: null } : {}), duplicate: true });
      }
    }

    // Link order to logged-in user if available
    const session = await auth();
    const userId = session?.user?.id ?? null;

    // Calculate tier discount for logged-in users
    let discountPercent = 0;
    if (userId) {
      const orderCount = await prisma.order.count({
        where: { userId, status: { notIn: ["CANCELLED", "PENDING"] } },
      });
      const tierConfig = await getTierConfig();
      discountPercent = getDiscountPercent(orderCount, tierConfig);
    }

    // Validate coupon code if provided
    let couponId: string | null = null;
    let couponDiscountPct = 0;
    let coupon: Awaited<ReturnType<typeof prisma.coupon.findUnique>> | null = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
      if (!coupon) return apiError("Invalid coupon code", 400);
      if (!coupon.active) return apiError("This coupon is no longer active", 400);
      if (new Date() > coupon.expiresAt) return apiError("This coupon has expired", 400);
      if (coupon.timesUsed >= coupon.maxUses) return apiError("This coupon has reached its usage limit", 400);
      couponId = coupon.id;
      couponDiscountPct = coupon.discountPct;

      // FIX 3: Per-user coupon limit check (0 = unlimited)
      if (coupon.maxUsesPerUser > 0) {
        const userCouponUses = await prisma.order.count({
          where: {
            couponId: coupon.id,
            customerEmail: email,
            status: { notIn: ["CANCELLED", "PENDING"] },
          },
        });
        if (userCouponUses >= coupon.maxUsesPerUser) {
          return apiError("You have already used this coupon the maximum number of times", 400);
        }
      }
    }

    // Use the higher discount between tier and coupon
    const effectiveDiscount = Math.max(discountPercent, couponDiscountPct);

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return { productId: item.productId, quantity: item.quantity, priceAtPurchase: Number(product.price), lineTotal: Number(product.price) * item.quantity };
    });
    const rawTotal = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const totalAmount = effectiveDiscount > 0 ? rawTotal * (1 - effectiveDiscount / 100) : rawTotal;
    const orderNumber = `PV-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber, customerEmail: email, userId, couponId, totalAmount, paymentMethod, status: "PENDING",
          items: { create: orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity, priceAtPurchase: i.priceAtPurchase })) },
        },
      });
      for (const item of items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      }
      return newOrder;
    });

    if (paymentMethod === "STRIPE") {
      try {
        const stripeSession = await stripe.checkout.sessions.create({
          mode: "payment",
          customer_email: email,
          line_items: orderItems.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            const discountedUnitAmount = Math.round(item.priceAtPurchase * (1 - effectiveDiscount / 100) * 100);
            return { price_data: { currency: "gbp", product_data: { name: product.title }, unit_amount: discountedUnitAmount }, quantity: item.quantity };
          }),
          metadata: { orderId: order.id, orderNumber },
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
        });
        return NextResponse.json({ orderId: order.id, url: stripeSession.url });
      } catch (err) {
        console.error("[orders/POST] Stripe session creation failed:", err);
        await rollbackOrder(order.id, items);
        return apiError("Payment provider unavailable. Please try again.", 502);
      }
    }

    // PayPal F&F: no API call needed — customer sends payment manually
    return NextResponse.json({ orderId: order.id });
  } catch (err: unknown) {
    return apiError("Internal error", 500, "orders/POST", err);
  }
}
