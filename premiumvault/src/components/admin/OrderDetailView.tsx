"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { ServiceIcon } from "@/components/store/ServiceIcon";
import api from "@/lib/api";
import { toast } from "sonner";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["CREDENTIALS_SUBMITTED", "CANCELLED"],
  CREDENTIALS_SUBMITTED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Mark as Pending",
  PAID: "Mark as Paid",
  CREDENTIALS_SUBMITTED: "Mark as Credentials Submitted",
  COMPLETED: "Mark as Completed",
  CANCELLED: "Cancel Order",
};

type Props = {
  order: any;
  deliveredStock?: any[];
};

export function OrderDetailView({ order: initialOrder, deliveredStock = [] }: Props) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [fulfillCredentials, setFulfillCredentials] = useState<Record<string, { username: string; password: string }[]>>({});
  const [fulfilling, setFulfilling] = useState(false);
  const router = useRouter();

  const hasDropshipItems = order.items?.some((i: any) => i.product?.productType === "DROPSHIP");
  const isAwaitingFulfillment = hasDropshipItems && order.status === "PAID";

  const transitions = isAwaitingFulfillment
    ? { ...VALID_TRANSITIONS, PAID: ["CANCELLED"] }
    : VALID_TRANSITIONS;

  useEffect(() => {
    if (!hasDropshipItems) return;
    const init: Record<string, { username: string; password: string }[]> = {};
    order.items?.forEach((item: any) => {
      if (item.product?.productType === "DROPSHIP") {
        init[item.id] = Array.from({ length: item.quantity }, () => ({ username: "", password: "" }));
      }
    });
    setFulfillCredentials(init);
  }, [order.id]);

  async function handleFulfill() {
    const credentials = [];
    for (const [orderItemId, rows] of Object.entries(fulfillCredentials)) {
      for (const row of rows) {
        if (!row.username.trim() || !row.password.trim()) {
          toast.error("Please fill in all credentials before fulfilling");
          return;
        }
        credentials.push({ orderItemId, username: row.username.trim(), password: row.password.trim() });
      }
    }

    setFulfilling(true);
    try {
      await api.post(`/api/admin/orders/${order.id}/fulfill`, { credentials });
      toast.success("Order fulfilled — credentials sent to customer");
      setOrder((prev: any) => ({ ...prev, status: "COMPLETED" }));
      router.refresh();
    } catch {
      toast.error("Failed to fulfill order");
    } finally {
      setFulfilling(false);
    }
  }

  async function handleConfirmPayment() {
    setConfirmingPayment(true);
    try {
      await api.post(`/api/admin/orders/${order.id}/confirm-payment`);
      setOrder((prev: any) => ({ ...prev, status: "PAID" }));
      toast.success("Payment confirmed — order is now processing");
      router.refresh();
    } catch {
      toast.error("Failed to confirm payment");
    } finally {
      setConfirmingPayment(false);
    }
  }

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
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white font-mono">{order.orderNumber}</h2>
            <div className="mt-2 space-y-1 text-sm text-gray-400">
              <p>
                <span className="text-gray-400/70">Customer:</span>{" "}
                <span className="text-gray-400">{order.customerEmail}</span>
              </p>
              <p>
                <span className="text-gray-400/70">Total:</span>{" "}
                <span className="text-gray-400">£{Number(order.totalAmount).toFixed(2)}</span>
              </p>
              <p>
                <span className="text-gray-400/70">Payment:</span>{" "}
                <span className="text-gray-400">
                  {order.paymentMethod === "STRIPE" ? "Stripe" : "PayPal F&F"}
                </span>
              </p>
              <p>
                <span className="text-gray-400/70">Date:</span>{" "}
                <span className="text-gray-400">
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
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-4">Order Items &amp; Credentials</h3>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="border border-white/[0.1] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <ServiceIcon
                  serviceType={item.product?.serviceType ?? "default"}
                  logoUrl={item.product?.logoUrl}
                  size="sm"
                />
                <div>
                  <p className="font-medium text-white text-sm">
                    {item.product?.title ?? "Unknown Product"}
                    <span className="text-gray-400/70 font-normal ml-1">(×{item.quantity})</span>
                  </p>
                  <p className="text-xs text-gray-400/70">
                    £{Number(item.priceAtPurchase).toFixed(2)} each
                  </p>
                </div>
              </div>

              {item.credentials?.length > 0 ? (
                <div className="divide-y divide-white/[0.06] mt-2 rounded-lg border border-white/[0.08] overflow-hidden">
                  {item.credentials.map((cred: any, idx: number) => (
                    <div key={cred.id} className="px-3 py-2.5 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-gray-500 uppercase tracking-wider text-[10px]">Account {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            cred.status === "UPGRADED" ? "bg-green-500/15 text-green-400" :
                            cred.status === "SUBMITTED" ? "bg-blue-500/15 text-blue-400" :
                            "bg-white/[0.06] text-gray-500"
                          }`}>{cred.status}</span>
                          {cred.submittedAt && (
                            <span className="text-gray-600">{format(new Date(cred.submittedAt), "dd MMM HH:mm")}</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div>
                          <p className="text-gray-600 text-[10px] mb-0.5">Email / Username</p>
                          <p className="text-white font-mono select-all">{cred.username}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-[10px] mb-0.5">Password</p>
                          <p className="text-white font-mono select-all">{cred.password}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400/50 pl-2 italic mt-2">No credentials submitted yet.</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Delivered Accounts (PURCHASE type items) */}
      {deliveredStock.length > 0 && (
        <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Delivered Accounts</h3>
          <p className="text-xs text-gray-500 mb-4">
            These credentials were sent to the customer automatically after payment.
          </p>
          <div className="space-y-2">
            {deliveredStock.map((stock: any) => (
              <div
                key={stock.id}
                className="flex items-center gap-4 border border-white/[0.08] rounded-xl px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">{stock.product?.title}</p>
                  <p className="text-sm text-white font-mono">{stock.username}</p>
                  <p className="text-xs text-gray-600">Password on file (delivered via email)</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                    Delivered
                  </span>
                  {stock.usedAt && (
                    <p className="text-xs text-gray-600 mt-1">
                      {format(new Date(stock.usedAt), "dd MMM HH:mm")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PayPal F&F Confirm Payment */}
      {order.paymentMethod === "PAYPAL" && order.status === "PENDING" && (
        <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-2">Confirm PayPal F&amp;F Payment</h3>
          <p className="text-sm text-gray-400 mb-4">
            Verify that you received <span className="text-white font-medium">£{Number(order.totalAmount).toFixed(2)}</span> from{" "}
            <span className="text-white font-medium">{order.customerEmail}</span> via PayPal Friends &amp; Family, then confirm below.
          </p>
          <Button
            onClick={handleConfirmPayment}
            disabled={confirmingPayment}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {confirmingPayment ? "Confirming..." : "Confirm Payment Received"}
          </Button>
        </div>
      )}

      {/* Fulfill Dropship Order */}
      {isAwaitingFulfillment && (
        <div className="bg-orange-500/[0.06] border border-orange-500/20 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Fulfill Dropship Order</h3>
          <p className="text-sm text-gray-400 mb-4">
            Input the account credentials for each item and click Fulfill. The customer will receive them by email immediately.
          </p>
          <div className="space-y-4">
            {order.items?.filter((i: any) => i.product?.productType === "DROPSHIP").map((item: any) => (
              <div key={item.id} className="border border-white/[0.08] rounded-xl p-4">
                <p className="text-sm font-medium text-white mb-3">
                  {item.product?.title}
                  <span className="text-gray-500 font-normal ml-1">(×{item.quantity})</span>
                </p>
                <div className="space-y-3">
                  {(fulfillCredentials[item.id] ?? []).map((cred, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3">
                      {item.quantity > 1 && (
                        <p className="col-span-2 text-xs text-gray-500">Account {idx + 1}</p>
                      )}
                      <input
                        type="text"
                        placeholder="Email / Username"
                        value={cred.username}
                        onChange={(e) => setFulfillCredentials((prev) => {
                          const rows = [...(prev[item.id] ?? [])];
                          rows[idx] = { ...rows[idx], username: e.target.value };
                          return { ...prev, [item.id]: rows };
                        })}
                        className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-orange-400/50 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Password"
                        value={cred.password}
                        onChange={(e) => setFulfillCredentials((prev) => {
                          const rows = [...(prev[item.id] ?? [])];
                          rows[idx] = { ...rows[idx], password: e.target.value };
                          return { ...prev, [item.id]: rows };
                        })}
                        className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-orange-400/50 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={handleFulfill}
            disabled={fulfilling}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {fulfilling ? "Fulfilling..." : "Fulfill Order & Send to Customer"}
          </Button>
        </div>
      )}

      {/* Status Actions */}
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-4">Change Status</h3>
        {transitions[order.status]?.length > 0 ? (
          <div className="flex items-center gap-3 flex-wrap">
            {transitions[order.status].map((nextStatus: string) => {
              const isCancelling = nextStatus === "CANCELLED";
              if (isCancelling && confirmCancel) {
                return (
                  <div key={nextStatus} className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-2">
                    <span className="text-red-300 text-sm font-medium">Cancel this order?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusChange("CANCELLED")}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Yes, cancel"}
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
                );
              }
              return (
                <Button
                  key={nextStatus}
                  variant={isCancelling ? "destructive" : "default"}
                  onClick={() => isCancelling ? setConfirmCancel(true) : handleStatusChange(nextStatus)}
                  disabled={loading}
                >
                  {loading ? "Updating..." : STATUS_LABELS[nextStatus] ?? nextStatus}
                </Button>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">This order is <span className="text-white font-medium">{order.status.toLowerCase().replace(/_/g, " ")}</span> — no further status changes available.</p>
        )}
      </div>
    </div>
  );
}
