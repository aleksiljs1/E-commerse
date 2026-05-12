import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { OrderDetailView } from "@/components/admin/OrderDetailView";
import { decrypt } from "@/lib/crypto";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/admin/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  const { id } = await params;

  const [order, deliveredStock] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { title: true, serviceType: true, logoUrl: true, productType: true } },
            credentials: {
              select: { id: true, serviceType: true, username: true, password: true, status: true, submittedAt: true },
            },
          },
        },
      },
    }),
    prisma.accountStock.findMany({
      where: { orderId: id },
      include: { product: { select: { title: true } } },
      orderBy: { usedAt: "asc" },
    }),
  ]);

  if (!order) notFound();

  // Decrypt credential passwords for admin view
  const orderWithDecrypted = {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      credentials: item.credentials.map((cred) => ({
        ...cred,
        password: cred.password ? (() => { try { return decrypt(cred.password); } catch { return cred.password; } })() : null,
      })),
    })),
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Order Detail</h1>
      <OrderDetailView
        order={JSON.parse(JSON.stringify(orderWithDecrypted))}
        deliveredStock={JSON.parse(JSON.stringify(deliveredStock))}
      />
    </div>
  );
}
