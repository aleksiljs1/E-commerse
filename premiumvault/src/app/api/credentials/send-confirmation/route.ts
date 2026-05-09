import { NextRequest, NextResponse } from "next/server";
import { processOrderConfirmation } from "@/lib/email/process-order-confirmation";
import { apiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  const internalSecret = req.headers.get("x-internal-secret");
  if (!internalSecret || internalSecret !== process.env.NEXTAUTH_SECRET) {
    return apiError("Unauthorized", 401);
  }

  let body: { orderId?: unknown };
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const orderId = typeof body.orderId === "string" ? body.orderId : null;
  if (!orderId) return apiError("orderId is required", 400);

  try {
    await processOrderConfirmation(orderId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError("Failed to process confirmation", 500, "send-confirmation", err);
  }
}
