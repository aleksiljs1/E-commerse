# Team C — Checkout & Payments

You are building the checkout page, order creation, Stripe integration, and PayPal integration for **PremiumVault**. Team A has built the project skeleton (Prisma schema, auth, Docker). Team B builds the cart and store UI. You work on a completely separate set of files with no overlaps.

---

## Your File Ownership

```
src/
  lib/
    stripe.ts                          ← Stripe SDK singleton
    paypal.ts                          ← PayPal helpers
  app/
    (store)/
      checkout/
        page.tsx                       ← Checkout page (client)
    api/
      orders/
        route.ts                       ← POST /api/orders (create order)
        [id]/
          route.ts                     ← GET /api/orders/[id] (status check)
      webhooks/
        stripe/
          route.ts                     ← POST /api/webhooks/stripe
        paypal/
          route.ts                     ← POST /api/webhooks/paypal
  components/
    store/
      PaymentMethodSelector.tsx        ← Stripe / PayPal F&F buttons
      OrderSummary.tsx                 ← Left-side order items list
      CheckoutForm.tsx                 ← Right-side email + payment form
```

---

## Prisma Schema Context (read-only, already created by Team A)

Key models you use:
- `Order`: id, orderNumber, customerEmail, totalAmount, status (PENDING→PAID), paymentMethod (STRIPE|PAYPAL), paymentId, credentialToken, tokenExpiresAt
- `OrderItem`: orderId, productId, quantity, priceAtPurchase
- `Product`: id, title, price, stock, serviceType, logoUrl

---

## Stripe Setup

`src/lib/stripe.ts`:

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});
```

---

## PayPal Helpers

`src/lib/paypal.ts`:

```typescript
const PAYPAL_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token as string;
}

export async function createPayPalOrder(amountGBP: number): Promise<{ id: string; approveUrl: string }> {
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "GBP",
            value: amountGBP.toFixed(2),
          },
          description: "PremiumVault Account Upgrade",
        },
      ],
      application_context: {
        brand_name: "PremiumVault",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/paypal?action=capture`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
      },
    }),
  });

  const data = await res.json();
  const approveUrl = data.links?.find((l: { rel: string; href: string }) => l.rel === "approve")?.href ?? "";
  return { id: data.id, approveUrl };
}

export async function capturePayPalOrder(orderId: string): Promise<{ status: string; captureId: string }> {
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? "";
  return { status: data.status, captureId };
}
```

---

## Order Creation API

`src/app/api/orders/route.ts`:

**POST** — Creates a new order from cart, returns order ID + Stripe payment intent (client secret) or PayPal approval URL.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { createPayPalOrder } from "@/lib/paypal";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const orderSchema = z.object({
  email: z.string().email(),
  paymentMethod: z.enum(["STRIPE", "PAYPAL"]),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { email, paymentMethod, items } = parsed.data;

    // Fetch products and validate stock
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more products not found" }, { status: 404 });
    }

    // Calculate total
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: Number(product.price),
        lineTotal: Number(product.price) * item.quantity,
      };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const orderNumber = `PV-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail: email,
        totalAmount,
        paymentMethod,
        status: "PENDING",
        items: {
          create: orderItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            priceAtPurchase: i.priceAtPurchase,
          })),
        },
      },
    });

    // Return payment details based on method
    if (paymentMethod === "STRIPE") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // pence
        currency: "gbp",
        metadata: { orderId: order.id, orderNumber },
        receipt_email: email,
      });

      return NextResponse.json({
        orderId: order.id,
        clientSecret: paymentIntent.client_secret,
      });
    }

    // PayPal
    const { id: paypalOrderId, approveUrl } = await createPayPalOrder(totalAmount);

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: paypalOrderId },
    });

    return NextResponse.json({ orderId: order.id, approveUrl });
  } catch (error) {
    console.error("[orders/POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

---

## Order Status Check

`src/app/api/orders/[id]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true, orderNumber: true, credentialToken: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
```

---

## Stripe Webhook

`src/app/api/webhooks/stripe/route.ts`:

```typescript
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

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const orderId = intent.metadata?.orderId;
    if (!orderId) return NextResponse.json({ received: true });

    const credentialToken = uuidv4();
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paymentId: intent.id,
        credentialToken,
        tokenExpiresAt,
      },
    });

    // Trigger email — call internal API route (Team D will implement this endpoint)
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/credentials/send-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": process.env.NEXTAUTH_SECRET! },
      body: JSON.stringify({ orderId }),
    }).catch(() => null); // Don't block on email failure
  }

  return NextResponse.json({ received: true });
}

export const config = { api: { bodyParser: false } };
```

---

## PayPal Webhook / Return Handler

`src/app/api/webhooks/paypal/route.ts`:

Handles the `return_url` redirect from PayPal after the user approves payment.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const token = searchParams.get("token"); // PayPal order ID

  if (action !== "capture" || !token) {
    return NextResponse.redirect(new URL("/checkout?error=invalid", req.url));
  }

  try {
    const { status, captureId } = await capturePayPalOrder(token);

    if (status !== "COMPLETED") {
      return NextResponse.redirect(new URL("/checkout?error=payment_failed", req.url));
    }

    const order = await prisma.order.findFirst({
      where: { paymentId: token },
    });

    if (!order) {
      return NextResponse.redirect(new URL("/checkout?error=order_not_found", req.url));
    }

    const credentialToken = uuidv4();
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentId: captureId,
        credentialToken,
        tokenExpiresAt,
      },
    });

    // Trigger confirmation email
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/credentials/send-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": process.env.NEXTAUTH_SECRET! },
      body: JSON.stringify({ orderId: order.id }),
    }).catch(() => null);

    return NextResponse.redirect(
      new URL(`/checkout/success?orderId=${order.id}`, req.url)
    );
  } catch {
    return NextResponse.redirect(new URL("/checkout?error=capture_failed", req.url));
  }
}
```

---

## Checkout Page

`src/app/(store)/checkout/page.tsx`:

**Client component.** Reads cart from Zustand store. This is a two-column layout with NO navbar or footer — just the site logo at the top.

### Visual Structure

```
[PremiumVault logo + name — centered or left-aligned, no nav]

[LEFT COLUMN — order summary]          [VERTICAL LINE — partition]    [RIGHT COLUMN — form]

1× YouTube Premium — £11.99                                         Checkout
2× Spotify Premium — £19.98                                         ─────────────────
                                                                     Email
                              Total: £31.97                          "The order will be sent to this email"
                                                                     [email input field]

                                                                     Payment Method
                                                                     "Select payment method"
                                                                     [PayPal F&F button]  [Stripe button]

                                                                     [Continue to Payment — disabled until method selected]

                                                                     🔒 Your data is secured by extended validation SSL
                                                                        certificates (256-bit encryption)...
```

### Implementation Details

```typescript
"use client";
import { useCartStore } from "@/store/cart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { ServiceIcon } from "@/components/store/ServiceIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "PAYPAL" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  if (items.length === 0) {
    router.replace("/");
    return null;
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (!paymentMethod) return;
    setIsProcessing(true);

    try {
      const res = await api.post("/api/orders", {
        email: data.email,
        paymentMethod,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });

      if (paymentMethod === "STRIPE") {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe failed to load");

        const { error } = await stripe.redirectToCheckout({
          // Use confirmCardPayment instead if using Elements
          // For simplicity, redirect to Stripe Checkout:
          sessionId: res.data.clientSecret, // adjust if using payment intents
        });

        // NOTE: For production, implement Stripe Elements inline payment form
        // or use stripe.confirmPayment with an Elements provider.
        // For now, redirect approach:
        if (error) throw error;
      } else {
        // PayPal — redirect to approval URL
        window.location.href = res.data.approveUrl;
      }

      clearCart();
    } catch (err) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top logo bar */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <span className="text-xl font-bold">PremiumVault</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-10">
          {/* Left: Order Summary */}
          <OrderSummaryColumn items={items} subtotal={subtotal()} />

          {/* Center: Divider */}
          <div className="hidden lg:block bg-zinc-800" />

          {/* Right: Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Checkout</h2>
              <Separator className="bg-zinc-800" />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Email</Label>
              <p className="text-sm text-zinc-400">The order will be sent to this email</p>
              <Input
                type="email"
                placeholder="your@email.com"
                className="bg-zinc-900 border-zinc-700"
                {...register("email")}
              />
              {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Payment Method</Label>
              <p className="text-sm text-zinc-400">Select payment method</p>
              <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
            </div>

            <Button
              type="submit"
              disabled={!paymentMethod || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? "Processing..." : "Continue to Payment"}
            </Button>

            <p className="text-xs text-zinc-500 text-center leading-relaxed">
              🔒 Your data is secured by extended validation SSL certificates (256-bit encryption).
              This complies with the strongest payment security standard available today.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
```

### Order Summary Column

`src/components/store/OrderSummary.tsx`:

Renders items grouped by productId (no duplicate rows — show quantity inline):
```
1× YouTube Premium — Personal    £11.99
2× Spotify Premium — Personal    £19.98
───────────────────────────────────────
Total                             £31.97
```

Each line: left side is `{quantity}× {title}`, right side is `£{(price * quantity).toFixed(2)}`.
Show the service icon (sm) next to the title.
Bottom: `Total` row in bold with the subtotal.

### Payment Method Selector

`src/components/store/PaymentMethodSelector.tsx`:

Two rectangular buttons side by side:
- Left: "PayPal F&F" — with PayPal icon/text
- Right: "Stripe" — with Stripe icon/text (card symbol)

When selected, button gets an active border/highlight (`ring-2 ring-indigo-500`). Only one can be selected.

```typescript
type Props = {
  selected: "STRIPE" | "PAYPAL" | null;
  onSelect: (method: "STRIPE" | "PAYPAL") => void;
};
```

---

## Checkout Success Page

Create `src/app/(store)/checkout/success/page.tsx`:

Simple success page. Query param: `orderId`.
- Shows: "Payment successful! 🎉"
- Shows: "Check your email — we've sent you a link to submit your account credentials."
- Shows order ID prominently
- Button: "Return to Home"

```typescript
"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold">Payment Successful!</h1>
        <p className="text-zinc-400">
          Thank you for your order. We have sent a confirmation email with a secure link
          to submit your account credentials.
        </p>
        {orderId && (
          <p className="text-sm text-zinc-500">
            Order ID: <span className="font-mono text-zinc-300">{orderId}</span>
          </p>
        )}
        <Link href="/">
          <Button variant="outline" className="border-zinc-700">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

---

## Stripe Integration Notes for Production

The current implementation uses redirect-based Stripe checkout. For production, replace with Stripe Elements:
1. Install `@stripe/react-stripe-js`
2. Wrap checkout form in `<Elements stripe={stripePromise} options={{ clientSecret }}>` 
3. Use `<PaymentElement />` + `stripe.confirmPayment()` for in-page payment
4. The API route should create a PaymentIntent and return `client_secret`

This scaffolding is ready — just swap the redirect for the Elements approach when going live.

---

## DO NOT Build

- Home page, product listing, product detail — Team B
- Cart sheet / Zustand store — Team B
- Admin pages — Team E
- Email templates and sending — Team D (you only call their endpoint)
- Credential submission page — Team D
- Admin product/order management — Team E

Your job ends when orders can be created, Stripe and PayPal are wired up, webhooks update order status, and the success page shows correctly.
