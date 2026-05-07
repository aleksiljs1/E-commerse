import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ discount: 0, tier: "None", orderCount: 0 });
  }

  const orderCount = await prisma.order.count({
    where: {
      userId: session.user.id,
      status: { notIn: ["CANCELLED", "PENDING"] },
    },
  });

  let tier = "None";
  let discount = 0;

  if (orderCount >= 10) { tier = "Gold"; discount = 15; }
  else if (orderCount >= 5) { tier = "Silver"; discount = 10; }
  else if (orderCount >= 2) { tier = "Bronze"; discount = 5; }

  return NextResponse.json({ discount, tier, orderCount });
}
