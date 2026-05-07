import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const stock = await prisma.accountStock.findMany({
    where: { productId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, username: true, isUsed: true, usedAt: true, createdAt: true },
  });
  return NextResponse.json(stock);
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: productId } = await params;

  const body = await req.json().catch(() => null);
  const parsed = z
    .object({ username: z.string().min(1), password: z.string().min(1) })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const entry = await prisma.$transaction(async (tx) => {
    const created = await tx.accountStock.create({
      data: { productId, username: parsed.data.username, password: parsed.data.password },
    });
    await tx.product.update({
      where: { id: productId },
      data: { stock: { increment: 1 } },
    });
    return created;
  });

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: productId } = await params;
  const { searchParams } = new URL(req.url);
  const stockId = searchParams.get("stockId");
  if (!stockId) return NextResponse.json({ error: "stockId required" }, { status: 400 });

  const entry = await prisma.accountStock.findUnique({ where: { id: stockId } });
  if (!entry || entry.productId !== productId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.isUsed)
    return NextResponse.json({ error: "Cannot delete a credential that has already been delivered" }, { status: 409 });

  await prisma.$transaction(async (tx) => {
    await tx.accountStock.delete({ where: { id: stockId } });
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: 1 } },
    });
  });

  return NextResponse.json({ success: true });
}
