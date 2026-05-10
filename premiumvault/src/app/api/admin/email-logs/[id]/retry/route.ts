import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { retryEmailLog } from "@/lib/email/send";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    await retryEmailLog(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Retry failed" }, { status: 500 });
  }
}
