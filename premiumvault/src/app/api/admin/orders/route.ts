import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

const VALID_STATUSES = ["PENDING", "PAID", "CREDENTIALS_SUBMITTED", "COMPLETED", "CANCELLED"] as const;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return apiError("Forbidden", 403);

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const status = VALID_STATUSES.includes(statusParam as any) ? statusParam as (typeof VALID_STATUSES)[number] : null;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const search = searchParams.get("search") ?? "";

    const where: any = {};
    if (status) where.status = status;
    if (search) where.OR = [
      { customerEmail: { contains: search, mode: "insensitive" } },
      { orderNumber: { contains: search, mode: "insensitive" } },
    ];

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: { select: { title: true, serviceType: true, logoUrl: true } },
              credentials: { select: { id: true, serviceType: true, username: true, status: true, submittedAt: true } },
            },
          },
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ data: orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return apiError("Internal server error", 500, "admin/orders GET", err);
  }
}
