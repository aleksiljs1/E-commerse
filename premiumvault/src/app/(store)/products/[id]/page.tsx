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

  if (!product) {
    notFound();
  }

  const price = Number(product.price);
  const stock = product.stock;

  let stockColor = "text-green-400";
  let stockLabel = `${stock} in stock`;
  if (stock < 3) {
    stockColor = "text-red-400";
    stockLabel = `Only ${stock} left — hurry!`;
  } else if (stock < 10) {
    stockColor = "text-orange-400";
    stockLabel = `Only ${stock} left`;
  }

  return (
    <div className="bg-zinc-950 text-white min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <ServiceIcon
            serviceType={product.serviceType}
            logoUrl={product.logoUrl}
            size="lg"
          />

          <h1 className="text-3xl font-bold text-white">{product.title}</h1>

          {/* Guarantees */}
          <ul className="space-y-2">
            {[
              "Upgrade guaranteed within 4–5 business days",
              "Secure credential encryption",
              "If upgrade fails, full refund guaranteed",
            ].map((g) => (
              <li key={g} className="flex items-center gap-2 text-zinc-400 text-sm">
                <span className="text-green-400">✓</span>
                {g}
              </li>
            ))}
          </ul>

          {/* Full description */}
          {product.description && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">About this service</h2>
              <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* What we require */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">What we require from you</h2>
            <ul className="space-y-1">
              {[
                "Your account email address",
                "Your account password (kept secure and encrypted)",
                "Confirmation of account region / country",
              ].map((req) => (
                <li key={req} className="flex items-start gap-2 text-zinc-400 text-sm">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column — sticky purchase panel */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <ServiceIcon
                serviceType={product.serviceType}
                logoUrl={product.logoUrl}
                size="md"
              />
              <span className="text-zinc-300 font-medium">{product.title}</span>
            </div>

            <div>
              <p className="text-3xl font-bold text-white">£{price.toFixed(2)}</p>
              <p className={`text-sm mt-1 font-medium ${stockColor}`}>{stockLabel}</p>
            </div>

            <ProductActions
              price={price}
              productId={product.id}
              title={product.title}
              logoUrl={product.logoUrl}
              serviceType={product.serviceType}
              stock={stock}
            />

            <div className="flex items-center gap-2 text-zinc-500 text-xs pt-1 border-t border-zinc-800">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              Secure checkout with 256-bit SSL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
