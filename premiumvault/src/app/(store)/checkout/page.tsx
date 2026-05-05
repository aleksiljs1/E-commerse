"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { OrderSummary } from "@/components/store/OrderSummary";
import { PaymentMethodSelector } from "@/components/store/PaymentMethodSelector";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "PAYPAL" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const total = subtotal();

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/");
    }
  }, [items, router]);

  if (items.length === 0) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }
    setError(null);
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          paymentMethod,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      clearCart();
      if (paymentMethod === "PAYPAL" && data.approveUrl) {
        window.location.href = data.approveUrl;
        return;
      }
      // Stripe: simple redirect (Stripe Elements wired later)
      setStatusMsg("Redirecting to payment...");
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-10">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left — Order Summary */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <OrderSummary items={items} subtotal={total} />
          </div>

          {/* Right — Payment Form */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-zinc-300 mb-2">Payment method</p>
                <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              {statusMsg && (
                <p className="text-sm text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-3">
                  {statusMsg}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : `Pay £${total.toFixed(2)}`}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
