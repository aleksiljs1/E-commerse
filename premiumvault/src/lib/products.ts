import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/db";
import type { SerializedProduct } from "@/types";

export async function getActiveProducts(): Promise<SerializedProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const raw = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return raw.map((p) => ({ ...p, price: Number(p.price) }));
}
