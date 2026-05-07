import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  serviceType: z.string().min(1),
  logoUrl: z.string().optional().or(z.literal("")).transform((val) => val === "" ? undefined : val),
  requirements: z.string().optional().or(z.literal("")).transform((val) => val === "" ? null : val),
  warrantyTerms: z.string().optional().or(z.literal("")).transform((val) => val === "" ? null : val),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  productType: z.enum(["UPGRADE", "PURCHASE"]).default("UPGRADE"),
  accountCredentials: z
    .array(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { orderItems: true } },
          accountStock: { where: { isUsed: false }, select: { id: true } },
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.product.count(),
    ]);

    return NextResponse.json({ data: products, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { accountCredentials, ...productData } = parsed.data;

    const stockCount =
      productData.productType === "PURCHASE" && accountCredentials?.length
        ? accountCredentials.length
        : productData.stock;

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: { ...productData, stock: stockCount },
      });

      if (productData.productType === "PURCHASE" && accountCredentials?.length) {
        await tx.accountStock.createMany({
          data: accountCredentials.map((c) => ({
            productId: created.id,
            username: c.username,
            password: c.password,
          })),
        });
      }

      return created;
    });

    revalidateTag("products", {});
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
