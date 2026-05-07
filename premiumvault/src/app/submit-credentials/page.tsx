"use client";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { ServiceIcon } from "@/components/store/ServiceIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CredentialSuccess } from "@/components/credentials/CredentialSuccess";

type OrderItem = {
  id: string;
  quantity: number;
  product: { id: string; title: string; serviceType: string; logoUrl: string | null };
};

type CredField = { username: string; password: string };
type CredsMap = Record<string, CredField>;

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "";

export default function SubmitCredentialsPage() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [stage, setStage] = useState<"enter" | "filling" | "success">("enter");
  const [lookingUp, setLookingUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [token, setToken] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [creds, setCreds] = useState<CredsMap>({});

  const expandedKeys = useMemo(
    () => items.flatMap((item) => Array.from({ length: item.quantity }, (_, i) => `${item.id}-${i}`)),
    [items]
  );

  const allFilled =
    expandedKeys.length > 0 &&
    expandedKeys.every((k) => {
      const c = creds[k];
      return c?.username?.trim() && c?.password?.trim();
    });

  async function handleLookup() {
    const input = orderIdInput.trim();
    if (!input) return;
    setLookingUp(true);
    try {
      const res = await api.get(`/api/credentials/${encodeURIComponent(input)}`);
      const { orderNumber: num, items: orderItems } = res.data;
      setToken(input);
      setOrderNumber(num);
      setItems(orderItems);
      const init: CredsMap = {};
      orderItems.forEach((item: OrderItem) => {
        for (let i = 0; i < item.quantity; i++) {
          init[`${item.id}-${i}`] = { username: "", password: "" };
        }
      });
      setCreds(init);
      setStage("filling");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Invalid or expired Order ID.");
    } finally {
      setLookingUp(false);
    }
  }

  function updateCred(key: string, field: "username" | "password", value: string) {
    setCreds((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  async function handleSubmit() {
    if (!allFilled || submitting) return;
    setSubmitting(true);
    try {
      const credentials = items.flatMap((item) =>
        Array.from({ length: item.quantity }, (_, i) => ({
          orderItemId: item.id,
          serviceType: item.product.serviceType,
          username: creds[`${item.id}-${i}`].username.trim(),
          password: creds[`${item.id}-${i}`].password,
        }))
      );
      await api.post("/api/credentials", { token, credentials });
      setStage("success");
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (stage === "success") {
    return <CredentialSuccess orderNumber={orderNumber} />;
  }

  return (
    <>
      {/* Base page */}
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">PremiumVault</h1>
            <p className="text-zinc-400 text-sm">Account Upgrade Portal</p>
          </div>

          <div className="bg-[#18181b] border border-white/[0.1] rounded-2xl p-8 space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Submit Your Credentials</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Enter the Order ID from your confirmation email to access the credential form.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-id" className="text-gray-400">Order ID</Label>
              <Input
                id="order-id"
                placeholder="Paste your Order ID here..."
                className="bg-[#0e0c1a] border-white/[0.1] font-mono text-sm"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !lookingUp && handleLookup()}
              />
            </div>
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              onClick={handleLookup}
              disabled={lookingUp || !orderIdInput.trim()}
            >
              {lookingUp ? "Looking up order..." : "Access My Order →"}
            </Button>
          </div>
        </div>
      </div>

      {/* Credential modal overlay */}
      {stage === "filling" && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="bg-[#09090b] border border-white/[0.1] rounded-2xl w-full max-w-lg shadow-2xl">

            {/* Modal header */}
            <div className="p-6 border-b border-white/[0.08]">
              <p className="text-xs text-zinc-500 font-mono mb-1">Order {orderNumber}</p>
              <h2 className="text-xl font-bold text-white">Submit Account Credentials</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Fill in every account you want upgraded. All fields are required.
              </p>
            </div>

            <div className="p-6 space-y-5">

              {/* Product groups */}
              {items.map((item) => (
                <div key={item.id} className="border border-white/[0.1] rounded-xl overflow-hidden">

                  {/* Product header */}
                  <div className="bg-white/[0.03] px-4 py-3 flex items-center gap-3">
                    <ServiceIcon
                      serviceType={item.product.serviceType}
                      logoUrl={item.product.logoUrl}
                      size="sm"
                    />
                    <span className="font-semibold text-white text-sm flex-1">
                      {item.product.title}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-xs text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-full">
                        ×{item.quantity} accounts
                      </span>
                    )}
                  </div>

                  {/* Account slots */}
                  <div className="divide-y divide-white/[0.06]">
                    {Array.from({ length: item.quantity }, (_, i) => {
                      const key = `${item.id}-${i}`;
                      return (
                        <div key={i} className="p-4 space-y-3">
                          {item.quantity > 1 && (
                            <p className="text-xs font-semibold text-indigo-400/70 uppercase tracking-widest">
                              Account {i + 1}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-zinc-400">Email / Username</Label>
                              <Input
                                placeholder="your@email.com"
                                className="bg-[#0e0c1a] border-white/[0.1] h-9 text-sm"
                                value={creds[key]?.username ?? ""}
                                onChange={(e) => updateCred(key, "username", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-zinc-400">Password</Label>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-[#0e0c1a] border-white/[0.1] h-9 text-sm"
                                value={creds[key]?.password ?? ""}
                                onChange={(e) => updateCred(key, "password", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Disclaimer */}
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <p className="text-amber-400 font-bold text-sm">⚠️ Important — Read Before Submitting</p>
                <p className="text-amber-200/70 text-xs leading-relaxed">
                  Make absolutely sure all credentials are correct. Once submitted,{" "}
                  <strong className="text-amber-200">this cannot be undone</strong> and your Order ID will no
                  longer be valid.
                </p>
                {SUPPORT_EMAIL && (
                  <p className="text-amber-200/60 text-xs">
                    Need help? Contact us at{" "}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!allFilled || submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : allFilled ? "Submit Credentials →" : "Fill all fields to continue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
