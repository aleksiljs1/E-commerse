import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { prisma } from "@/lib/db";
import { ServiceIcon } from "@/components/store/ServiceIcon";
import { ProductActions } from "./ProductActions";
import { Fragment } from "react";

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

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

  const isDropship = product.productType === "DROPSHIP";

  let stockColor = "text-green-400";
  let stockLabel = isDropship ? "On Demand" : `${stock} in stock`;
  if (!isDropship) {
    if (stock === 0) { stockColor = "text-red-400"; stockLabel = "Out of stock"; }
    else if (stock < 3) { stockColor = "text-red-400"; stockLabel = `Only ${stock} left`; }
    else if (stock < 10) { stockColor = "text-amber-400"; }
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
                className="w-full max-h-[400px] object-contain"
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
            <RichText text={product.description} />
          </p>

          {/* 4. What we require */}
          {product.requirements && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">What We Require From You</h2>
              <ul className="space-y-1.5">
                {product.requirements.split("\n").filter(Boolean).map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span><RichText text={req} /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 5. Warranty & Terms */}
          {product.warrantyTerms && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Warranty &amp; Terms</h2>
              <ul className="space-y-1.5">
                {product.warrantyTerms.split("\n").filter(Boolean).map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span><RichText text={t} /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
              productType={product.productType}
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
