"use client";

import type { SerializedProduct } from "@/types";
import { useCartStore } from "@/store/cart";

const fallbackProducts = [
  { id: "netflix", name: "Netflix 4K Ultra HD", desc: "Premium 4K UHD streaming with full access to all content worldwide.", oldPrice: "£15.99", price: 3.99, warranty: "Lifetime Warranty", emoji: "🎬", gradient: "from-[#e50914] to-[#b20710]" },
  { id: "spotify", name: "Spotify Premium", desc: "Ad-free music streaming with offline downloads and unlimited skips.", oldPrice: "£9.99", price: 2.99, warranty: "Lifetime Warranty", emoji: "🎵", gradient: "from-[#1db954] to-[#148f3e]" },
  { id: "disney", name: "Disney+ Premium", desc: "Stream Disney, Marvel, Star Wars, Pixar and National Geographic.", oldPrice: "£11.99", price: 3.49, warranty: "1 Year Warranty", emoji: "🏰", gradient: "from-[#0063e5] to-[#0040a0]" },
  { id: "hbo", name: "HBO Max", desc: "Access HBO originals, blockbuster movies, and exclusive series.", oldPrice: "£14.99", price: 3.99, warranty: "1 Year Warranty", emoji: "🎭", gradient: "from-[#7c3aed] to-[#5b21b6]" },
  { id: "chatgpt", name: "ChatGPT Plus", desc: "GPT-4 access with faster responses, plugins, and priority support.", oldPrice: "£20.00", price: 5.99, warranty: "Lifetime Warranty", emoji: "🤖", gradient: "from-[#0d9488] to-[#0f766e]" },
  { id: "adobe", name: "Adobe Creative Cloud", desc: "Full suite: Photoshop, Illustrator, Premiere Pro and 20+ apps.", oldPrice: "£54.99", price: 7.99, warranty: "Lifetime Warranty", emoji: "🎨", gradient: "from-[#1e3a5f] to-[#0f1f3d]" },
  { id: "canva", name: "Canva Pro", desc: "Premium templates, brand kit, background remover and more.", oldPrice: "£12.99", price: 2.49, warranty: "1 Year Warranty", emoji: "✏️", gradient: "from-[#06b6d4] to-[#0891b2]" },
  { id: "nordvpn", name: "NordVPN Premium", desc: "Military-grade encryption with 5500+ servers in 60 countries.", oldPrice: "£11.99", price: 2.99, warranty: "Lifetime Warranty", emoji: "🛡️", gradient: "from-[#4f46e5] to-[#7c3aed]" },
];

type Props = {
  products?: SerializedProduct[];
};

export function ProductGrid({ products }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  // Use DB products if available, otherwise show fallback
  if (products && products.length > 0) {
    return (
      <section id="shop">
        <h2 className="font-rajdhani text-center text-4xl mb-10 pt-10 text-white">Our Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-5 md:px-10 pb-14 max-w-[1300px] mx-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[#141420] border border-[#1e1e2e] rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-2 hover:border-purple-600 hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]"
            >
              <div className="h-[120px] flex items-center justify-center text-5xl bg-gradient-to-br from-purple-600 to-purple-800">
                🔑
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-lg font-bold text-white mb-1.5">{product.title}</div>
                <div className="text-xs text-[#a1a1aa] mb-3.5">{product.description}</div>
                <div className="mb-2.5">
                  <span className="text-purple-600 text-2xl font-bold font-rajdhani">
                    £{product.price.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-green-400 font-medium mb-4">✓ Warranty Included</div>
                <button
                  onClick={() =>
                    addItem({
                      productId: product.id,
                      title: product.title,
                      description: product.description,
                      price: product.price,
                      logoUrl: product.logoUrl,
                      serviceType: product.serviceType,
                    })
                  }
                  className="mt-auto w-full py-3 bg-purple-600 text-white rounded-[10px] font-semibold text-sm cursor-pointer transition-all hover:bg-purple-700 hover:shadow-[0_4px_15px_rgba(124,58,237,0.4)]"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Fallback hardcoded products
  return (
    <section id="shop">
      <h2 className="font-rajdhani text-center text-4xl mb-10 pt-10 text-white">Our Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-5 md:px-10 pb-14 max-w-[1300px] mx-auto">
        {fallbackProducts.map((product) => (
          <div
            key={product.id}
            className="bg-[#141420] border border-[#1e1e2e] rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-2 hover:border-purple-600 hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]"
          >
            <div className={`h-[120px] flex items-center justify-center text-5xl bg-gradient-to-br ${product.gradient}`}>
              {product.emoji}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="text-lg font-bold text-white mb-1.5">{product.name}</div>
              <div className="text-xs text-[#a1a1aa] mb-3.5">{product.desc}</div>
              <div className="mb-2.5">
                <span className="line-through text-[#a1a1aa] text-sm mr-2">{product.oldPrice}</span>
                <span className="text-purple-600 text-2xl font-bold font-rajdhani">
                  £{product.price.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-green-400 font-medium mb-4">✓ {product.warranty}</div>
              <button
                onClick={() =>
                  addItem({
                    productId: product.id,
                    title: product.name,
                    description: product.desc,
                    price: product.price,
                    logoUrl: null,
                    serviceType: "STREAMING",
                  })
                }
                className="mt-auto w-full py-3 bg-purple-600 text-white rounded-[10px] font-semibold text-sm cursor-pointer transition-all hover:bg-purple-700 hover:shadow-[0_4px_15px_rgba(124,58,237,0.4)]"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
