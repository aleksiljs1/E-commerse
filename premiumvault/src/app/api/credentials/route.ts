import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { credentialConfirmationTemplate } from "@/lib/email/templates/credential-confirmation";
import { getEmailSettings } from "@/lib/email/settings";
import { apiError } from "@/lib/api-error";
import { notifyAdminCredentialsSubmitted } from "@/lib/email/notify-admin";
import { z } from "zod";
import { encrypt } from "@/lib/crypto";

const submitSchema = z.object({
  token: z.string(),
  credentials: z.array(
    z.object({
      orderItemId: z.string(),
      serviceType: z.string(),
      username: z.string().min(1),
      password: z.string().min(1),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return apiError("Invalid request", 400);
  const { token, credentials } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { credentialToken: token },
      include: { items: { include: { product: { select: { title: true, productType: true } } } } },
    });

    if (!order) return apiError("Invalid or expired link", 400);
    if (order.status !== "PAID") return apiError("Invalid, expired, or already-used link", 400);
    if (order.tokenExpiresAt && order.tokenExpiresAt < new Date()) return apiError("Link has expired", 410);

    const validItemIds = new Set(
      order.items
        .filter((i) => i.product.productType === "UPGRADE")
        .map((i) => i.id)
    );
    if (validItemIds.size === 0) {
      return apiError("This order does not require credential submission", 400);
    }
    for (const cred of credentials) {
      if (!validItemIds.has(cred.orderItemId)) return apiError("Invalid order item", 400);
    }

    const credentialData = credentials.map((cred) => ({
      orderId: order.id,
      orderItemId: cred.orderItemId,
      serviceType: cred.serviceType,
      username: cred.username,
      password: encrypt(cred.password),
      status: "SUBMITTED" as const,
      submittedAt: new Date(),
    }));

    // Interactive transaction — re-checks status inside the lock so concurrent
    // submissions for the same order can't both succeed
    await prisma.$transaction(async (tx) => {
      const locked = await tx.order.findUnique({
        where: { id: order.id },
        select: { status: true },
      });
      if (!locked || locked.status !== "PAID") {
        throw Object.assign(new Error("Already processed"), { code: "ALREADY_PROCESSED" });
      }
      await tx.credential.createMany({ data: credentialData });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CREDENTIALS_SUBMITTED" },
        // credentialToken is intentionally kept so [token] route returns 409 "already submitted"
        // instead of 404 "invalid link" if the customer tries again
      });
    });

    getEmailSettings().then((settings) =>
      sendEmail({
        to: order.customerEmail,
        subject: settings.credentialSubject,
        orderId: order.id,
        html: credentialConfirmationTemplate({
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          serviceCount: credentials.length,
          heading: settings.credentialHeading,
          body: settings.credentialBody,
          footer: settings.credentialFooter,
        }),
      })
    ).catch((err) => console.error("[credentials/POST] Confirmation email failed for order", order.id, err));

    // Notify admin — credentials submitted, action required
    notifyAdminCredentialsSubmitted({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      items: order.items.map((i) => ({
        title: i.product.title,
        quantity: i.quantity,
        priceAtPurchase: Number(i.priceAtPurchase),
      })),
      totalAmount: Number(order.totalAmount),
      hasUpgradeItems: true,
    }).catch((err) => console.error("[credentials/POST] Admin notification failed:", err));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "ALREADY_PROCESSED") {
      return apiError("Credentials have already been submitted for this order", 409);
    }
    return apiError("Internal server error", 500, "credentials/POST", err);
  }
}
