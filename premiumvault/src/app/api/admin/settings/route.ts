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

    // Support batch upsert: { settings: [{ key, value }, ...] }
    const batchParsed = batchSchema.safeParse(body);
    if (batchParsed.success) {
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
