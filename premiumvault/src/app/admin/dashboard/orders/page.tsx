"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrdersTable } from "@/components/admin/OrdersTable";
import api from "@/lib/api";
import { toast } from "sonner";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Credentials Submitted", value: "CREDENTIALS_SUBMITTED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeStatus = searchParams.get("status") ?? "";

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const url = activeStatus
          ? `/api/admin/orders?status=${activeStatus}`
          : "/api/admin/orders";
        const res = await api.get(url);
        setOrders(res.data.data ?? res.data);
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [activeStatus]);

  function setStatus(status: string) {
    if (status) {
      router.push(`/admin/dashboard/orders?status=${status}`);
    } else {
      router.push("/admin/dashboard/orders");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#E8F5EE]">Orders</h1>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeStatus === tab.value
                ? "bg-[#1F8A5B] text-white"
                : "bg-[#16221B] text-[#A0B5A8] hover:text-[#7DFFB2] hover:bg-[#1F8A5B]/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-[#A0B5A8] text-sm">Loading orders...</div>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="text-[#A0B5A8] text-sm">Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
