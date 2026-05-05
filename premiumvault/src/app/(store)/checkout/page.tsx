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
    <div className="min-h-screen bg-[#0F1412] text-[#E8F5EE]">
      {/* Top bar — no nav */}
      <header className="border-b border-[#1F8A5B]/30 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <span className="text-2xl font-bold text-[#E8F5EE]">PremiumVault</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_460px] gap-0 lg:gap-12 items-start">

          {/* LEFT: Order Summary */}
          <div>
            <h2 className="text-xl font-bold text-[#E8F5EE] mb-6">Order Summary</h2>
            <div>
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 py-3 border-b border-[#1F8A5B]/30">
                  <ServiceIcon serviceType={item.serviceType} logoUrl={item.logoUrl} size="sm" />
                  <span className="text-[#E8F5EE] text-sm flex-1">{item.quantity}× {item.title}</span>
                  <span className="text-[#A0B5A8] text-sm">£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 mt-2">
              <span className="text-[#E8F5EE] font-bold">Total</span>
              <span className="text-[#E8F5EE] font-bold text-lg">£{total.toFixed(2)}</span>
            </div>
          </div>

          {/* CENTER: 1px divider */}
          <div className="hidden lg:block w-px bg-[#1F8A5B]/30" />

          {/* RIGHT: Checkout Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#E8F5EE] mb-1">Checkout</h2>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-base font-semibold text-[#E8F5EE]">Email</label>
              <p className="text-sm text-[#A0B5A8]">The order will be sent to this email</p>
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-[#16221B] border border-[#1F8A5B]/30 focus:border-[#1F8A5B] rounded-xl text-[#E8F5EE] px-4 py-3 w-full outline-none transition-colors"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-base font-semibold text-[#E8F5EE]">Payment Method</label>
              <p className="text-sm text-[#A0B5A8]">Select payment method</p>
              <div className="grid grid-cols-2 gap-3">
                {(["STRIPE", "PAYPAL"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-xl py-3 font-medium text-sm transition-all ${
                      paymentMethod === method
                        ? "bg-[#1F8A5B]/10 border border-[#1F8A5B] text-[#2ECC71]"
                        : "bg-[#16221B] border border-[#1F8A5B]/30 text-[#A0B5A8] hover:border-[#1F8A5B]/50"
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
              disabled={!isValid || !paymentMethod || isProcessing}
              className="w-full bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#2ECC71] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-semibold transition-colors"
            >
              {isProcessing ? "Processing..." : "Continue to Payment"}
            </button>

            <p className="text-xs text-[#A0B5A8]/70 text-center leading-relaxed">
              🔒 Your data is secured by extended validation SSL certificates (256-bit encryption).
              This complies with the strongest payment security standard available today.
            </p>
          </form>

        </div>
      </main>
    </div>
  );
}
