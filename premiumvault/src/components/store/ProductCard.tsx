"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceIcon } from "./ServiceIcon";
import type { SerializedProduct } from "@/types";

type Props = {
  product: SerializedProduct;
};

export function ProductCard({ product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      logoUrl: product.logoUrl,
      serviceType: product.serviceType,
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className="rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-indigo-500 transition-all cursor-pointer flex flex-col overflow-hidden"
    >
      {/* Featured badge */}
      {product.featured && (
        <div className="px-4 pt-3 flex justify-end">
          <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white text-xs px-2 py-0.5">
            Featured
          </Badge>
        </div>
      )}

      {/* Top — icon */}
      <div className="flex items-center justify-center py-8 px-4">
        <ServiceIcon
          serviceType={product.serviceType}
          logoUrl={product.logoUrl}
          size="lg"
        />
      </div>

      {/* Title */}
      <p className="font-semibold text-white text-sm text-center px-4 pb-1">
        {product.title}
      </p>

      {/* Price */}
      <p className="text-indigo-400 font-bold text-lg text-center pb-2">
        £{product.price.toFixed(2)}
      </p>

      {/* Low stock warning */}
      {product.stock < 5 && (
        <p className="text-orange-400 text-xs font-medium text-center pb-2">
          Only {product.stock} left
        </p>
      )}

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* Add to Cart button */}
      <div className="px-4 pb-4 pt-2">
        <Button
          onClick={handleAddToCart}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
          size="sm"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
