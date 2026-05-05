"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { ServiceIcon } from "@/components/store/ServiceIcon";
import api from "@/lib/api";
import { toast } from "sonner";

type Props = {
  order: any;
};

export function OrderDetailView({ order: initialOrder }: Props) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const router = useRouter();

  async function handleStatusChange(status: string) {
    setLoading(true);
    try {
      await api.patch(`/api/admin/orders/${order.id}/status`, { status });
      setOrder((prev: any) => ({ ...prev, status }));
      toast.success(`Order marked as ${status.toLowerCase().replace(/_/g, " ")}`);
      setConfirmCancel(false);
      router.refresh();
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-[#16221B] border border-[#1F8A5B]/30 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#E8F5EE] font-mono">{order.orderNumber}</h2>
            <div className="mt-2 space-y-1 text-sm text-[#A0B5A8]">
              <p>
                <span className="text-[#A0B5A8]/70">Customer:</span>{" "}
                <span className="text-[#A0B5A8]">{order.customerEmail}</span>
              </p>
              <p>
                <span className="text-[#A0B5A8]/70">Total:</span>{" "}
                <span className="text-[#A0B5A8]">£{Number(order.totalAmount).toFixed(2)}</span>
              </p>
              <p>
                <span className="text-[#A0B5A8]/70">Payment:</span>{" "}
                <span className="text-[#A0B5A8]">
                  {order.paymentMethod === "STRIPE" ? "Stripe" : "PayPal F&F"}
                </span>
              </p>
              <p>
                <span className="text-[#A0B5A8]/70">Date:</span>{" "}
                <span className="text-[#A0B5A8]">
                  {order.createdAt
                    ? format(new Date(order.createdAt), "dd MMM yyyy HH:mm")
                    : "—"}
                </span>
              </p>
            </div>
          </div>
          <div>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {/* Order Items + Credentials */}
      <div className="bg-[#16221B] border border-[#1F8A5B]/30 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-[#E8F5EE] mb-4">Order Items &amp; Credentials</h3>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="border border-[#1F8A5B]/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <ServiceIcon
                  serviceType={item.product?.serviceType ?? "default"}
                  logoUrl={item.product?.logoUrl}
                  size="sm"
                />
                <div>
                  <p className="font-medium text-[#E8F5EE] text-sm">
                    {item.product?.title ?? "Unknown Product"}
                    <span className="text-[#A0B5A8]/70 font-normal ml-1">(×{item.quantity})</span>
                  </p>
                  <p className="text-xs text-[#A0B5A8]/70">
                    £{Number(item.priceAtPurchase).toFixed(2)} each
                  </p>
                </div>
              </div>

              {item.credentials?.length > 0 ? (
                <div className="space-y-2 pl-2 border-l-2 border-[#1F8A5B]/30">
                  {item.credentials.map((cred: any, idx: number) => (
                    <div key={cred.id} className="text-xs text-[#A0B5A8]">
                      <span className="text-[#A0B5A8]/70">Credential #{idx + 1}:</span>{" "}
                      <span className="text-[#A0B5A8]">username: {cred.username}</span>
                      {" | "}
                      <span>
                        Status:{" "}
                        <span className="text-[#E8F5EE] font-medium">{cred.status}</span>
                      </span>
                      {cred.submittedAt && (
                        <>
                          {" | "}
                          <span>
                            Submitted:{" "}
                            {format(new Date(cred.submittedAt), "dd MMM HH:mm")}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#A0B5A8]/50 pl-2 italic">No credentials submitted yet.</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {order.status === "CREDENTIALS_SUBMITTED" && (
          <Button
            onClick={() => handleStatusChange("COMPLETED")}
            disabled={loading}
          >
            Mark as Completed
          </Button>
        )}
        {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
          confirmCancel ? (
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-2">
              <span className="text-red-300 text-sm font-medium">Cancel this order?</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleStatusChange("CANCELLED")}
                disabled={loading}
              >
                {loading ? "Cancelling..." : "Yes, cancel"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmCancel(false)}
                disabled={loading}
                className="border-red-800/50 text-red-300 hover:bg-red-900/30"
              >
                Keep order
              </Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setConfirmCancel(true)}
              disabled={loading}
            >
              Cancel Order
            </Button>
          )
        )}
      </div>
    </div>
  );
}
