import { NextResponse } from "next/server";

export function apiError(message: string, status: number, ctx?: string, err?: unknown) {
  if (err !== undefined) console.error(`[${ctx ?? "API"}]`, message, err);
  return NextResponse.json({ error: message }, { status });
}
