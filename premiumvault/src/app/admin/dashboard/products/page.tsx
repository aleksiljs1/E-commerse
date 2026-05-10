"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/ProductTable";
import api from "@/lib/api";
import { toast } from "sonner";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activePage = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const activeSearch = searchParams.get("search") ?? "";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [inputValue, setInputValue] = useState(activeSearch);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchProducts(search = activeSearch, page = activePage) {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", "50");

      const res = await api.get(`/api/admin/products?${params.toString()}`);
      const body = res.data;
      setProducts(body.data ?? body);
      setTotal(body.total ?? 0);
      setTotalPages(body.totalPages ?? 1);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  function setPage(page: number) {
    const params = new URLSearchParams();
    if (activeSearch) params.set("search", activeSearch);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.push(`/admin/dashboard/products${qs ? `?${qs}` : ""}`);
  }

  function handleSearchChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value) params.set("search", value);
      // reset to page 1 when search changes
      const qs = params.toString();
      router.push(`/admin/dashboard/products${qs ? `?${qs}` : ""}`);
    }, 300);
  }

  useEffect(() => {
    setInputValue(activeSearch);
  }, [activeSearch]);

  useEffect(() => {
    setLoading(true);
    fetchProducts(activeSearch, activePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSearch, activePage]);

  async function handleDeactivate(id: string) {
    try {
      await api.delete(`/api/admin/products/${id}`);
      toast.success("Product deactivated");
      fetchProducts();
    } catch {
      toast.error("Failed to deactivate product");
    }
  }

  async function handleActivate(id: string) {
    try {
      await api.patch(`/api/admin/products/${id}`, { active: true });
      toast.success("Product activated");
      fetchProducts();
    } catch {
      toast.error("Failed to activate product");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Link href="/admin/dashboard/products/new">
          <Button>+ Add Product</Button>
        </Link>
      </div>

      {/* Search */}
      <input
        value={inputValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search products..."
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl text-white px-4 py-2.5 text-sm placeholder-gray-500 outline-none focus:border-orange-400/50 transition-colors"
      />

      {loading ? (
        <div className="text-gray-400 text-sm">Loading products...</div>
      ) : (
        <>
          <ProductTable products={products} onDeactivate={handleDeactivate} onActivate={handleActivate} />

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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
