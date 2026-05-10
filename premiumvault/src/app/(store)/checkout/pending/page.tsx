"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { Copy, Check } from "lucide-react";

type OrderInfo = {
  orderNumber: string;
  totalAmount: number;
  customerEmail: string;
};

function PendingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const clearCart = useCartStore((s) => s.clearCart);

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalMeUsername, setPaypalMeUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (!orderId) return;

    Promise.all([
      fetch(`/api/orders/${orderId}`).then((r) => {
        if (!r.ok) throw new Error("Order not found");
        return r.json();
      }),
      fetch("/api/settings/paypal-email").then((r) => r.json()),
    ])
      .then(([orderData, settingsData]) => {
        setOrder(orderData);
        setPaypalEmail(settingsData.email ?? "");
        setPaypalMeUsername(settingsData.paypalMeUsername ?? "");
      })
      .catch(() => setError("Failed to load order details. Please check your order link."))
      .finally(() => setLoading(false));
  }, [orderId]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Order Not Found</h1>
          <Link href="/" className="text-orange-400 hover:underline text-sm">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
          <p className="text-gray-400 text-sm">{error}</p>
          <Link href="/" className="inline-block text-orange-400 hover:underline text-sm">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const amount = order ? `£${Number(order.totalAmount).toFixed(2)}` : "";
  const amountRaw = order ? Number(order.totalAmount).toFixed(2) : "";
  const paypalMeLink = paypalMeUsername && amountRaw
    ? `https://paypal.me/${paypalMeUsername}/${amountRaw}GBP`
    : "";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl">💸</div>
          <h1 className="text-2xl font-bold text-white">Complete Your Payment</h1>
          <p className="text-gray-400 text-sm">
            Send the exact amount below via PayPal Friends &amp; Family to complete your order.
          </p>
        </div>

        {/* Pay Now Button */}
        {paypalMeLink && (
          <a
            href={paypalMeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold py-4 rounded-2xl transition-colors text-lg"
          >
            Pay {amount} with PayPal
          </a>
        )}

        <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6 space-y-5">
          {/* PayPal Email */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Send payment to</p>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-lg flex-1 break-all">
                {paypalEmail || "Not configured"}
              </span>
              {paypalEmail && (
                <button
                  onClick={() => copyToClipboard(paypalEmail, "email")}
                  className="cursor-pointer shrink-0 p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
                  title="Copy email"
                >
                  {copiedField === "email" ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Exact amount</p>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-2xl">{amount}</span>
              {amount && (
                <button
                  onClick={() => copyToClipboard(amountRaw, "amount")}
                  className="cursor-pointer shrink-0 p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
                  title="Copy amount"
                >
                  {copiedField === "amount" ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Number */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Order number</p>
            <span className="text-gray-300 font-mono text-sm">{order?.orderNumber ?? ""}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-orange-400/[0.06] border border-orange-400/20 rounded-2xl p-5 space-y-3">
          <h3 className="text-orange-400 font-semibold text-sm">Important — Select &quot;Friends &amp; Family&quot;</h3>
          <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
            <li>Click the <span className="text-white font-medium">&quot;Pay with PayPal&quot;</span> button above</li>
            <li>On PayPal&apos;s page, select <span className="text-white font-medium">&quot;Sending to a friend&quot;</span></li>
            <li>Confirm the amount is exactly <span className="text-white font-medium">{amount}</span></li>
            <li><span className="text-orange-400 font-medium">Do NOT add a note</span> to the payment</li>
            <li>Your order will be processed once we confirm the payment</li>
          </ol>
        </div>

        {/* Confirmation email notice */}
        <p className="text-center text-gray-500 text-xs">
          A confirmation email will be sent to <span className="text-gray-300">{order?.customerEmail}</span> once your payment is verified.
        </p>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block border border-white/[0.08] text-white hover:bg-white/[0.05] rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <PendingContent />
    </Suspense>
  );
}
