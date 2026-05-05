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

  let stockColor = "text-green-400";
  if (stock < 3) {
    stockColor = "text-red-400";
  } else if (stock < 10) {
    stockColor = "text-amber-400";
  }
  const stockLabel = `${stock} in stock`;

  return (
    <div className="bg-zinc-950 text-white min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* 1. Title */}
          <h1 className="text-3xl font-bold text-white">{product.title}</h1>

          {/* 2. Logo */}
          <div className="flex justify-start">
            <ServiceIcon
              serviceType={product.serviceType}
              logoUrl={product.logoUrl}
              size="lg"
            />
          </div>

          {/* 3. Description */}
          <p className="text-zinc-300 text-sm leading-relaxed">
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
                <li key={req} className="flex items-start gap-2 text-zinc-300 text-sm">
                  <span className="text-indigo-400 mt-0.5">•</span>
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
                <li key={t} className="flex items-start gap-2 text-zinc-300 text-sm">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column — sticky purchase panel, NO logo */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-5">
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

            <div className="flex items-center gap-2 text-zinc-500 text-xs pt-1 border-t border-zinc-800">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              Secure checkout with 256-bit SSL encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
