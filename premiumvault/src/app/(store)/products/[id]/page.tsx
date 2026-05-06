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

  let stockColor = "text-green-400";
  let stockLabel = `${stock} in stock`;
  if (stock < 3) {
    stockColor = "text-red-400";
    stockLabel = stock === 0 ? "Out of stock" : `Only ${stock} left`;
  } else if (stock < 10) {
    stockColor = "text-amber-400";
  }

  return (
    <div className="bg-[#0a0a0f] text-white min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* 1. Title */}
          <h1 className="text-3xl font-bold text-white">{product.title}</h1>

          {/* 2. Logo */}
          {product.logoUrl ? (
            <div className="w-full rounded-2xl overflow-hidden bg-white/[0.05] border border-white/[0.08]">
              <img
                src={product.logoUrl}
                alt={product.title}
                className="w-full h-56 object-cover"
              />
            </div>
          ) : (
            <div className="flex justify-start">
              <ServiceIcon
                serviceType={product.serviceType}
                logoUrl={null}
                size="lg"
              />
            </div>
          )}

          {/* 3. Description */}
          <p className="text-gray-400 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* 4. What we require */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">What We Require From You</h2>
            <ul className="space-y-1.5">
              {[
                "Your account email address",
                "Your account password (submitted via secure encrypted link after payment)",
                "Do not change your password during the upgrade process",
              ].map((req) => (
                <li key={req} className="flex items-start gap-2 text-gray-400 text-sm">
                  <span className="text-orange-400 mt-0.5">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* 5. Warranty & Terms */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Warranty &amp; Terms</h2>
            <ul className="space-y-1.5">
              {[
                "Upgrade guaranteed within 4–5 business days",
                "If upgrade fails for any reason, full refund guaranteed",
                "Your credentials are encrypted and never stored in plain text",
                "Do not change your password during the upgrade window",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-gray-400 text-sm">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column — sticky purchase panel */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.05] p-6 flex flex-col gap-5">
            <div>
              <p className="text-3xl font-bold text-white">£{price.toFixed(2)}</p>
              <p className={`text-sm mt-1 font-medium ${stockColor}`}>{stockLabel}</p>
            </div>

            <ProductActions
              price={price}
              productId={product.id}
              title={product.title}
              description={product.description}
              logoUrl={product.logoUrl}
              serviceType={product.serviceType}
              stock={stock}
            />

            <div className="flex items-center gap-2 text-gray-400 text-xs pt-1 border-t border-white/[0.08]">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              Secure checkout with 256-bit SSL encryption
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
