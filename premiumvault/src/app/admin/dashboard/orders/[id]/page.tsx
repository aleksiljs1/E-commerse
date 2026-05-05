"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { OrderDetailView } from "@/components/admin/OrderDetailView";
import api from "@/lib/api";
import { toast } from "sonner";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await api.get(`/api/admin/orders/${id}`);
        setOrder(res.data);
      } catch {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  function handleStatusChange(status: string) {
    setOrder((prev: any) => ({ ...prev, status }));
  }

  if (loading) {
    return <div className="text-zinc-500 text-sm">Loading order...</div>;
  }

  if (!order) {
    return <div className="text-red-400 text-sm">Order not found.</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Order Detail</h1>
      <OrderDetailView order={order} onStatusChange={handleStatusChange} />
    </div>
  );
}
