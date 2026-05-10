import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getTierConfig, getDiscountTier } from "@/lib/discount-tiers";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ discount: 0, tier: "None", orderCount: 0 });
  }

  const orderCount = await prisma.order.count({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
    },
  });

  const tierConfig = await getTierConfig();
  const { tier, discount } = getDiscountTier(orderCount, tierConfig);

  return NextResponse.json({ discount, tier, orderCount });
}
