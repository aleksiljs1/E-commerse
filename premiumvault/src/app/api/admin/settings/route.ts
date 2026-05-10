import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const updateSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

const batchSchema = z.object({
  settings: z.array(z.object({ key: z.string().min(1), value: z.string() })).min(1),
});

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settings = await prisma.siteSetting.findMany();
  return NextResponse.json({ data: settings });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();

    const NUMERIC_SETTINGS = [
      "tier_bronze_orders", "tier_bronze_discount",
      "tier_silver_orders", "tier_silver_discount",
      "tier_gold_orders", "tier_gold_discount",
      "smtp_port",
    ];

    // Support batch upsert: { settings: [{ key, value }, ...] }
    const batchParsed = batchSchema.safeParse(body);
    if (batchParsed.success) {
      for (const s of batchParsed.data.settings) {
        if (NUMERIC_SETTINGS.includes(s.key)) {
          const n = Number(s.value);
          if (isNaN(n) || n < 0) {
            return NextResponse.json({ error: `Setting "${s.key}" must be a valid number` }, { status: 400 });
          }
        }
      }
      // validate tier thresholds if all 6 tier settings are present
      const tierSettings = Object.fromEntries(
        batchParsed.data.settings
          .filter(s => s.key.startsWith("tier_"))
          .map(s => [s.key, Number(s.value)])
      );
      if (Object.keys(tierSettings).length === 6) {
        const { tier_bronze_orders, tier_silver_orders, tier_gold_orders } = tierSettings;
        if (tier_bronze_orders >= tier_silver_orders || tier_silver_orders >= tier_gold_orders) {
          return NextResponse.json({
            error: "Tier order thresholds must be in order: Bronze < Silver < Gold"
          }, { status: 400 });
        }
      }
      await prisma.$transaction(
        batchParsed.data.settings.map((s) =>
          prisma.siteSetting.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: { key: s.key, value: s.value },
          })
        )
      );
      revalidateTag("site-settings", {});
      return NextResponse.json({ success: true });
    }

    // Single upsert fallback: { key, value }
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const setting = await prisma.siteSetting.upsert({
      where: { key: parsed.data.key },
      update: { value: parsed.data.value },
      create: { key: parsed.data.key, value: parsed.data.value },
    });

    revalidateTag("site-settings", {});
    return NextResponse.json(setting);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
