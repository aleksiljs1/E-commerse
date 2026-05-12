import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Only allow public access to non-sensitive settings
const PUBLIC_KEYS = new Set([
  "site_name", "site_tagline", "announcement", "paypal_email",
  "hero_heading", "hero_subheading", "stats_enabled",
  "stats_customers", "stats_upgrades", "stats_satisfaction",
  "banner_text",
]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key)
    return NextResponse.json({ error: "Missing key" }, { status: 400 });

  if (!PUBLIC_KEYS.has(key))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return NextResponse.json({ value: setting?.value ?? null }, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
