"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { CartItem } from "@/types";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

type Props = {
  items: CartItem[];
};

export function CheckoutForm({ items }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "PAYPAL" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

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

      if (paymentMethod === "PAYPAL" && responseData.approveUrl) {
        window.location.href = responseData.approveUrl;
        return;
      }

      if (paymentMethod === "STRIPE" && responseData.url) {
        window.location.href = responseData.url;
        return;
      }
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Checkout</h2>
        <Separator className="bg-zinc-800" />
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">Email</Label>
        <p className="text-sm text-zinc-400">The order will be sent to this email</p>
        <Input
          type="email"
          placeholder="your@email.com"
          className="bg-zinc-900 border-zinc-700"
          {...register("email")}
        />
        {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">Payment Method</Label>
        <p className="text-sm text-zinc-400">Select payment method</p>
        <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
      </div>

      <Button
        type="submit"
        disabled={!paymentMethod || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Processing..." : "Continue to Payment"}
      </Button>

      <p className="text-xs text-zinc-500 text-center leading-relaxed">
        🔒 Your data is secured by extended validation SSL certificates (256-bit encryption).
        This complies with the strongest payment security standard available today.
      </p>
    </form>
  );
}
