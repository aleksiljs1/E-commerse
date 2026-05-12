import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";
import { accountDeliveryTemplate } from "@/lib/email/templates/account-delivery";
import { getEmailSettings } from "@/lib/email/settings";
import { encrypt } from "@/lib/crypto";

interface CredentialInput {
  orderItemId: string;
  username: string;
  password: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { credentials } = body as { credentials?: unknown };

    // Validate credentials input
    if (
      !Array.isArray(credentials) ||
      credentials.length === 0 ||
      !credentials.every(
        (c): c is CredentialInput =>
          c !== null &&
          typeof c === "object" &&
          typeof (c as any).orderItemId === "string" &&
          (c as any).orderItemId.trim() !== "" &&
          typeof (c as any).username === "string" &&
          (c as any).username.trim() !== "" &&
          typeof (c as any).password === "string" &&
          (c as any).password.trim() !== ""
      )
    ) {
      return NextResponse.json(
        {
          error:
            "credentials must be a non-empty array with orderItemId, username, and password fields",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { title: true, serviceType: true, productType: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PAID") {
      return NextResponse.json(
        { error: `Order must be in PAID status to fulfill (current: ${order.status})` },
        { status: 400 }
      );
    }

    const nonDropship = order.items.filter(
      (item) => item.product.productType !== "DROPSHIP"
    );
    if (nonDropship.length > 0) {
      return NextResponse.json(
        { error: "Order is not a dropship order" },
        { status: 400 }
      );
    }

    // Build a lookup map for order items
    const itemMap = new Map(order.items.map((item) => [item.id, item]));

    // Validate that all provided orderItemIds exist on this order
    for (const cred of credentials) {
      if (!itemMap.has(cred.orderItemId)) {
        return NextResponse.json(
          { error: `orderItemId ${cred.orderItemId} does not belong to this order` },
          { status: 400 }
        );
      }
    }

    // Execute in a single transaction
    await prisma.$transaction(async (tx) => {
      for (const cred of credentials) {
        const item = itemMap.get(cred.orderItemId)!;
        await tx.credential.create({
          data: {
            orderId: order.id,
            orderItemId: cred.orderItemId,
            serviceType: item.product.serviceType,
            username: cred.username,
            password: encrypt(cred.password),
            status: "UPGRADED",
            submittedAt: new Date(),
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "COMPLETED",
          credentialToken: null,
          tokenExpiresAt: null,
        },
      });
    });

    // Fire-and-forget: send account delivery email
    (async () => {
      try {
        const emailSettings = await getEmailSettings();
        const accounts = credentials.map((cred) => {
          const item = itemMap.get(cred.orderItemId)!;
          return {
            productTitle: item.product.title,
            username: cred.username,
            password: cred.password,
          };
        });

        const html = accountDeliveryTemplate({
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          accounts,
          supportEmail: emailSettings.supportEmail,
        });

        await sendEmail({
          to: order.customerEmail,
          subject: `PremiumVault — Your Account Details (Order ${order.orderNumber})`,
          html,
          orderId: order.id,
        });
      } catch (emailErr) {
        console.error("[fulfill] Failed to send account delivery email:", emailErr);
      }
    })();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[admin/orders/[id]/fulfill] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
