import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { prisma } from "@/lib/db";
import { ServiceIcon } from "@/components/store/ServiceIcon";
import { ProductActions } from "./ProductActions";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id, active: true },
  });

  if (!product) notFound();

  const price = Number(product.price);
  const stock = product.stock;

  let stockBg = "bg-green-500/10 text-green-400 border-green-500/20";
  if (stock < 3) {
    stockBg = "bg-red-500/10 text-red-400 border-red-500/20";
  } else if (stock < 10) {
    stockBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">

          {/* LEFT column */}
          <div>
            {/* 1. Title */}
            <h1 className="font-rajdhani text-3xl md:text-4xl font-bold text-white mb-6">
              {product.title}
            </h1>

            {/* 2. Logo card */}
            <div className="bg-[#0d0d18] border border-[#1e1e2e] rounded-2xl p-10 flex items-center justify-center mb-6">
              {product.logoUrl ? (
                <img
                  src={product.logoUrl}
                  alt={product.title}
                  className="w-[120px] h-[120px] object-contain"
                />
              ) : (
                <ServiceIcon serviceType={product.serviceType} logoUrl={product.logoUrl} size="lg" />
              )}
            </div>

            {/* 3. Description */}
            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            {/* 4. What We Require */}
            <div className="mb-6">
              <h2 className="text-white font-semibold text-base mb-3">What We Require</h2>
              <ul className="space-y-2">
                {[
                  "Your account email address",
                  "Your account password (submitted via secure encrypted link after payment)",
                  "Do not change your password during the upgrade process",
                ].map((req) => (
                  <li key={req} className="flex gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span className="text-[#a1a1aa] text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Warranty & Terms */}
            <div>
              <h2 className="text-white font-semibold text-base mb-3">Warranty &amp; Terms</h2>
              <ul className="space-y-2">
                {[
                  "Upgrade guaranteed within 4–5 business days",
                  "If upgrade fails for any reason, full refund guaranteed",
                  "Your credentials are encrypted and never stored in plain text",
                  "Do not change your password during the upgrade window",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="text-[#a1a1aa] text-sm">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT column — sticky purchase panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-[#0d0d18] border border-[#1e1e2e] rounded-2xl p-6 space-y-5">
              {/* Price */}
              <p className="font-rajdhani text-4xl font-bold text-white">
                £{price.toFixed(2)}
              </p>

              {/* Stock pill */}
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border inline-block ${stockBg}`}>
                {stock} in stock
              </span>

              {/* Actions */}
              <ProductActions
                price={price}
                productId={product.id}
                title={product.title}
                description={product.description}
                logoUrl={product.logoUrl}
                serviceType={product.serviceType}
                stock={stock}
              />

              {/* Divider */}
              <hr className="border-[#1e1e2e]" />

              {/* SSL */}
              <div className="flex items-center gap-1.5 text-[#52525b] text-xs">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                Secured by 256-bit SSL
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
