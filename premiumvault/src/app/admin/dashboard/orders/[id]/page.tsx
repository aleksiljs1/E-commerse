import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { OrderDetailView } from "@/components/admin/OrderDetailView";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { title: true, serviceType: true, logoUrl: true } },
          credentials: {
            select: { id: true, serviceType: true, username: true, status: true, submittedAt: true },
          },
        },
      },
    },
  });

  if (!order) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Order Detail</h1>
      <OrderDetailView order={JSON.parse(JSON.stringify(order))} />
    </div>
  );
}
