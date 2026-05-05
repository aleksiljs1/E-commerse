# Team E — Admin Dashboard

You are building the complete admin panel for **PremiumVault**. The admin can log in, manage products (add/edit/delete with image upload), view all orders grouped by order ID with full credential details, and filter by status. All admin routes are protected by Auth.js middleware (already set up by Team A).

You do NOT touch store pages, checkout, email internals, or the credential submission page.

---

## Your File Ownership

```
src/
  app/
    admin/
      login/
        page.tsx                    ← Admin login page
      dashboard/
        layout.tsx                  ← Admin layout (sidebar + header)
        page.tsx                    ← Dashboard overview stats
        products/
          page.tsx                  ← Product management
          new/page.tsx              ← Add new product
          [id]/
            edit/page.tsx           ← Edit product
        orders/
          page.tsx                  ← Orders table (all + filters)
          [id]/
            page.tsx                ← Order detail (full credentials view)
    api/
      admin/
        products/
          route.ts                  ← GET all, POST create
          [id]/
            route.ts                ← GET one, PATCH update, DELETE
        orders/
          route.ts                  ← GET all orders with items + credentials
          [id]/
            route.ts                ← GET single order detail
            status/
              route.ts              ← PATCH update order status
  components/
    admin/
      AdminSidebar.tsx              ← Left navigation
      AdminHeader.tsx               ← Top bar (user info + sign out)
      ProductForm.tsx               ← Add/edit product form
      ProductTable.tsx              ← Products data table
      OrdersTable.tsx               ← Orders data table
      OrderDetailView.tsx           ← Expanded order with credentials
      StatusBadge.tsx               ← Colored badge for order status
      StatsCard.tsx                 ← Dashboard stat card
      ImageUpload.tsx               ← Cloudinary upload widget
```

---

## Prisma Models (read-only)

```
User: id, email, name, role (ADMIN)
Product: id, title, description, price, stock, logoUrl, serviceType, featured, active
Order: id, orderNumber, customerEmail, totalAmount, status, paymentMethod, createdAt, items, credentials
OrderItem: id, orderId, quantity, priceAtPurchase, product
Credential: id, orderItemId, serviceType, username, status
```

Note: credentials store hashed passwords. In the admin view, **show only username and status** — never show or display the password hash.

---

## Admin Login Page

`src/app/admin/login/page.tsx`:

Minimal, dark login form. Not inside the admin layout (no sidebar).

```typescript
"use client";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid credentials");
      setIsLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">PremiumVault</h1>
          <p className="text-zinc-500 text-sm mt-1">Admin Panel</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign In</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="admin@example.com"
                className="bg-zinc-800 border-zinc-700 mt-1"
                {...register("email")}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
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
            <Button type="submit" disabled={isLoading} className="w-full mt-2">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

## Admin Layout

`src/app/admin/dashboard/layout.tsx`:

```typescript
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

### AdminSidebar

`src/components/admin/AdminSidebar.tsx`:

Fixed left sidebar with:
- PremiumVault logo/name at top
- Nav links (with active state highlighting):
  - Dashboard (`/admin/dashboard`)
  - Products (`/admin/dashboard/products`)
  - Orders (`/admin/dashboard/orders`)
- Each nav item: icon + label, using lucide-react icons (LayoutDashboard, Package, ShoppingBag)
- Bottom: version/environment indicator

Use `usePathname()` to detect active route.

### AdminHeader

`src/components/admin/AdminHeader.tsx`:

Top bar:
- Left: page title (derived from pathname or passed as prop)
- Right: user avatar (first letter of name/email) + email + "Sign Out" button

Sign out calls `signOut()` from `next-auth/react`.

---

## Dashboard Overview Page

`src/app/admin/dashboard/page.tsx`:

Server component. Fetches stats from DB.

```typescript
import { prisma } from "@/lib/db";
import { StatsCard } from "@/components/admin/StatsCard";
import { format } from "date-fns";

export default async function DashboardPage() {
  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue,
    recentOrders,
    totalProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { in: ["PAID", "CREDENTIALS_SUBMITTED", "COMPLETED"] } } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { items: { include: { product: true } } } }),
    prisma.product.count({ where: { active: true } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Orders" value={totalOrders} />
        <StatsCard label="Awaiting Credentials" value={pendingOrders} highlight />
        <StatsCard label="Completed" value={completedOrders} />
        <StatsCard label="Total Revenue" value={`£${Number(totalRevenue._sum.totalAmount ?? 0).toFixed(2)}`} />
      </div>

      {/* Recent orders mini-table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        {/* Map recentOrders to a simple table: order number, email, amount, status, date */}
      </div>
    </div>
  );
}
```

### StatsCard

`src/components/admin/StatsCard.tsx`:
```typescript
type Props = { label: string; value: string | number; highlight?: boolean };
```
Card with label above and large value below. If `highlight`, show accent border.

---

## Admin API Routes

### GET/POST Products

`src/app/api/admin/products/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  serviceType: z.string().min(1),
  logoUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orderItems: true } } },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json(product, { status: 201 });
}
```

### PATCH/DELETE Single Product

`src/app/api/admin/products/[id]/route.ts`:

PATCH updates product fields (same schema but all optional). DELETE sets `active: false` (soft delete — never hard delete due to foreign key constraints with order items).

```typescript
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ success: true });
}
```

### GET All Orders

`src/app/api/admin/orders/route.ts`:

```typescript
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { select: { title: true, serviceType: true, logoUrl: true } },
          credentials: {
            select: { id: true, serviceType: true, username: true, status: true, submittedAt: true },
          },
        },
      },
    },
  });

  return NextResponse.json(orders);
}
```

### PATCH Order Status

`src/app/api/admin/orders/[id]/status/route.ts`:

```typescript
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();
  const updated = await prisma.order.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}
```

---

## Products Management Page

`src/app/admin/dashboard/products/page.tsx`:

Client component. Fetches `GET /api/admin/products`.

Layout:
- Header row: "Products" title on left, "+ Add Product" button on right → navigates to `/admin/dashboard/products/new`
- `ProductTable` component

### ProductTable Component

`src/components/admin/ProductTable.tsx`:

Use shadcn `Table` component. Columns:
| Logo | Title | Service | Price | Stock | Status | Orders | Actions |
|------|-------|---------|-------|-------|--------|--------|---------|

- Logo: small service icon
- Service: `serviceType` as a badge
- Status: green "Active" / red "Inactive" badge
- Orders: count from `_count.orderItems`
- Actions: "Edit" button → `/admin/dashboard/products/[id]/edit`, "Deactivate" button (soft delete with confirmation)

Sortable columns (client-side sort): price, stock, title.

---

## Add/Edit Product Form

`src/app/admin/dashboard/products/new/page.tsx` and `src/app/admin/dashboard/products/[id]/edit/page.tsx`:

Both use `ProductForm` component. Edit page pre-fills form by fetching `GET /api/admin/products/[id]`.

### ProductForm Component

`src/components/admin/ProductForm.tsx`:

```typescript
type Props = {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading: boolean;
  mode: "create" | "edit";
};
```

Fields using React Hook Form + Zod:
- **Logo Upload** (`ImageUpload` component — see below)
- **Service Type** — `<Select>` dropdown with options: spotify, netflix, youtube, disney, applemusic, hulu, custom
- **Title** — `<Input>` text field
- **Description** — `<textarea>` (Tailwind styled, not shadcn — full width, min 4 rows)
- **Price (£)** — `<Input>` type="number" step="0.01"
- **Stock** — `<Input>` type="number" integer
- **Featured** — checkbox toggle
- **Active** — checkbox toggle (default true)
- Submit button: "Create Product" or "Save Changes"

Validation schema:
```typescript
const productFormSchema = z.object({
  title: z.string().min(2, "Min 2 characters"),
  description: z.string().min(10, "Min 10 characters"),
  price: z.number({ invalid_type_error: "Must be a number" }).positive("Must be positive"),
  stock: z.number().int().min(0),
  serviceType: z.string().min(1, "Required"),
  logoUrl: z.string().optional(),
  featured: z.boolean(),
  active: z.boolean(),
});
```

### ImageUpload Component

`src/components/admin/ImageUpload.tsx`:

Uses Cloudinary's Next.js upload widget (`next-cloudinary`). Displays current image (if editing). Upload button opens Cloudinary widget. On success, calls `onChange(url)` with the secure URL.

```typescript
import { CldUploadWidget } from "next-cloudinary";

type Props = {
  value?: string;
  onChange: (url: string) => void;
};

export function ImageUpload({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      {value && (
        <img src={value} alt="Product logo" className="w-20 h-20 rounded-xl object-contain bg-zinc-800 p-2" />
      )}
      <CldUploadWidget
        uploadPreset="premiumvault_products"
        onSuccess={(result) => {
          if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
            onChange(result.info.secure_url as string);
          }
        }}
      >
        {({ open }) => (
          <Button type="button" variant="outline" onClick={() => open()}>
            {value ? "Change Image" : "Upload Logo"}
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
}
```

Note: Set up a Cloudinary upload preset named `premiumvault_products` in the Cloudinary dashboard (unsigned preset, folder: `premiumvault/products`).

---

## Orders Management Page

`src/app/admin/dashboard/orders/page.tsx`:

Client component. Fetches `GET /api/admin/orders` (with optional `?status=` filter).

Layout:
- Title "Orders" + filter tabs at top: All | Pending | Paid | Credentials Submitted | Completed | Cancelled
- `OrdersTable` component

### OrdersTable Component

`src/components/admin/OrdersTable.tsx`:

Grouped by `orderNumber`. Each row represents one order. Expandable row to show order details.

**Table columns:**
| Order # | Customer Email | Items | Total | Payment | Status | Date | Actions |
|---------|----------------|-------|-------|---------|--------|------|---------|

- Order #: monospace font, truncated (`PV-ABC123-DEF456`)
- Items: e.g. "3 items" — click to expand
- Total: `£XX.XX`
- Payment: "Stripe" or "PayPal F&F" badge
- Status: `StatusBadge` component
- Date: `format(createdAt, "dd MMM yyyy HH:mm")` using date-fns
- Actions: "View Details" → opens expanded row or navigates to detail page

### StatusBadge Component

`src/components/admin/StatusBadge.tsx`:

```typescript
const STATUS_CONFIG = {
  PENDING: { label: "Pending", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  PAID: { label: "Paid", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  CREDENTIALS_SUBMITTED: { label: "Credentials In", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  COMPLETED: { label: "Completed", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  CANCELLED: { label: "Cancelled", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};
```

Renders a small pill badge with border.

---

## Order Detail View

`src/app/admin/dashboard/orders/[id]/page.tsx`:

Server component. Fetches full order with all items and credentials.

Layout:
```
Order PV-ABC123-DEF456                        Status: [Credentials Submitted]
Customer: customer@email.com     Total: £31.97     Date: 01 May 2026
Payment: Stripe

─────────────────────────────────────────────────────────────────────

Order Items & Credentials

▶ YouTube Premium — Personal (×1)
  └ Credential #1: username: customer@gmail.com  |  Status: SUBMITTED  |  Submitted: 01 May 15:30

▶ Spotify Premium — Personal (×2)
  └ Credential #1: username: spotifyuser@mail.com  |  Status: SUBMITTED
  └ Credential #2: username: another@mail.com       |  Status: SUBMITTED

─────────────────────────────────────────────────────────────────────

[Mark as Completed]  [Cancel Order]
```

### OrderDetailView Component

`src/components/admin/OrderDetailView.tsx`:

Receives full order data. For each `OrderItem`, shows:
- Product title + service icon + quantity
- For each `Credential` under that item:
  - `username` (the account email/username submitted by client)
  - `status` badge
  - `submittedAt` formatted date
  - **Never show password hash**

Status change buttons at bottom:
- "Mark as Completed" (if status is CREDENTIALS_SUBMITTED) → calls PATCH `/api/admin/orders/[id]/status` with `status: "COMPLETED"`
- "Cancel Order" (if not COMPLETED) → confirmation dialog first

---

## Axios Client Usage in Admin

Import `api` from `@/lib/api` for all client-side API calls. The Axios interceptor (set up in Team B's `src/lib/api.ts`) handles 401 redirects automatically. Admin pages that need server-side fetching use Prisma directly via server components.

---

## DO NOT Build

- Store pages (home, products, product detail) — Team B
- Cart state — Team B
- Checkout page — Team C
- Payment processing — Team C
- Email templates — Team D
- Credential submission page — Team D

Your job ends when: admin can log in, add/edit/delete products (with image upload), view all orders in a table grouped by order ID with credential details, and update order status to COMPLETED.
