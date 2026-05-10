import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/store/SignOutButton";
import { getTierConfig, getDiscountTier } from "@/lib/discount-tiers";
import { ViewCredentialsButton } from "@/components/store/ViewCredentialsButton";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, status: { not: "PENDING" } },
    include: {
      items: {
        include: {
          product: true,
          credentials: {
            select: { username: true, password: true, status: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const completedOrders = orders.filter((o) => o.status === "COMPLETED" || o.status === "PAID" || o.status === "CREDENTIALS_SUBMITTED");
  const totalSpent = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const tierConfig = await getTierConfig();
  const { tier, discount, next, remaining } = getDiscountTier(completedOrders.length, tierConfig);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white">{session.user.name || "My Account"}</h1>
          <p className="text-gray-400 text-sm">{session.user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-white">£{totalSpent.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Orders</p>
          <p className="text-2xl font-bold text-white">{completedOrders.length}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Discount Tier</p>
          <p className={`text-2xl font-bold ${tier === "Gold" ? "text-yellow-400" : tier === "Silver" ? "text-gray-300" : tier === "Bronze" ? "text-orange-400" : "text-gray-500"}`}>
            {tier === "None" ? "No tier" : `${tier} — ${discount}% off`}
          </p>
          {next && (
            <p className="text-gray-500 text-xs mt-1">
              {remaining} more order{remaining !== 1 ? "s" : ""} to reach {next}
            </p>
          )}
        </div>
      </div>

      {/* Discount tiers info */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 mb-10">
        <h2 className="text-sm font-semibold text-white mb-3">Discount Tiers</h2>
        <div className="flex gap-6 text-sm">
          <div className="text-gray-400"><span className="text-orange-400 font-semibold">Bronze</span> — {tierConfig.bronzeOrders}+ orders — {tierConfig.bronzeDiscount}% off</div>
          <div className="text-gray-400"><span className="text-gray-300 font-semibold">Silver</span> — {tierConfig.silverOrders}+ orders — {tierConfig.silverDiscount}% off</div>
          <div className="text-gray-400"><span className="text-yellow-400 font-semibold">Gold</span> — {tierConfig.goldOrders}+ orders — {tierConfig.goldDiscount}% off</div>
        </div>
      </div>

      {/* Order history */}
      <h2 className="text-lg font-semibold text-white mb-4">Order History</h2>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
          <p className="text-gray-400">No orders yet. Start shopping to earn discounts!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">£{Number(order.totalAmount).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" :
                    order.status === "CANCELLED" ? "bg-red-500/10 text-red-400" :
                    "bg-orange-500/10 text-orange-400"
                  }`}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <p key={item.id} className="text-gray-400 text-sm">
                    {item.quantity}x {item.product.title} — £{Number(item.priceAtPurchase).toFixed(2)}
                  </p>
                ))}
              </div>
              {(() => {
                const hasDropship = order.items.some(
                  (i) => i.product.productType === "DROPSHIP"
                );
                if (!hasDropship) return null;

                if (order.status === "PAID") {
                  return (
                    <div className="bg-orange-500/[0.06] border border-orange-500/20 rounded-lg px-4 py-3 mt-3 text-sm text-orange-300">
                      Account being sourced — expected within 4–5 business days
                    </div>
                  );
                }

                if (order.status === "COMPLETED") {
                  const dropshipCreds = order.items
                    .filter((i) => i.product.productType === "DROPSHIP")
                    .flatMap((i) =>
                      (i as any).credentials.map((c: any) => ({
                        username: c.username,
                        password: c.password,
                        productTitle: i.product.title,
                      }))
                    );
                  if (dropshipCreds.length === 0) return null;
                  return <ViewCredentialsButton credentials={dropshipCreds} />;
                }

                return null;
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
