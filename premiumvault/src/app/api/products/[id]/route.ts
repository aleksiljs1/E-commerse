import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-error";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id, active: true } });
    if (!product) return apiError("Not found", 404);
    return NextResponse.json(product);
  } catch (err) {
    return apiError("Failed to fetch product", 500, "products/[id] GET", err);
  }
}
