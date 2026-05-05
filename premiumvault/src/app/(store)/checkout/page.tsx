"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { ServiceIcon } from "@/components/store/ServiceIcon";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "PAYPAL" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/");
    }
  }, [items, router]);

  if (items.length === 0) return null;

  const onSubmit = async (data: CheckoutFormData) => {
    if (!paymentMethod) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          paymentMethod,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        toast.error(responseData.error ?? "Something went wrong.");
        setIsProcessing(false);
        return;
      }

      const { orderId, url, approveUrl } = responseData as {
        orderId: string;
        url?: string | null;
        approveUrl?: string | null;
      };

      clearCart();

      if (paymentMethod === "STRIPE") {
        if (url) {
          window.location.href = url;
        } else {
          router.push(`/checkout/success?orderId=${orderId}`);
        }
        return;
      }

      if (paymentMethod === "PAYPAL") {
        if (approveUrl) {
          window.location.href = approveUrl;
        } else {
          router.push(`/checkout/success?orderId=${orderId}`);
        }
        return;
      }
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const total = subtotal();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top bar */}
      <header className="border-b border-[#1e1e2e] px-6 py-4 flex items-center">
        <span className="font-rajdhani text-xl font-bold text-white">🔐 PremiumVault</span>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_460px] gap-0 lg:gap-12 items-start">

          {/* LEFT: Order Summary */}
          <div>
            <h2 className="font-rajdhani text-xl font-bold text-white mb-6">Order Summary</h2>
            <div>
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 py-3 border-b border-[#1e1e2e]">
                  <ServiceIcon serviceType={item.serviceType} logoUrl={item.logoUrl} size="sm" />
                  <span className="text-white text-sm flex-1">{item.quantity}× {item.title}</span>
                  <span className="text-[#a1a1aa] text-sm">£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 mt-2">
              <span className="text-white font-bold">Total</span>
              <span className="text-white font-bold text-lg">£{total.toFixed(2)}</span>
            </div>
          </div>

          {/* CENTER: 1px divider */}
          <div className="hidden lg:block bg-[#1e1e2e]" />

          {/* RIGHT: Checkout Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2 className="font-rajdhani text-xl font-bold text-white mb-6">Checkout</h2>

            {/* Email */}
            <div>
              <label className="block text-white text-sm font-semibold mb-1">Email</label>
              <p className="text-[#a1a1aa] text-xs mb-2">The order will be sent to this email</p>
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-[#141420] border border-[#1e1e2e] focus:border-purple-600 rounded-xl text-white px-4 py-3 w-full outline-none transition-colors"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="mt-5">
              <label className="block text-white text-sm font-semibold mb-1">Payment Method</label>
              <p className="text-[#a1a1aa] text-xs mb-3">Select your payment method</p>
              <div className="grid grid-cols-2 gap-3">
                {(["PAYPAL", "STRIPE"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-xl py-3 font-medium text-sm transition-all ${
                      paymentMethod === method
                        ? "bg-purple-600/10 border border-purple-600 text-purple-400"
                        : "bg-[#141420] border border-[#1e1e2e] text-[#a1a1aa] hover:border-purple-600/50"
                    }`}
                  >
                    {method === "PAYPAL" ? "PayPal F&F" : "Stripe"}
                  </button>
                ))}
              </div>
            </div>

            {/* Continue button */}
            <button
              type="submit"
              disabled={!paymentMethod || !isValid || isProcessing}
              className="mt-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 w-full font-semibold transition-colors"
            >
              {isProcessing ? "Processing..." : "Continue to Payment"}
            </button>

            {/* SSL */}
            <p className="text-[#52525b] text-xs text-center mt-4 leading-relaxed px-2">
              Your data is secured by extended validation SSL certificates (256-bit encryption).
              This complies with the strongest payment security standard available today.
            </p>
          </form>

        </div>
      </main>
    </div>
  );
}
