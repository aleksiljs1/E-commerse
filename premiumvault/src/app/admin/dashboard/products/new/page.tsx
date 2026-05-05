"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";
import api from "@/lib/api";
import { toast } from "sonner";

export default function NewProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(data: ProductFormData) {
    setIsLoading(true);
    try {
      await api.post("/api/admin/products", data);
      toast.success("Product created successfully");
      router.push("/admin/dashboard/products");
    } catch {
      toast.error("Failed to create product");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">New Product</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <ProductForm onSubmit={handleSubmit} isLoading={isLoading} mode="create" />
      </div>
    </div>
  );
}
