import { prisma } from "@/lib/db";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { format } from "date-fns";

export default async function DashboardPage() {
  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue,
    recentOrders,
    totalProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ["PAID", "CREDENTIALS_SUBMITTED", "COMPLETED"] } },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    }),
    prisma.product.count({ where: { active: true } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#E8F5EE]">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Orders" value={totalOrders} />
        <StatsCard label="Awaiting Credentials" value={pendingOrders} highlight />
        <StatsCard label="Completed" value={completedOrders} />
        <StatsCard
          label="Total Revenue"
          value={`£${Number(totalRevenue._sum.totalAmount ?? 0).toFixed(2)}`}
        />
      </div>

      {/* Recent orders mini-table */}
      <div className="bg-[#16221B] border border-[#1F8A5B]/30 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#E8F5EE] mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-[#A0B5A8] text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F8A5B]/20">
                  <th className="text-left py-2 px-2 text-[#A0B5A8] font-medium">Order #</th>
                  <th className="text-left py-2 px-2 text-[#A0B5A8] font-medium">Email</th>
                  <th className="text-left py-2 px-2 text-[#A0B5A8] font-medium">Amount</th>
                  <th className="text-left py-2 px-2 text-[#A0B5A8] font-medium">Status</th>
                  <th className="text-left py-2 px-2 text-[#A0B5A8] font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#1F8A5B]/10">
                    <td className="py-2 px-2 font-mono text-xs text-[#A0B5A8]">
                      {order.orderNumber}
                    </td>
                    <td className="py-2 px-2 text-[#A0B5A8]">{order.customerEmail}</td>
                    <td className="py-2 px-2 text-[#A0B5A8]">
                      £{Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-2 px-2">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-2 px-2 text-[#A0B5A8] text-xs">
                      {format(new Date(order.createdAt), "dd MMM yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
