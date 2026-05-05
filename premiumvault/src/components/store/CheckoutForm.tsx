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
        <h2 className="text-xl font-bold text-[#E8F5EE] mb-1">Checkout</h2>
        <Separator className="bg-[#1F8A5B]/30" />
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold text-[#E8F5EE]">Email</Label>
        <p className="text-sm text-[#A0B5A8]">The order will be sent to this email</p>
        <Input
          type="email"
          placeholder="your@email.com"
          className="bg-[#16221B] border-[#1F8A5B]/30"
          {...register("email")}
        />
        {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold text-[#E8F5EE]">Payment Method</Label>
        <p className="text-sm text-[#A0B5A8]">Select payment method</p>
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

      <p className="text-xs text-[#A0B5A8]/70 text-center leading-relaxed">
        🔒 Your data is secured by extended validation SSL certificates (256-bit encryption).
        This complies with the strongest payment security standard available today.
      </p>
    </form>
  );
}
