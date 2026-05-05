"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceIcon } from "./ServiceIcon";
import type { Product } from "@/types";

type Props = {
  product: Product;
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
      price: Number(product.price),
      logoUrl: product.logoUrl,
      serviceType: product.serviceType,
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className="rounded-2xl border border-zinc-800 bg-zinc-900 hover:scale-[1.02] transition-transform cursor-pointer flex flex-col overflow-hidden"
    >
      {/* Top — icon */}
      <div className="flex items-center justify-center pt-6 pb-4 px-4">
        <ServiceIcon
          serviceType={product.serviceType}
          logoUrl={product.logoUrl}
          size="md"
        />
      </div>

      {/* Body */}
      <div className="flex-1 px-4 pb-4 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-white text-base leading-tight">{product.title}</h3>
          {product.featured && (
            <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white text-xs px-2 py-0.5">
              Featured
            </Badge>
          )}
        </div>

        {product.description && (
          <p className="line-clamp-2 text-zinc-400 text-sm leading-snug">
            {product.description}
          </p>
        )}

        <p className="font-bold text-indigo-400 text-lg">
          £{Number(product.price).toFixed(2)}
        </p>

        {product.stock < 5 && (
          <p className="text-orange-400 text-xs font-medium">
            Only {product.stock} left
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <Button
          onClick={handleAddToCart}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          size="sm"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
