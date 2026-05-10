import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  if (id === (session.user as any).id)
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });

  const body = await req.json();
  const role = body.role;
  if (role !== "USER" && role !== "ADMIN")
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ data: user });
}
