"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";
import api from "@/lib/api";
import { toast } from "sonner";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get(`/api/admin/products/${id}`);
        setProduct(res.data);
      } catch {
        toast.error("Failed to load product");
      } finally {
        setFetchLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  async function handleSubmit(data: ProductFormData) {
    setIsLoading(true);
    try {
      await api.patch(`/api/admin/products/${id}`, data);
      toast.success("Product updated successfully");
      router.push("/admin/dashboard/products");
    } catch {
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  }

  if (fetchLoading) {
    return <div className="text-gray-400 text-sm">Loading product...</div>;
  }

  if (!product) {
    return <div className="text-red-400 text-sm">Product not found.</div>;
  }

  const defaultValues: Partial<ProductFormData> = {
    title: product.title,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    serviceType: product.serviceType,
    logoUrl: product.logoUrl ?? undefined,
    featured: product.featured,
    active: product.active,
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Edit Product</h1>
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6">
        <ProductForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          mode="edit"
        />
      </div>
    </div>
  );
}
