"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/ProductTable";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      const res = await api.get("/api/admin/products");
      setProducts(res.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleDeactivate(id: string) {
    try {
      await api.delete(`/api/admin/products/${id}`);
      toast.success("Product deactivated");
      fetchProducts();
    } catch {
      toast.error("Failed to deactivate product");
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

      {loading ? (
        <div className="text-zinc-500 text-sm">Loading products...</div>
      ) : (
        <ProductTable products={products} onDeactivate={handleDeactivate} />
      )}
    </div>
  );
}
