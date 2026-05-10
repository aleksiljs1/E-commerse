import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key)
    return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return NextResponse.json({ value: setting?.value ?? null }, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
