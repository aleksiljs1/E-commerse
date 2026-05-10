import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9_]+$/, "Slug must be lowercase letters, numbers, underscores"),
  label: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color"),
});

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const types = await prisma.serviceType.findMany({ orderBy: { label: "asc" } });
  return NextResponse.json({ data: types });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const existing = await prisma.serviceType.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "A service type with this slug already exists" }, { status: 409 });

  const type = await prisma.serviceType.create({ data: parsed.data });
  return NextResponse.json({ data: type }, { status: 201 });
}
