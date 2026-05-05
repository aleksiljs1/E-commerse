# Team D — Email & Credential Collection

You are building the email system and the credential submission flow for **PremiumVault**. After a client pays, they receive an email with a secure link. They click it, submit their account credentials (username/email + password per service purchased), and receive a confirmation. You own everything related to email sending and the `/submit-credentials` page.

Team A built the project skeleton. Team C creates orders and calls your `/api/credentials/send-confirmation` endpoint. You do not touch the checkout page, admin, or product pages.

---

## Your File Ownership

```
src/
  lib/
    email/
      transporter.ts            ← Nodemailer SMTP client
      templates/
        purchase-confirmation.ts  ← HTML email: order confirmed + link
        credential-confirmation.ts← HTML email: credentials received
      send.ts                   ← sendEmail() wrapper function
  app/
    submit-credentials/
      page.tsx                  ← Credential submission page (client)
    api/
      credentials/
        route.ts                ← POST /api/credentials (submit credentials)
        [token]/
          route.ts              ← GET /api/credentials/[token] (fetch order by token)
        send-confirmation/
          route.ts              ← POST /api/credentials/send-confirmation (called by webhooks)
  components/
    credentials/
      CredentialModal.tsx       ← Modal per service item
      CredentialStepper.tsx     ← Step-through multiple items
      CredentialSuccess.tsx     ← Final success screen
```

---

## Prisma Models (read-only, Team A defined)

```
Order: id, orderNumber, customerEmail, totalAmount, status, credentialToken, tokenExpiresAt, items
OrderItem: id, orderId, productId, quantity, product { title, serviceType, logoUrl }
Credential: id, orderId, orderItemId, serviceType, username, password, status
```

---

## Step 1 — SMTP Transporter

`src/lib/email/transporter.ts`:

```typescript
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});
```

---

## Step 2 — Email Sending Wrapper

`src/lib/email/send.ts`:

```typescript
import { transporter } from "./transporter";

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  await transporter.sendMail({
    from: `"PremiumVault" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}
```

---

## Step 3 — Purchase Confirmation Email Template

`src/lib/email/templates/purchase-confirmation.ts`:

This email is sent immediately after payment. It contains:
- Order ID
- List of products purchased
- Total amount paid
- A prominent button linking to `/submit-credentials?token={credentialToken}`
- Instruction text: "To complete your upgrade, please submit your account credentials using the secure link below. This link expires in 7 days."

```typescript
type OrderItem = {
  title: string;
  quantity: number;
  priceAtPurchase: number;
};

type PurchaseConfirmationData = {
  orderNumber: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  credentialToken: string;
  appUrl: string;
};

export function purchaseConfirmationTemplate(data: PurchaseConfirmationData): string {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #27272a; color: #a1a1aa;">
            ${item.quantity}× ${item.title}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #27272a; text-align: right; color: #ffffff;">
            £${(item.priceAtPurchase * item.quantity).toFixed(2)}
          </td>
        </tr>`
    )
    .join("");

  const submitUrl = `${data.appUrl}/submit-credentials?token=${data.credentialToken}`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="background: #09090b; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 560px; margin: 0 auto;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">PremiumVault</h1>
      <p style="color: #71717a; font-size: 14px; margin-top: 8px;">Account Upgrade Services</p>
    </div>

    <!-- Card -->
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px;">
      <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 4px;">
        Payment Confirmed ✅
      </h2>
      <p style="color: #71717a; font-size: 14px; margin-top: 0; margin-bottom: 24px;">
        Order <strong style="color: #a1a1aa;">${data.orderNumber}</strong> — sent to ${data.customerEmail}
      </p>

      <!-- Items table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        ${itemRows}
        <tr>
          <td style="padding-top: 12px; font-weight: 700; color: #ffffff;">Total</td>
          <td style="padding-top: 12px; font-weight: 700; color: #ffffff; text-align: right;">
            £${data.totalAmount.toFixed(2)}
          </td>
        </tr>
      </table>

      <!-- Divider -->
      <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />

      <!-- CTA -->
      <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        To complete your upgrade, please submit your account credentials using the secure link below.
        <strong style="color: #ffffff;">This link expires in 7 days.</strong>
      </p>

      <a href="${submitUrl}"
         style="display: block; background: #6366f1; color: #ffffff; text-align: center;
                padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 16px;
                text-decoration: none; margin-bottom: 16px;">
        Submit My Credentials →
      </a>

      <p style="color: #52525b; font-size: 12px; text-align: center; margin: 0;">
        Or copy this link: <span style="color: #71717a;">${submitUrl}</span>
      </p>
    </div>

    <!-- Footer -->
    <p style="text-align: center; color: #52525b; font-size: 12px; margin-top: 24px;">
      Your account will be upgraded within 4–5 business days after credential submission.<br>
      Questions? Contact our support team.
    </p>
  </div>
</body>
</html>
  `;
}
```

---

## Step 4 — Credential Confirmation Email Template

`src/lib/email/templates/credential-confirmation.ts`:

Sent after the user successfully submits their credentials:

```typescript
type CredentialConfirmationData = {
  orderNumber: string;
  customerEmail: string;
  serviceCount: number;
};

export function credentialConfirmationTemplate(data: CredentialConfirmationData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background: #09090b; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 560px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">PremiumVault</h1>
    </div>
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
      <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; margin-bottom: 8px;">
        Credentials Received!
      </h2>
      <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Congratulations! We've received your account credentials for order
        <strong style="color: #ffffff;">${data.orderNumber}</strong>.
      </p>
      <div style="background: #09090b; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #22c55e; font-size: 14px; font-weight: 600; margin: 0;">
          ✅ ${data.serviceCount} account${data.serviceCount > 1 ? "s" : ""} queued for upgrade
        </p>
      </div>
      <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 0;">
        Your account${data.serviceCount > 1 ? "s" : ""} will be upgraded within
        <strong style="color: #ffffff;">4–5 business days</strong>.
        We will notify you at <strong style="color: #ffffff;">${data.customerEmail}</strong> once complete.
      </p>
    </div>
    <p style="text-align: center; color: #52525b; font-size: 12px; margin-top: 24px;">
      Thank you for choosing PremiumVault.
    </p>
  </div>
</body>
</html>
  `;
}
```

---

## Step 5 — Send Confirmation API Route (called by webhooks)

`src/app/api/credentials/send-confirmation/route.ts`:

Called internally by Team C's Stripe and PayPal webhooks after a successful payment.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { purchaseConfirmationTemplate } from "@/lib/email/templates/purchase-confirmation";

export async function POST(req: NextRequest) {
  const internalSecret = req.headers.get("x-internal-secret");
  if (internalSecret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order || !order.credentialToken) {
    return NextResponse.json({ error: "Order not found or no token" }, { status: 404 });
  }

  await sendEmail({
    to: order.customerEmail,
    subject: `PremiumVault — Order ${order.orderNumber} Confirmed`,
    html: purchaseConfirmationTemplate({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      items: order.items.map((i) => ({
        title: i.product.title,
        quantity: i.quantity,
        priceAtPurchase: Number(i.priceAtPurchase),
      })),
      totalAmount: Number(order.totalAmount),
      credentialToken: order.credentialToken,
      appUrl: process.env.NEXT_PUBLIC_APP_URL!,
    }),
  });

  return NextResponse.json({ success: true });
}
```

---

## Step 6 — Get Order by Token API Route

`src/app/api/credentials/[token]/route.ts`:

Returns order + order items (with product info) for the credential submission page. Does NOT expose existing credentials.

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const order = await prisma.order.findUnique({
    where: { credentialToken: token },
    include: {
      items: {
        include: { product: { select: { id: true, title: true, serviceType: true, logoUrl: true } } },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
  }

  if (order.status !== "PAID") {
    return NextResponse.json({ error: "Credentials already submitted" }, { status: 409 });
  }

  if (order.tokenExpiresAt && order.tokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "Link has expired" }, { status: 410 });
  }

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    items: order.items,
  });
}
```

---

## Step 7 — Submit Credentials API Route

`src/app/api/credentials/route.ts`:

Accepts all credentials for an order in one POST.

```typescript
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

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { token, credentials } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { credentialToken: token },
    include: { items: true },
  });

  if (!order || order.status !== "PAID") {
    return NextResponse.json({ error: "Invalid, expired, or already-used link" }, { status: 400 });
  }

  if (order.tokenExpiresAt && order.tokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "Link has expired" }, { status: 410 });
  }

  // Validate all orderItemIds belong to this order
  const validItemIds = new Set(order.items.map((i) => i.id));
  for (const cred of credentials) {
    if (!validItemIds.has(cred.orderItemId)) {
      return NextResponse.json({ error: "Invalid order item" }, { status: 400 });
    }
  }

  // Hash passwords and store credentials
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
      data: { status: "CREDENTIALS_SUBMITTED", credentialToken: null }, // invalidate token
    }),
  ]);

  // Send confirmation email
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
```

---

## Step 8 — Credential Submission Page

`src/app/submit-credentials/page.tsx`:

**Client component.** Reads `?token=` from URL, fetches order items, shows a step-by-step modal/form for each item.

### Flow

1. Page loads → fetch `GET /api/credentials/{token}`
2. If error (invalid/expired/already submitted): show error state
3. If success: show list of items needing credentials
4. User fills in credentials per item (modal or inline form)
5. Review screen: show all entered credentials (username only, not password)
6. Accept & Submit → POST `/api/credentials`
7. Success screen: "Congratulations! Upgrading in 4–5 days" + confirmation message

### Detailed Page Implementation

```typescript
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { ServiceIcon } from "@/components/store/ServiceIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type OrderItem = {
  id: string;
  quantity: number;
  product: { id: string; title: string; serviceType: string; logoUrl: string | null };
};

type CredentialEntry = {
  orderItemId: string;
  serviceType: string;
  username: string;
  password: string;
};

const credentialSchema = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
  confirmPassword: z.string().min(1, "Required"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type CredentialFormData = z.infer<typeof credentialSchema>;

export default function SubmitCredentialsPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [collectedCredentials, setCollectedCredentials] = useState<CredentialEntry[]>([]);
  const [stage, setStage] = useState<"loading" | "error" | "filling" | "review" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CredentialFormData>({
    resolver: zodResolver(credentialSchema),
  });

  // Expand items by quantity — e.g. 2× Spotify = 2 separate entries
  const expandedItems = items.flatMap((item) =>
    Array.from({ length: item.quantity }, (_, i) => ({
      ...item,
      instanceLabel: item.quantity > 1 ? ` (${i + 1} of ${item.quantity})` : "",
      uniqueKey: `${item.id}-${i}`,
    }))
  );

  useEffect(() => {
    if (!token) { setStage("error"); setErrorMessage("No token provided."); return; }
    api.get(`/api/credentials/${token}`)
      .then((res) => {
        setOrderNumber(res.data.orderNumber);
        setItems(res.data.items);
        setStage("filling");
      })
      .catch((err) => {
        setStage("error");
        setErrorMessage(err.response?.data?.error ?? "Invalid or expired link.");
      });
  }, [token]);

  const onCredentialSubmit = (data: CredentialFormData) => {
    const item = expandedItems[currentItemIndex];
    setCollectedCredentials((prev) => [
      ...prev,
      {
        orderItemId: item.id,
        serviceType: item.product.serviceType,
        username: data.username,
        password: data.password,
      },
    ]);
    reset();
    if (currentItemIndex + 1 < expandedItems.length) {
      setCurrentItemIndex((i) => i + 1);
    } else {
      setStage("review");
    }
  };

  const onFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/api/credentials", { token, credentials: collectedCredentials });
      setStage("success");
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (stage === "loading") {
    return <LoadingScreen />;
  }

  if (stage === "error") {
    return <ErrorScreen message={errorMessage} />;
  }

  if (stage === "success") {
    return <CredentialSuccess orderNumber={orderNumber ?? ""} />;
  }

  if (stage === "review") {
    return (
      <ReviewScreen
        credentials={collectedCredentials}
        expandedItems={expandedItems}
        onConfirm={onFinalSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Filling stage — show one item at a time
  const currentItem = expandedItems[currentItemIndex];
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress */}
        <p className="text-sm text-zinc-500 text-center mb-6">
          Step {currentItemIndex + 1} of {expandedItems.length}
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {/* Service icon + title */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <ServiceIcon
              serviceType={currentItem.product.serviceType}
              logoUrl={currentItem.product.logoUrl}
              size="lg"
            />
            <h2 className="text-xl font-bold text-center">
              {currentItem.product.title}{currentItem.instanceLabel}
            </h2>
            <p className="text-sm text-zinc-400 text-center">
              Enter the account credentials you want us to upgrade.
            </p>
          </div>

          <form onSubmit={handleSubmit(onCredentialSubmit)} className="space-y-4">
            <div>
              <Label>Email / Username</Label>
              <Input
                placeholder="your@email.com or username"
                className="bg-zinc-800 border-zinc-700 mt-1"
                {...register("username")}
              />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-700 mt-1"
                {...register("password")}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-700 mt-1"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2">
              {currentItemIndex + 1 < expandedItems.length ? "Next →" : "Review & Accept"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### CredentialSuccess Component

`src/components/credentials/CredentialSuccess.tsx`:

```typescript
type Props = { orderNumber: string };
export function CredentialSuccess({ orderNumber }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold">Congratulations!</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Your credentials have been successfully received for order{" "}
          <span className="font-mono text-white">{orderNumber}</span>.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-green-400 font-semibold">✅ Submission successful</p>
          <p className="text-zinc-400 text-sm mt-1">
            Your account will be upgraded within <strong className="text-white">4–5 business days</strong>.
            A confirmation email has been sent to your inbox.
          </p>
        </div>
      </div>
    </div>
  );
}
```

### ReviewScreen Component

`src/components/credentials/CredentialStepper.tsx`:

Show a summary of all entered credentials (username only — never show password in review):
- List each service with the username the user entered
- Warning text: "Please review your credentials below before accepting."
- "Make sure all details are correct — once submitted, you cannot change them."
- "Accept & Submit" button
- "Go Back" button (resets to filling from start)

---

## Helper Screen Components

Implement these small components inline or as separate files:

**LoadingScreen**: Spinner centered on dark background with "Loading your order..."

**ErrorScreen**: Error icon + message text + "Return to Home" button

---

## DO NOT Build

- Checkout page — Team C
- Admin pages — Team E
- Product/cart UI — Team B
- Payment processing — Team C
- Prisma schema changes — Team A

Your job ends when: a purchased order's token link opens the credential form, credentials for each item are collected step-by-step, hashed and stored in the DB, the order status updates to CREDENTIALS_SUBMITTED, and both confirmation emails send correctly.
