import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { credentialConfirmationTemplate } from "@/lib/email/templates/credential-confirmation";
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
  const body = await req.json();
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { token, credentials } = parsed.data;
  const order = await prisma.order.findUnique({ where: { credentialToken: token }, include: { items: true } });
  if (!order || order.status !== "PAID") return NextResponse.json({ error: "Invalid, expired, or already-used link" }, { status: 400 });
  if (order.tokenExpiresAt && order.tokenExpiresAt < new Date()) return NextResponse.json({ error: "Link has expired" }, { status: 410 });
  const validItemIds = new Set(order.items.map((i) => i.id));
  for (const cred of credentials) {
    if (!validItemIds.has(cred.orderItemId)) return NextResponse.json({ error: "Invalid order item" }, { status: 400 });
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
  await prisma.$transaction([
    prisma.credential.createMany({ data: credentialData }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "CREDENTIALS_SUBMITTED", credentialToken: null },
    }),
  ]);
  await sendEmail({
    to: order.customerEmail,
    subject: "PremiumVault — Credentials Received ✅",
    html: credentialConfirmationTemplate({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      serviceCount: credentials.length,
    }),
  }).catch(() => null);
  return NextResponse.json({ success: true });
}
