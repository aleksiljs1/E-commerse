# PremiumVault — Master Coordination Plan

## What Is Being Built

A professional account-upgrade e-commerce platform. Clients visit the site, browse services (Spotify Premium, Netflix, YouTube Premium, Disney+, etc.), add items to a cart, check out via Stripe or PayPal Friends & Family, then receive an email with a secure link to submit their account credentials. An admin dashboard lets the business manage products and view all orders with submitted credentials.

## Teams & Scope Boundaries

| Team | Owns | Do NOT touch |
|------|------|--------------|
| **A — Foundation** | Project scaffold, Docker, Prisma schema, NextAuth v5, middleware, seed, env | Nothing else in src/app or src/components |
| **B — Store UI** | Home page, product listing, product detail, Navbar, Cart (Zustand + Sheet) | Checkout page, admin, API routes (except reading via fetch), email |
| **C — Checkout & Payments** | Checkout page, Stripe integration, PayPal integration, `src/app/api/orders/*`, `src/app/api/webhooks/*` | Home/product pages, admin, email sending internals |
| **D — Email & Credentials** | Nodemailer SMTP setup, all email templates, `/submit-credentials` page, `src/app/api/credentials/*` | Admin dashboard, payment processing, store UI |
| **E — Admin Dashboard** | `/admin/login`, `/admin/dashboard` and all sub-pages, `src/app/api/admin/*`, `src/components/admin/*` | Store-facing pages, payment processing, email internals |

## File Ownership Map (no overlaps)

```
premiumvault/
├── docker-compose.yml                  → Team A
├── middleware.ts                       → Team A
├── prisma/schema.prisma                → Team A (READ ONLY for all others)
├── prisma/seed.ts                      → Team A
├── .env.example                        → Team A
├── src/
│   ├── lib/
│   │   ├── auth.ts                     → Team A
│   │   ├── db.ts                       → Team A
│   │   ├── email/                      → Team D
│   │   ├── stripe.ts                   → Team C
│   │   └── paypal.ts                   → Team C
│   ├── store/
│   │   └── cart.ts                     → Team B
│   ├── types/
│   │   └── index.ts                    → Team A
│   ├── components/
│   │   ├── ui/                         → shadcn auto-generated (Team A installs)
│   │   ├── store/                      → Team B
│   │   └── admin/                      → Team E
│   └── app/
│       ├── layout.tsx                  → Team A (root layout only)
│       ├── (store)/
│       │   ├── layout.tsx              → Team B
│       │   ├── page.tsx                → Team B  (home)
│       │   ├── products/
│       │   │   ├── page.tsx            → Team B  (listing)
│       │   │   └── [id]/page.tsx       → Team B  (detail)
│       │   └── checkout/
│       │       └── page.tsx            → Team C
│       ├── submit-credentials/
│       │   └── page.tsx                → Team D
│       ├── admin/
│       │   ├── login/page.tsx          → Team E
│       │   └── dashboard/
│       │       ├── page.tsx            → Team E
│       │       ├── products/page.tsx   → Team E
│       │       └── orders/page.tsx     → Team E
│       └── api/
│           ├── auth/[...nextauth]/route.ts → Team A
│           ├── products/route.ts           → Team A (basic CRUD stub)
│           ├── orders/route.ts             → Team C
│           ├── orders/[id]/route.ts        → Team C
│           ├── webhooks/stripe/route.ts    → Team C
│           ├── webhooks/paypal/route.ts    → Team C
│           ├── credentials/route.ts        → Team D
│           ├── credentials/[token]/route.ts→ Team D
│           └── admin/
│               ├── products/route.ts       → Team E
│               ├── products/[id]/route.ts  → Team E
│               └── orders/route.ts         → Team E
```

## Execution Order

1. **Team A runs first** — creates the entire project skeleton, installs all deps, defines the Prisma schema, seeds the DB.
2. **Teams B, C, D, E run in parallel** — each works from the skeleton Team A created, on different files.
3. Final integration: merge all branches, run `prisma generate && prisma migrate dev`, then `yarn dev`.

## Shared Contracts (read by all teams)

### Prisma Models Summary
- `User` — admin accounts (role: ADMIN | USER)
- `Product` — id, title, description, price, stock, logoUrl, serviceType, featured, active
- `Order` — id, orderNumber, customerEmail, totalAmount, status, paymentMethod, paymentId, credentialToken, tokenExpiresAt
- `OrderItem` — orderId, productId, quantity, priceAtPurchase
- `Credential` — orderId, orderItemId, serviceType, username, password (bcrypt), status

### Order Status Flow
`PENDING` → `PAID` → `CREDENTIALS_SUBMITTED` → `COMPLETED` (or `CANCELLED` at any point)

### Environment Variables (all teams reference)
```
DATABASE_URL=postgresql://premiumvault:premiumvault@localhost:5432/premiumvault
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@premiumvault.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Tech Stack (non-negotiable)
- Next.js 15 App Router, TypeScript strict
- Tailwind CSS 4 + shadcn/ui
- Zustand + persist (cart only)
- React Hook Form + Zod (all forms)
- Auth.js v5 (NextAuth) + Prisma Adapter
- Prisma + PostgreSQL (Docker)
- Stripe SDK + PayPal JS SDK
- Nodemailer (SMTP)
- bcryptjs (password hashing)
- Axios (client-side with interceptors)
- React Hot Toast / Sonner (notifications)
- date-fns (date formatting in admin)
- Cloudinary (product image upload)
- uuid (order token generation)
