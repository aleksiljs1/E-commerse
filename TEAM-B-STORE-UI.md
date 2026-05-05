# Team B — Store UI & Cart

You are building all public-facing store pages and the cart system for **PremiumVault**, a premium account-upgrade e-commerce platform. Team A has already created the project skeleton, Prisma schema, auth, and Docker setup. You do NOT touch any admin pages, checkout flow, email, or API routes beyond reading from existing endpoints.

---

## Context — What You're Building

The store front. Clients land on a homepage with a hero phrase and featured product cards (Spotify, Netflix, YouTube, etc. with logo icons). They can browse all products, view a product detail page, add items to a cart, and open a cart popup (a rectangular pop-up that appears on screen anchored to the basket icon — NOT a side drawer). The cart popup shows items, quantity controls, subtotal, and a "Checkout" button. Checkout page is Team C's responsibility — your cart just navigates there.

---

## Your File Ownership

```
src/
  store/
    cart.ts                          ← Zustand cart store
  components/
    store/
      Navbar.tsx                     ← Top navigation
      CartPopup.tsx                  ← Rectangular popup cart (NOT a side drawer)
      CartItem.tsx                   ← Single item in cart popup
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
- Fixed at top, full width, subtle background blur (`backdrop-blur-sm bg-zinc-950/80 border-b border-zinc-800`)
- **Left:** logo mark + "PremiumVault" text
- **Center:** nav links — Home, Products, Reviews, Contact Us, FAQ (plain `<Link>` elements, minimal styling)
- **Far Right (in this order, left to right):** "Browse Products" button (outline style, small) → `/products`, then the basket icon (`ShoppingCart` from lucide-react) with a count badge
- Clicking the basket icon calls `useCartStore().openCart()` which toggles the cart popup
- All links are `<Link>` from next/link
- Responsive: on mobile collapse center links; keep logo + browse button + cart icon visible

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-zinc-950/80 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="text-xl font-bold text-white">PremiumVault</Link>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/products" className="hover:text-white transition-colors">Products</Link>
          <Link href="#reviews" className="hover:text-white transition-colors">Reviews</Link>
          <Link href="#contact" className="hover:text-white transition-colors">Contact Us</Link>
          <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
        </div>

        {/* Far Right: Browse Products + Cart */}
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white hidden sm:flex">
              Browse Products
            </Button>
          </Link>
          <button
            onClick={openCart}
            className="relative p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Open basket"
          >
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
```

---

## Cart Popup Component

`src/components/store/CartPopup.tsx`:

**This is a rectangular pop-up that appears on screen — NOT a slide-in drawer/sheet.** It is a fixed-position box that appears in the upper-right area of the screen when `isOpen` is true, visually anchored near the basket icon. Use a backdrop overlay behind it (semi-transparent) that closes the popup when clicked.

Layout (fixed position, top-right, width ~380px, max-height ~70vh, scrollable body):
- **Header:** "Your Basket" title (left) + X close button (right)
- **Body (scrollable):** list of `CartItemRow` components. If empty: centered text "Your basket is empty 🛒"
- **Footer (sticky at bottom of popup):**
  - Separator line
  - "Subtotal" label on left, `£{subtotal().toFixed(2)}` bold on right
  - Full-width "Checkout" button (primary, indigo) → navigates to `/checkout`

```typescript
"use client";
import { useCartStore } from "@/store/cart";
import { CartItemRow } from "./CartItem";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function CartPopup() {
  const { isOpen, closeCart, items, subtotal } = useCartStore();
  const router = useRouter();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeCart]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={closeCart}
      />

      {/* Popup box */}
      <div className="fixed top-16 right-4 z-50 w-[380px] max-h-[70vh] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white">Your Basket</h2>
          <button onClick={closeCart} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
              <span className="text-3xl mb-2">🛒</span>
              <p className="text-sm">Your basket is empty</p>
            </div>
          ) : (
            items.map((item) => <CartItemRow key={item.productId} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-800 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Subtotal</span>
              <span className="text-white font-bold text-base">£{subtotal().toFixed(2)}</span>
            </div>
            <Button onClick={handleCheckout} className="w-full bg-indigo-600 hover:bg-indigo-500" size="lg">
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
```

---

## Cart Item Row Component

`src/components/store/CartItem.tsx`:

Each item in the cart popup:
- **Left:** `ServiceIcon` (sm size)
- **Middle:** product title (1 line truncated), short description (1 line, muted, smaller text), price per unit `£X.XX`
- **Right:** quantity controls (`-` | `N` | `+`) using `QuantityControl` + trash icon to remove
- Line total: `£{(price * quantity).toFixed(2)}` shown below the description in muted text

The `CartItem` type must include a `description` field (short, passed when calling `addItem` from the product page). Add `description: string` to the `CartItem` type in `src/types/index.ts`.

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

**Left column (top to bottom in this exact order):**
1. Product title (2xl–3xl, bold): e.g. "YouTube Premium — Personal Account Upgrade Lifetime"
2. Full service logo below the title — use `ServiceIcon` (lg size, or if `logoUrl` exists render it large, ~160px)
3. Full description (`product.description`) in readable body text
4. "What We Require From You" section — bulleted list explaining the client needs to submit their account email and password via the secure link sent after payment
5. "Warranty & Terms" section — each product has its own terms, display:
   - "Upgrade guaranteed within 4–5 business days"
   - "If upgrade fails for any reason, full refund guaranteed"
   - "Your credentials are encrypted and never stored in plain text"
   - "Do not change your password during the upgrade window"

**Right column (sticky on desktop — NO logo here, only purchase controls):**
- Price: large bold `£{price}` (2xl or larger)
- Stock indicator: `{stock} in stock` — green text if > 10, amber if < 10, red if < 3
- `QuantityControl` component (default 1, max = stock value)
- "Add to Cart" button (full width, primary indigo)
- "Buy Now" button (full width, secondary outline) → calls `addItem` then `router.push("/checkout")`
- Below buttons: small lock icon + muted text "Secure checkout with 256-bit SSL encryption"

---

## Store Layout

`src/app/(store)/layout.tsx`:

```typescript
import { Navbar } from "@/components/store/Navbar";
import { CartPopup } from "@/components/store/CartPopup";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartPopup />
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

Your job ends when the home page, product listing, product detail, and cart popup are fully functional with real data from the DB (or API) and the cart persists in localStorage.
