# Team A — Foundation & Infrastructure

You are building the complete project skeleton for **PremiumVault**, a premium account-upgrade e-commerce platform. Your output is the foundation all other teams build on top of. You do NOT implement any UI pages beyond root layout and stubs. You DO define every shared contract: schema, auth, middleware, types, folder structure, and all dependencies.

---

## Your Deliverables (exhaustive list)

1. Next.js 15 App Router project (TypeScript strict)
2. `docker-compose.yml` — PostgreSQL only
3. `prisma/schema.prisma` — full schema
4. `prisma/seed.ts` — seeds admin users + sample products
5. `src/lib/auth.ts` — Auth.js v5 config
6. `src/lib/db.ts` — Prisma client singleton
7. `src/types/index.ts` — shared TypeScript types
8. `middleware.ts` — route protection
9. `src/app/layout.tsx` — root layout (Providers, Toaster)
10. `src/app/api/auth/[...nextauth]/route.ts`
11. `src/app/api/products/route.ts` — public GET (all active products)
12. `src/app/api/products/[id]/route.ts` — public GET (single product)
13. `.env.example` — all variables documented
14. `package.json` with ALL dependencies installed
15. shadcn/ui initialized with required components installed

---

## Step 1 — Bootstrap the Project

```bash
npx create-next-app@latest premiumvault \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --no-eslint \
  --import-alias "@/*"

cd premiumvault
```

---

## Step 2 — Install All Dependencies

```bash
# Database & Auth
yarn add @prisma/client @auth/prisma-adapter
yarn add -D prisma

# Auth.js v5
yarn add next-auth@beta

# Forms & Validation
yarn add react-hook-form @hookform/resolvers zod

# State
yarn add zustand

# HTTP
yarn add axios

# Payments
yarn add stripe @stripe/stripe-js

# Email
yarn add nodemailer
yarn add -D @types/nodemailer

# UI utilities
yarn add sonner
yarn add bcryptjs
yarn add -D @types/bcryptjs
yarn add uuid
yarn add -D @types/uuid
yarn add date-fns
yarn add next-cloudinary

# shadcn/ui peer deps (some already included in Next.js template)
yarn add class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot
yarn add @radix-ui/react-sheet @radix-ui/react-dialog @radix-ui/react-separator
yarn add @radix-ui/react-label @radix-ui/react-select @radix-ui/react-tabs
yarn add @radix-ui/react-dropdown-menu @radix-ui/react-avatar @radix-ui/react-badge
yarn add @radix-ui/react-toast
```

Then initialize shadcn:
```bash
npx shadcn@latest init
# Choose: Default style, Zinc base color, CSS variables yes
```

Install these shadcn components:
```bash
npx shadcn@latest add button card input label separator sheet dialog badge
npx shadcn@latest add table dropdown-menu avatar select tabs toast
npx shadcn@latest add form
```

---

## Step 3 — docker-compose.yml

Create at project root:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: premiumvault-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: premiumvault
      POSTGRES_PASSWORD: premiumvault
      POSTGRES_DB: premiumvault
    ports:
      - "5432:5432"
    volumes:
      - premiumvault_postgres_data:/var/lib/postgresql/data

volumes:
  premiumvault_postgres_data:
```

---

## Step 4 — Prisma Schema

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  CREDENTIALS_SUBMITTED
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  STRIPE
  PAYPAL
}

enum CredentialStatus {
  PENDING
  SUBMITTED
  UPGRADED
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  name      String?
  role      Role      @default(ADMIN)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  accounts  Account[]
  sessions  Session[]
}

model Product {
  id          String      @id @default(cuid())
  title       String
  description String      @db.Text
  price       Decimal     @db.Decimal(10, 2)
  stock       Int         @default(0)
  logoUrl     String?
  serviceType String
  featured    Boolean     @default(false)
  active      Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]
}

model Order {
  id              String         @id @default(cuid())
  orderNumber     String         @unique
  customerEmail   String
  totalAmount     Decimal        @db.Decimal(10, 2)
  status          OrderStatus    @default(PENDING)
  paymentMethod   PaymentMethod?
  paymentId       String?
  credentialToken String?        @unique
  tokenExpiresAt  DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  items           OrderItem[]
  credentials     Credential[]
}

model OrderItem {
  id              String       @id @default(cuid())
  orderId         String
  productId       String
  quantity        Int
  priceAtPurchase Decimal      @db.Decimal(10, 2)
  order           Order        @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product         Product      @relation(fields: [productId], references: [id])
  credentials     Credential[]
}

model Credential {
  id          String           @id @default(cuid())
  orderId     String
  orderItemId String
  serviceType String
  username    String
  password    String
  status      CredentialStatus @default(PENDING)
  submittedAt DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  order       Order            @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderItem   OrderItem        @relation(fields: [orderItemId], references: [id], onDelete: Cascade)
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## Step 5 — Prisma Seed

`prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("aleks00110011", 12);

  const adminUsers = [
    { email: "legendx27@gmail.com", name: "Legend" },
    { email: "aleks@gmail.com", name: "Aleks" },
    { email: "drini@mail.com", name: "Drini" },
  ];

  for (const admin of adminUsers) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        name: admin.name,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  }

  const products = [
    {
      title: "Spotify Premium — Personal",
      description:
        "Upgrade your Spotify account to Premium. Ad-free listening, offline downloads, high quality audio. Submit your Spotify email and password after purchase. Your account will be upgraded within 4–5 days.",
      price: 9.99,
      stock: 50,
      serviceType: "spotify",
      featured: true,
      logoUrl: null,
    },
    {
      title: "Netflix Standard — Personal",
      description:
        "Upgrade your Netflix account to Standard plan (1080p HD, 2 screens). Submit your Netflix email and password after purchase. Your account will be upgraded within 4–5 days.",
      price: 14.99,
      stock: 30,
      serviceType: "netflix",
      featured: true,
      logoUrl: null,
    },
    {
      title: "YouTube Premium — Personal",
      description:
        "Upgrade your YouTube account to Premium. Ad-free videos, background play, YouTube Music included. Submit your Google email and password after purchase. Upgraded within 4–5 days.",
      price: 11.99,
      stock: 40,
      serviceType: "youtube",
      featured: true,
      logoUrl: null,
    },
    {
      title: "Disney+ Standard — Personal",
      description:
        "Upgrade your Disney+ account to Standard (ad-free). Access to all Disney, Marvel, Star Wars and Pixar content. Submit credentials after purchase. Upgraded within 4–5 days.",
      price: 7.99,
      stock: 20,
      serviceType: "disney",
      featured: false,
      logoUrl: null,
    },
    {
      title: "Apple Music — Personal",
      description:
        "Upgrade your Apple Music account to Individual plan. 100 million songs ad-free, lossless audio, Dolby Atmos spatial audio. Submit credentials after purchase.",
      price: 10.99,
      stock: 25,
      serviceType: "applemusic",
      featured: false,
      logoUrl: null,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Also add `ts-node` as devDependency: `yarn add -D ts-node`

---

## Step 6 — Prisma Client Singleton

`src/lib/db.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## Step 7 — Auth.js v5 Configuration

`src/lib/auth.ts`:

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
```

`src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

---

## Step 8 — Middleware

`middleware.ts` at project root:

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAdminLogin = nextUrl.pathname === "/admin/login";
  const isAdminApiRoute = nextUrl.pathname.startsWith("/api/admin");

  if (isAdminLogin) {
    if (session) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (isAdminRoute || isAdminApiRoute) {
    if (!session || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

---

## Step 9 — Shared TypeScript Types

`src/types/index.ts`:

```typescript
import type { Product, Order, OrderItem, Credential, User } from "@prisma/client";

export type { Product, Order, OrderItem, Credential, User };

export type ProductWithItems = Product & { orderItems: OrderItem[] };

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product;
    credentials: Credential[];
  })[];
  credentials: Credential[];
};

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  logoUrl: string | null;
  serviceType: string;
  quantity: number;
};

export type CheckoutPayload = {
  email: string;
  paymentMethod: "STRIPE" | "PAYPAL";
  items: { productId: string; quantity: number }[];
};

export type CredentialSubmission = {
  orderItemId: string;
  serviceType: string;
  username: string;
  password: string;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
    };
  }
}
```

---

## Step 10 — Public Products API Routes

`src/app/api/products/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
```

`src/app/api/products/[id]/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id, active: true } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
```

---

## Step 11 — Root Layout

`src/app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PremiumVault — Account Upgrade Services",
  description: "Upgrade your streaming accounts to premium instantly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

---

## Step 12 — Environment Variables

`.env.example`:
```
# Database (Docker PostgreSQL)
DATABASE_URL=postgresql://premiumvault:premiumvault@localhost:5432/premiumvault

# Auth.js
NEXTAUTH_SECRET=your-secret-min-32-chars-here
NEXTAUTH_URL=http://localhost:3000

# Stripe (use test keys during development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPal (sandbox during development)
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@premiumvault.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudinary (product image uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

---

## Step 13 — Final Setup Commands

After all files are created, run:

```bash
# Start DB
docker compose up -d

# Init Prisma
npx prisma migrate dev --name init
npx prisma generate

# Seed
npx prisma db seed

# Start dev server
yarn dev
```

Add to `package.json` scripts:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "db:generate": "prisma generate",
  "db:seed": "prisma db seed",
  "db:studio": "prisma studio",
  "docker:up": "docker compose up -d",
  "docker:down": "docker compose down"
}
```

---

## DO NOT Build

- Any UI pages (home, products, checkout, admin dashboard)
- Cart state (Zustand store)
- Email templates
- Payment processing logic
- Credential submission page
- Admin dashboard components

Your job ends when the project runs, the DB connects, seed data is loaded, and auth works at `/admin/login`.
