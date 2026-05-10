"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { ServiceIcon } from "@/components/store/ServiceIcon";
import { Ticket, X, Check, Loader2 } from "lucide-react";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

type AppliedCoupon = { id: string; code: string; discountPct: number };

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
  const [discount, setDiscount] = useState(0);
  const [discountTier, setDiscountTier] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

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

  useEffect(() => {
    fetch("/api/user/discount")
      .then((r) => r.json())
      .then((data) => {
        setDiscount(data.discount);
        setDiscountTier(data.tier);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  const rawTotal = subtotal();
  const effectiveDiscount = Math.max(discount, appliedCoupon?.discountPct ?? 0);
  const discountAmount = effectiveDiscount > 0 ? rawTotal * (effectiveDiscount / 100) : 0;
  const total = rawTotal - discountAmount;
  const totalStr = total.toFixed(2);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error); return; }
      setAppliedCoupon(data);
      toast.success(`Coupon applied: ${data.discountPct}% off`);
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

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
          ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <span className="text-2xl font-bold text-white">PremiumVault</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_460px] gap-0 lg:gap-12 items-start">

          {/* LEFT: Order Summary */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
            <div>
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 py-3 border-b border-white/[0.08]">
                  <ServiceIcon serviceType={item.serviceType} logoUrl={item.logoUrl} size="sm" />
                  <span className="text-white text-sm flex-1">{item.quantity}× {item.title}</span>
                  <span className="text-gray-400 text-sm">£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            {/* Coupon code input */}
            <div className="mt-5 pt-4 border-t border-white/[0.08]">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-400/[0.06] border border-emerald-400/20 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-emerald-400 text-sm font-semibold">{appliedCoupon.code}</span>
                      <span className="text-emerald-400/70 text-xs ml-2">{appliedCoupon.discountPct}% off</span>
                    </div>
                  </div>
                  <button type="button" onClick={removeCoupon} className="cursor-pointer text-gray-400 hover:text-white transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
                        placeholder="Coupon code"
                        className="bg-white/[0.04] border border-white/[0.08] focus:border-orange-400 rounded-xl text-white pl-10 pr-4 py-2.5 w-full outline-none transition-colors text-sm uppercase placeholder:normal-case"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="cursor-pointer bg-white/[0.06] border border-white/[0.08] hover:border-orange-400 hover:text-orange-400 text-gray-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-red-400 text-xs mt-1.5">{couponError}</p>}
                </div>
              )}
            </div>

            {effectiveDiscount > 0 && (
              <>
                <div className="flex justify-between pt-4 mt-2">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-400">£{rawTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-emerald-400 text-sm">
                    {appliedCoupon && appliedCoupon.discountPct >= discount
                      ? `Coupon ${appliedCoupon.code}`
                      : `${discountTier} discount`} ({effectiveDiscount}%)
                  </span>
                  <span className="text-emerald-400 text-sm">-£{discountAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className={`flex justify-between ${effectiveDiscount > 0 ? "pt-2 border-t border-white/[0.08] mt-2" : "pt-4 mt-2"}`}>
              <span className="text-white font-bold">Total</span>
              <span className="text-white font-bold text-lg">£{totalStr}</span>
            </div>
          </div>

          {/* CENTER divider */}
          <div className="hidden lg:block w-px bg-white/[0.08]" />

          {/* RIGHT: Checkout Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-xl font-bold text-white">Checkout</h2>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-base font-semibold text-white">Email</label>
              <p className="text-sm text-gray-400">The order will be sent to this email</p>
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-white/[0.04] border border-white/[0.08] focus:border-orange-400 rounded-xl text-white px-4 py-3 w-full outline-none transition-colors"
                {...register("email")}
              />
              {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-base font-semibold text-white">Payment Method</label>
              <p className="text-sm text-gray-400">Select payment method</p>
              <div className="grid grid-cols-2 gap-3">
                {(["STRIPE", "PAYPAL"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => { setPaymentMethod(method); setShowErrors(false); }}
                    className={`cursor-pointer rounded-xl py-3 font-medium text-sm transition-all ${
                      paymentMethod === method
                        ? "bg-orange-400/10 border border-orange-400 text-orange-400"
                        : "bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:border-white/[0.15]"
                    }`}
                  >
                    {method === "PAYPAL" ? "PayPal F&F" : "Stripe"}
                  </button>
                ))}
              </div>
            </div>

            {/* PayPal F&F agreement checkboxes */}
            {paymentMethod === "PAYPAL" && (
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 space-y-4">
                {/* Notice */}
                <p className="text-xs text-gray-400 leading-relaxed border-b border-white/[0.06] pb-3">
                  Please note that you are required to send the exact payment of{" "}
                  <span className="text-white font-semibold">£{totalStr}</span>.
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
                            ? "bg-orange-400 border-orange-400"
                            : uncheckedError
                            ? "border-red-400 bg-red-400/5"
                            : "border-white/[0.15] bg-[#0a0a0f] group-hover:border-white/[0.3]"
                        }`}>
                          {paypalChecks[key] && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm ${paypalChecks[key] ? "text-white" : "text-gray-400"}`}>
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
              disabled={!paymentMethod || isProcessing}
              className="cursor-pointer w-full bg-gradient-to-r from-orange-400 to-rose-500 hover:from-rose-500 hover:to-orange-400 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-semibold transition-colors"
            >
              {isProcessing ? "Processing..." : "Continue to Payment"}
            </button>

            <p className="text-xs text-gray-400/70 text-center leading-relaxed">
              🔒 Your data is secured by extended validation SSL certificates (256-bit encryption).
              This complies with the strongest payment security standard available today.
            </p>
          </form>

        </div>
      </main>
    </div>
  );
}
