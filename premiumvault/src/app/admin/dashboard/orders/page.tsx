"use client";

import { useEffect, useState, useRef, Suspense } from "react";
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
  const activePage = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const activeSearch = searchParams.get("search") ?? "";

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [inputValue, setInputValue] = useState(activeSearch);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function buildUrl(overrides: Record<string, string | number | null> = {}) {
    const params = new URLSearchParams();
    const status = "status" in overrides ? overrides.status : activeStatus;
    const page = "page" in overrides ? overrides.page : activePage;
    const search = "search" in overrides ? overrides.search : activeSearch;

    if (status) params.set("status", String(status));
    if (search) params.set("search", String(search));
    if (page && Number(page) > 1) params.set("page", String(page));

    const qs = params.toString();
    return `/admin/dashboard/orders${qs ? `?${qs}` : ""}`;
  }

  function setStatus(status: string) {
    router.push(buildUrl({ status, page: null }));
  }

  function setPage(page: number) {
    router.push(buildUrl({ page }));
  }

  function handleSearchChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (activeStatus) params.set("status", activeStatus);
      if (value) params.set("search", value);
      // reset to page 1 when search changes
      const qs = params.toString();
      router.push(`/admin/dashboard/orders${qs ? `?${qs}` : ""}`);
    }, 300);
  }

  useEffect(() => {
    setInputValue(activeSearch);
  }, [activeSearch]);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeStatus) params.set("status", activeStatus);
        if (activeSearch) params.set("search", activeSearch);
        params.set("page", String(activePage));
        params.set("limit", "50");

        const res = await api.get(`/api/admin/orders?${params.toString()}`);
        const body = res.data;
        setOrders(body.data ?? body);
        setTotal(body.total ?? 0);
        setTotalPages(body.totalPages ?? 1);
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [activeStatus, activeSearch, activePage, refreshKey]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Orders</h1>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeStatus === tab.value
                ? "bg-white/[0.05] text-orange-400 border border-orange-400/30"
                : "bg-white/[0.04] text-gray-400 hover:text-orange-400 hover:bg-white/[0.05]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={inputValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search by email or order number..."
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl text-white px-4 py-2.5 text-sm placeholder-gray-500 outline-none focus:border-orange-400/50 transition-colors"
      />

      {loading ? (
        <div className="text-gray-400 text-sm">Loading orders...</div>
      ) : (
        <>
          <OrdersTable orders={orders} onOrderUpdated={() => setRefreshKey((k) => k + 1)} />

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-400">
              {total} total — Page {activePage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(activePage - 1)}
                disabled={activePage <= 1}
                className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(activePage + 1)}
                disabled={activePage >= totalPages}
                className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
