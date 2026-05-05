"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { OrderSummary } from "@/components/store/OrderSummary";
import { PaymentMethodSelector } from "@/components/store/PaymentMethodSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top bar — no nav */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <span className="text-2xl font-bold text-white">PremiumVault</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_480px] gap-0 lg:gap-10">
          {/* Left: Order Summary */}
          <OrderSummary items={items} subtotal={subtotal()} />

          {/* Center: Vertical Divider */}
          <div className="hidden lg:block w-px bg-zinc-800" />

          {/* Right: Checkout Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Checkout</h2>
              <Separator className="bg-zinc-800" />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-white">Email</Label>
              <p className="text-sm text-zinc-400">The order will be sent to this email</p>
              <Input
                type="email"
                placeholder="your@email.com"
                className="bg-zinc-900 border-zinc-700"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-white">Payment Method</Label>
              <p className="text-sm text-zinc-400">Select payment method</p>
              <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
            </div>

            <Button
              type="submit"
              disabled={!isValid || !paymentMethod || isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              size="lg"
            >
              {isProcessing ? "Processing..." : "Continue to Payment"}
            </Button>

            <p className="text-xs text-zinc-500 text-center leading-relaxed">
              🔒 Your data is secured by extended validation SSL certificates (256-bit encryption).
              This complies with the strongest payment security standard available today.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
