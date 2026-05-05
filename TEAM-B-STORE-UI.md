# Team B — Store UI & Cart

You are building all public-facing store pages and the cart system for **PremiumVault**, a premium account-upgrade e-commerce platform. Team A has already created the project skeleton, Prisma schema, auth, and Docker setup. You do NOT touch any admin pages, checkout flow, email, or API routes beyond reading from existing endpoints.

---

## Context — What You're Building

The store front. Clients land on a homepage with a hero phrase and featured product cards (Spotify, Netflix, YouTube, etc. with logo icons). They can browse all products, view a product detail page, add items to a cart, and open a cart sheet (slide-over from the right). The cart sheet shows items, quantity controls, subtotal, and a "Checkout" button. Checkout page is Team C's responsibility — your cart just navigates there.

---

## Your File Ownership

```
src/
  store/
    cart.ts                          ← Zustand cart store
  components/
    store/
      Navbar.tsx                     ← Top navigation
      CartSheet.tsx                  ← Slide-over cart
      CartItem.tsx                   ← Single item in cart sheet
      ProductCard.tsx                ← Featured/listing card
      FeaturedProducts.tsx           ← Featured grid on home
      ProductGrid.tsx                ← Full product listing
      HeroSection.tsx                ← Home hero
      QuantityControl.tsx            ← +/- buttons (reusable)
      ServiceIcon.tsx                ← Renders logo by serviceType
  app/
    (store)/
      layout.tsx                     ← Store layout (Navbar + CartSheet)
      page.tsx                       ← Home page
      products/
        page.tsx                     ← All products listing
        [id]/
          page.tsx                   ← Product detail page
  lib/
    api.ts                           ← Axios instance (with interceptors)
```

---

## Axios Client Setup

`src/lib/api.ts`:

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Cart Store (Zustand)

`src/store/cart.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  subtotal: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
        set({ isOpen: true });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "premiumvault-cart" }
  )
);
```

---

## Service Icon Component

`src/components/store/ServiceIcon.tsx`:

Map serviceType strings to their brand colors and an icon/emoji placeholder (admin will upload real logos via Cloudinary). For now use colored initials in a rounded box styled to the brand.

```typescript
"use client";

const SERVICE_CONFIG: Record<string, { label: string; bg: string; text: string; initial: string }> = {
  spotify: { label: "Spotify", bg: "bg-green-500", text: "text-white", initial: "S" },
  netflix: { label: "Netflix", bg: "bg-red-600", text: "text-white", initial: "N" },
  youtube: { label: "YouTube", bg: "bg-red-500", text: "text-white", initial: "YT" },
  disney: { label: "Disney+", bg: "bg-blue-700", text: "text-white", initial: "D+" },
  applemusic: { label: "Apple Music", bg: "bg-pink-600", text: "text-white", initial: "AM" },
  hulu: { label: "Hulu", bg: "bg-green-400", text: "text-black", initial: "H" },
  default: { label: "Service", bg: "bg-zinc-700", text: "text-white", initial: "?" },
};

type Props = {
  serviceType: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

export function ServiceIcon({ serviceType, logoUrl, size = "md" }: Props) {
  const config = SERVICE_CONFIG[serviceType] ?? SERVICE_CONFIG.default;
  const sizeClasses = { sm: "w-8 h-8 text-xs", md: "w-12 h-12 text-sm", lg: "w-20 h-20 text-xl" };

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={config.label}
        className={`${sizeClasses[size]} object-contain rounded-xl`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${config.bg} ${config.text} rounded-xl flex items-center justify-center font-bold`}
    >
      {config.initial}
    </div>
  );
}
```

---

## Navbar Component

`src/components/store/Navbar.tsx`:

Design requirements:
- Fixed at top, full width, subtle background blur (`backdrop-blur-sm bg-white/80 dark:bg-zinc-950/80`)
- Left: logo mark + "PremiumVault" text
- Center: nav links — Home, Products, Reviews, Contact, FAQ (all anchor/link elements, styled minimally)
- Right: shopping basket icon (`ShoppingCart` from lucide-react) with a badge showing `totalItems()`. Clicking the icon opens the cart sheet via `useCartStore().openCart()`
- All links are `<Link>` from next/link
- Responsive: on mobile hide center links, show a hamburger or just the logo + cart icon

```typescript
"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { totalItems, openCart } = useCartStore();
  const count = totalItems();
  // ...render
}
```

---

## Cart Sheet Component

`src/components/store/CartSheet.tsx`:

Uses shadcn `Sheet` component. Triggered by `isOpen` from Zustand store.

Layout of the sheet (slides in from the right, medium width ~400px):
- Header: "Your Basket" title + close button (X icon)
- Body: scrollable list of `CartItem` components. If empty: centered message "Your basket is empty"
- Footer (sticky at bottom):
  - "Subtotal" label + `£{subtotal().toFixed(2)}`
  - Full-width "Checkout" Button (primary) → navigates to `/checkout`

```typescript
"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart";
import { CartItemRow } from "./CartItem";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export function CartSheet() {
  const { isOpen, closeCart, items, subtotal } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };
  // render Sheet with items mapped to CartItemRow
}
```

---

## Cart Item Row Component

`src/components/store/CartItem.tsx`:

Each item in the cart sheet:
- Left: `ServiceIcon` (sm size)
- Middle: product title (truncated), price per unit `£X.XX`
- Right: quantity controls (`-` | `N` | `+`) using `QuantityControl` + trash icon to remove
- Line total: `£{(price * quantity).toFixed(2)}` shown below title in muted text

---

## Quantity Control Component

`src/components/store/QuantityControl.tsx`:
Reusable `+` / `-` buttons with the current quantity displayed in the middle. Accepts `value`, `onIncrement`, `onDecrement`, `min=1`, `max=99`. Styled: small square buttons, quantity in a fixed-width span.

---

## Product Card Component

`src/components/store/ProductCard.tsx`:

Used in both featured section and full listing:
- Card with subtle border, hover shadow, rounded corners (dark-friendly)
- Top: service logo/icon (centered, large)
- Body: product title, short description (2 lines truncated), price in bold
- Footer: "Add to Cart" button (calls `addItem`) + stock indicator if low (< 5 shows "Only X left")
- Clicking the card (not button) navigates to `/products/[id]`
- Show a subtle "Featured" badge if `product.featured`

```typescript
"use client";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
// ...
```

---

## Hero Section

`src/components/store/HeroSection.tsx`:

Full-width hero on the home page:
- Background: dark gradient (zinc-950 to zinc-900) or a subtle mesh gradient
- Centered text:
  - Small overline: "Premium Account Upgrades" (muted, uppercase, letter-spaced)
  - Large headline (4xl–6xl bold): **"Elevate Every Subscription."**
  - Subheading (xl, muted): "Upgrade to premium on Spotify, Netflix, YouTube and more — instantly, securely, and at the best price."
  - Two buttons: primary "Browse Products" → `/products`, secondary "How It Works" → `#how-it-works`
- Below buttons: trust indicators row: "🔒 Secure Checkout" | "✅ 4–5 Day Upgrade" | "💬 24/7 Support"

---

## Featured Products Section

`src/components/store/FeaturedProducts.tsx`:

Server component that fetches `GET /api/products` (filtered to `featured: true` on client or use all and filter).
- Section title: "Featured Services"
- Grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- Maps `featured` products to `ProductCard`
- Below grid: "Browse all services →" link to `/products`

---

## Home Page

`src/app/(store)/page.tsx`:

Server component. Fetches products from `/api/products`. Renders:
1. `HeroSection`
2. `FeaturedProducts` (passing products as prop)
3. A "How It Works" section (id="how-it-works") with 3 steps:
   - Step 1: "Choose your service" — browse products, add to cart
   - Step 2: "Secure checkout" — pay via Stripe or PayPal
   - Step 3: "Submit credentials" — we upgrade your account in 4–5 days
   Use numbered icons in a horizontal row with connecting line on desktop.
4. A brief "Why PremiumVault?" section: 3 benefit cards (Secure, Fast, Reliable)

---

## Products Listing Page

`src/app/(store)/products/page.tsx`:

Server component. Fetches all active products. Renders:
- Page title: "All Services"
- Optional: filter bar (by serviceType) — simple tab buttons
- `ProductGrid` component (all products in responsive grid)
- No pagination needed initially (seed has ~5 products)

---

## Product Detail Page

`src/app/(store)/products/[id]/page.tsx`:

Server component. Fetches single product by ID.

Layout (two-column on desktop):

**Left column:**
- Service logo (large, centered or top-left) using `ServiceIcon` (lg size)
- Product title (2xl–3xl, bold): e.g. "YouTube Premium — Personal Account Upgrade"
- Warranty/Terms explanation (below title in muted text):
  - "Upgrade guaranteed within 4–5 business days"
  - "Secure credential encryption"
  - "If upgrade fails, full refund guaranteed"
- Full description (`product.description`) in readable body text
- "What we require from you" section: bullet points explaining they need to submit account credentials via the link sent to their email after payment

**Right column (sticky on desktop):**
- Service logo repeated (medium)
- Price: large bold `£{price}`
- Stock indicator: "X in stock" (green if > 10, orange if < 10, red if < 3)
- `QuantityControl` component (default 1, max = stock)
- "Add to Cart" button (full width, primary)
- "Buy Now" button (full width, secondary outline) → adds to cart then navigates to `/checkout`
- Small lock icon + "Secure checkout with 256-bit SSL" text below buttons

---

## Store Layout

`src/app/(store)/layout.tsx`:

```typescript
import { Navbar } from "@/components/store/Navbar";
import { CartSheet } from "@/components/store/CartSheet";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartSheet />
      <main className="pt-16">{children}</main>
    </>
  );
}
```

---

## Design Tokens / Styling Notes

- Color palette: predominantly dark (zinc-950 background, zinc-900 cards) with white text. Accent: indigo-500 or violet-600 for CTAs.
- All cards: `rounded-2xl border border-zinc-800 bg-zinc-900`
- Buttons: shadcn `Button` component, primary = default variant (dark bg), secondary = outline
- Typography: system font stack, clean and minimal
- Spacing: generous padding, don't feel cramped
- No flashy animations — subtle hover scale on cards (`hover:scale-[1.02] transition-transform`)

---

## Fetching Data (Pattern for Server Components)

```typescript
async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}
```

Or use Prisma directly in server components (preferred for Next.js App Router):
```typescript
import { prisma } from "@/lib/db";
const products = await prisma.product.findMany({ where: { active: true } });
```

---

## DO NOT Build

- Checkout page (`/checkout`) — Team C
- Any API routes that create/modify data
- Admin pages
- Email functionality
- Credential submission page
- Payment processing
- Stripe or PayPal integration

Your job ends when the home page, product listing, product detail, and cart sheet are fully functional with real data from the DB (or API) and the cart persists in localStorage.
