import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { credentialConfirmationTemplate } from "@/lib/email/templates/credential-confirmation";
import { apiError } from "@/lib/api-error";
import bcrypt from "bcryptjs";
import { z } from "zod";

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
      include: { items: true },
    });

    if (!order) return apiError("Invalid or expired link", 400);
    if (order.status !== "PAID") return apiError("Invalid, expired, or already-used link", 400);
    if (order.tokenExpiresAt && order.tokenExpiresAt < new Date()) return apiError("Link has expired", 410);

    const validItemIds = new Set(order.items.map((i) => i.id));
    for (const cred of credentials) {
      if (!validItemIds.has(cred.orderItemId)) return apiError("Invalid order item", 400);
    }

    const credentialData = await Promise.all(
      credentials.map(async (cred) => ({
        orderId: order.id,
        orderItemId: cred.orderItemId,
        serviceType: cred.serviceType,
        username: cred.username,
        password: await bcrypt.hash(cred.password, 12),
        status: "SUBMITTED" as const,
        submittedAt: new Date(),
      }))
    );

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
        data: { status: "CREDENTIALS_SUBMITTED", credentialToken: null },
      });
    });

    sendEmail({
      to: order.customerEmail,
      subject: "PremiumVault — Credentials Received ✅",
      html: credentialConfirmationTemplate({
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        serviceCount: credentials.length,
      }),
    }).catch((err) => console.error("[credentials/POST] Confirmation email failed for order", order.id, err));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "ALREADY_PROCESSED") {
      return apiError("Credentials have already been submitted for this order", 409);
    }
    return apiError("Internal server error", 500, "credentials/POST", err);
  }
}
