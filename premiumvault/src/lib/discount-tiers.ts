import { prisma } from "@/lib/db";

export type TierConfig = {
  bronzeOrders: number;
  bronzeDiscount: number;
  silverOrders: number;
  silverDiscount: number;
  goldOrders: number;
  goldDiscount: number;
};

const DEFAULTS: TierConfig = {
  bronzeOrders: 2,
  bronzeDiscount: 5,
  silverOrders: 5,
  silverDiscount: 10,
  goldOrders: 10,
  goldDiscount: 15,
};

const KEY_MAP: Record<string, keyof TierConfig> = {
  tier_bronze_orders: "bronzeOrders",
  tier_bronze_discount: "bronzeDiscount",
  tier_silver_orders: "silverOrders",
  tier_silver_discount: "silverDiscount",
  tier_gold_orders: "goldOrders",
  tier_gold_discount: "goldDiscount",
};

let _tierCache: { config: TierConfig; expiresAt: number } | null = null;
const TIER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function clearTierCache(): void {
  _tierCache = null;
}

export async function getTierConfig(): Promise<TierConfig> {
  if (_tierCache && Date.now() < _tierCache.expiresAt) {
    return _tierCache.config;
  }

  const keys = Object.keys(KEY_MAP);
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));

  const config = { ...DEFAULTS };
  for (const [dbKey, field] of Object.entries(KEY_MAP)) {
    const val = map.get(dbKey);
    if (val !== undefined && val !== "") {
      config[field] = Number(val);
    }
  }

  _tierCache = { config, expiresAt: Date.now() + TIER_CACHE_TTL_MS };
  return config;
}

export type TierResult = {
  tier: string;
  discount: number;
  next: string | null;
  remaining: number;
};

export function getDiscountTier(orderCount: number, config: TierConfig): TierResult {
  if (orderCount >= config.goldOrders) return { tier: "Gold", discount: config.goldDiscount, next: null, remaining: 0 };
  if (orderCount >= config.silverOrders) return { tier: "Silver", discount: config.silverDiscount, next: "Gold", remaining: config.goldOrders - orderCount };
  if (orderCount >= config.bronzeOrders) return { tier: "Bronze", discount: config.bronzeDiscount, next: "Silver", remaining: config.silverOrders - orderCount };
  return { tier: "None", discount: 0, next: "Bronze", remaining: config.bronzeOrders - orderCount };
}

export function getDiscountPercent(orderCount: number, config: TierConfig): number {
  if (orderCount >= config.goldOrders) return config.goldDiscount;
  if (orderCount >= config.silverOrders) return config.silverDiscount;
  if (orderCount >= config.bronzeOrders) return config.bronzeDiscount;
  return 0;
}
