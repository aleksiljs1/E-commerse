import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || "50")));
  const status = req.nextUrl.searchParams.get("status") ?? undefined;

  const where = status ? { status } : undefined;

  const [logs, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: { order: { select: { orderNumber: true } } },
    }),
    prisma.emailLog.count({ where }),
  ]);

  return NextResponse.json({ data: logs, total, page, totalPages: Math.ceil(total / limit) });
}
