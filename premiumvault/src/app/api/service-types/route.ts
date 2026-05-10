import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SERVICE_TYPE_PRESETS } from "@/lib/service-type-presets";

export async function GET() {
  let types = await prisma.serviceType.findMany({ orderBy: { label: "asc" } });

  // Auto-seed presets on first call
  if (types.length === 0) {
    await prisma.serviceType.createMany({ data: SERVICE_TYPE_PRESETS, skipDuplicates: true });
    types = await prisma.serviceType.findMany({ orderBy: { label: "asc" } });
  }

  return NextResponse.json({ data: types });
}
