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

const PAYPAL_BOXES = [
  { id: "ff", label: "I agree to send the payment as friends & family" },
  { id: "amount", label: (total: string) => `I agree to send the payment of £${total}` },
  { id: "nonote", label: "I agree to not add a note to this payment" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "PAYPAL" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalChecks, setPaypalChecks] = useState({ ff: false, amount: false, nonote: false });
  const [showErrors, setShowErrors] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (items.length === 0) router.replace("/");
  }, [items, router]);

  if (items.length === 0) return null;

  const total = subtotal();
  const totalStr = total.toFixed(2);

  const allPaypalChecked = paypalChecks.ff && paypalChecks.amount && paypalChecks.nonote;

  const onSubmit = async (data: CheckoutFormData) => {
    if (!paymentMethod) return;

    if (paymentMethod === "PAYPAL" && !allPaypalChecked) {
      setShowErrors(true);
      return;
    }

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
        return;
      }

      const { orderId, url, approveUrl } = responseData as {
        orderId: string;
        url?: string | null;
        approveUrl?: string | null;
      };

      clearCart();

      if (paymentMethod === "STRIPE") {
        url ? (window.location.href = url) : router.push(`/checkout/success?orderId=${orderId}`);
        return;
      }
      if (paymentMethod === "PAYPAL") {
        approveUrl ? (window.location.href = approveUrl) : router.push(`/checkout/success?orderId=${orderId}`);
        return;
      }
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCheck = (key: keyof typeof paypalChecks) => {
    setPaypalChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    setShowErrors(false);
  };

  return (
    <div className="min-h-screen bg-[#0F1412] text-[#E8F5EE]">
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
              <span className="text-[#E8F5EE] font-bold text-lg">£{totalStr}</span>
            </div>
          </div>

          {/* CENTER divider */}
          <div className="hidden lg:block w-px bg-[#1F8A5B]/30" />

          {/* RIGHT: Checkout Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-xl font-bold text-[#E8F5EE]">Checkout</h2>

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
              {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
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
                    onClick={() => { setPaymentMethod(method); setShowErrors(false); }}
                    className={`cursor-pointer rounded-xl py-3 font-medium text-sm transition-all ${
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

            {/* PayPal F&F agreement checkboxes */}
            {paymentMethod === "PAYPAL" && (
              <div className="bg-[#16221B] border border-[#1F8A5B]/30 rounded-xl p-4 space-y-4">
                {/* Notice */}
                <p className="text-xs text-[#A0B5A8] leading-relaxed border-b border-[#1F8A5B]/20 pb-3">
                  Please note that you are required to send the exact payment of{" "}
                  <span className="text-[#E8F5EE] font-semibold">£{totalStr}</span>.
                  If you were to send any amount over or below, our funds will be lost.
                </p>

                {/* Checkboxes */}
                {[
                  { key: "ff" as const, label: "I agree to send the payment as friends & family" },
                  { key: "amount" as const, label: `I agree to send the payment of £${totalStr}` },
                  { key: "nonote" as const, label: "I agree to not add a note to this payment" },
                ].map(({ key, label }) => {
                  const uncheckedError = showErrors && !paypalChecks[key];
                  return (
                    <label
                      key={key}
                      className={`flex items-start gap-3 cursor-pointer group ${uncheckedError ? "opacity-100" : ""}`}
                    >
                      <div className="relative mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={paypalChecks[key]}
                          onChange={() => toggleCheck(key)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          paypalChecks[key]
                            ? "bg-[#1F8A5B] border-[#1F8A5B]"
                            : uncheckedError
                            ? "border-red-400 bg-red-400/5"
                            : "border-[#1F8A5B]/40 bg-[#0F1412] group-hover:border-[#1F8A5B]/70"
                        }`}>
                          {paypalChecks[key] && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm ${paypalChecks[key] ? "text-[#E8F5EE]" : "text-[#A0B5A8]"}`}>
                          {label}
                        </span>
                        {uncheckedError && (
                          <p className="text-red-400 text-xs mt-0.5">Please check this box to continue</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Continue button */}
            <button
              type="submit"
              disabled={!isValid || !paymentMethod || isProcessing}
              className="cursor-pointer w-full bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#2ECC71] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-semibold transition-colors"
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
