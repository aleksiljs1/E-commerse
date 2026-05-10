"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  FileText,
  Bell,
  Award,
  Wallet,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type Toast = { type: "success" | "error"; message: string };

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const inputCls =
  "w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all";
const textareaCls = inputCls + " min-h-[80px] resize-y";
const labelCls = "block text-sm font-medium text-gray-400 mb-1";
const hintCls = "text-xs text-gray-500 mb-2";

function Field({
  label,
  hint,
  value,
  onChange,
  type = "text",
  placeholder,
  textarea,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {hint && <p className={hintCls}>{hint}</p>}
      {textarea ? (
        <textarea
          className={textareaCls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className={inputCls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  /* Banner */
  const [bannerText, setBannerText] = useState("");

  /* Purchase Confirmation template */
  const [purchaseSubject, setPurchaseSubject] = useState("");
  const [purchaseHeading, setPurchaseHeading] = useState("");
  const [purchaseBody, setPurchaseBody] = useState("");
  const [purchaseCtaText, setPurchaseCtaText] = useState("");
  const [purchaseFooter, setPurchaseFooter] = useState("");

  /* Credential Confirmation template */
  const [credentialSubject, setCredentialSubject] = useState("");
  const [credentialHeading, setCredentialHeading] = useState("");
  const [credentialBody, setCredentialBody] = useState("");
  const [credentialFooter, setCredentialFooter] = useState("");

  /* Support Email (shown to customers on submit-credentials page and delivery emails) */
  const [supportEmail, setSupportEmail] = useState("");

  /* Admin Notification */
  const [adminNotificationEmail, setAdminNotificationEmail] = useState("");

  /* PayPal F&F */
  const [paypalFfEmail, setPaypalFfEmail] = useState("");
  const [paypalMeUsername, setPaypalMeUsername] = useState("");

  /* Discount Tiers */
  const [bronzeOrders, setBronzeOrders] = useState("2");
  const [bronzeDiscount, setBronzeDiscount] = useState("5");
  const [silverOrders, setSilverOrders] = useState("5");
  const [silverDiscount, setSilverDiscount] = useState("10");
  const [goldOrders, setGoldOrders] = useState("10");
  const [goldDiscount, setGoldDiscount] = useState("15");

  /* UI state */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  /* ---- Load settings ---- */
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const map = new Map<string, string>();
        for (const s of data.data ?? []) map.set(s.key, s.value);

        setBannerText(map.get("banner_text") ?? "✨ Must Read Before Purchasing ✨");

        setPurchaseSubject(map.get("email_purchase_subject") ?? "");
        setPurchaseHeading(map.get("email_purchase_heading") ?? "");
        setPurchaseBody(map.get("email_purchase_body") ?? "");
        setPurchaseCtaText(map.get("email_purchase_cta_text") ?? "");
        setPurchaseFooter(map.get("email_purchase_footer") ?? "");

        setCredentialSubject(map.get("email_credential_subject") ?? "");
        setCredentialHeading(map.get("email_credential_heading") ?? "");
        setCredentialBody(map.get("email_credential_body") ?? "");
        setCredentialFooter(map.get("email_credential_footer") ?? "");

        setSupportEmail(map.get("email_support") ?? "");
        setAdminNotificationEmail(map.get("admin_notification_email") ?? "");
        setPaypalFfEmail(map.get("paypal_ff_email") ?? "");
        setPaypalMeUsername(map.get("paypal_me_username") ?? "");

        setBronzeOrders(map.get("tier_bronze_orders") ?? "2");
        setBronzeDiscount(map.get("tier_bronze_discount") ?? "5");
        setSilverOrders(map.get("tier_silver_orders") ?? "5");
        setSilverDiscount(map.get("tier_silver_discount") ?? "10");
        setGoldOrders(map.get("tier_gold_orders") ?? "10");
        setGoldDiscount(map.get("tier_gold_discount") ?? "15");

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ---- Show toast ---- */
  function showToast(type: Toast["type"], message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  /* ---- Save all ---- */
  async function handleSave() {
    setSaving(true);
    try {
      const settings = [
        { key: "banner_text", value: bannerText },
        { key: "email_purchase_subject", value: purchaseSubject },
        { key: "email_purchase_heading", value: purchaseHeading },
        { key: "email_purchase_body", value: purchaseBody },
        { key: "email_purchase_cta_text", value: purchaseCtaText },
        { key: "email_purchase_footer", value: purchaseFooter },
        { key: "email_credential_subject", value: credentialSubject },
        { key: "email_credential_heading", value: credentialHeading },
        { key: "email_credential_body", value: credentialBody },
        { key: "email_credential_footer", value: credentialFooter },
        { key: "email_support", value: supportEmail },
        { key: "admin_notification_email", value: adminNotificationEmail },
        { key: "paypal_ff_email", value: paypalFfEmail },
        { key: "paypal_me_username", value: paypalMeUsername },
        { key: "tier_bronze_orders", value: bronzeOrders },
        { key: "tier_bronze_discount", value: bronzeDiscount },
        { key: "tier_silver_orders", value: silverOrders },
        { key: "tier_silver_discount", value: silverDiscount },
        { key: "tier_gold_orders", value: goldOrders },
        { key: "tier_gold_discount", value: goldDiscount },
      ];

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) showToast("success", "Settings saved successfully!");
      else showToast("error", "Failed to save. Please try again.");
    } catch {
      showToast("error", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* ===== Site Banner ===== */}
      <Section icon={<Settings className="w-5 h-5 text-gray-400" />} title="Site Banner">
        <Field
          label="Banner Text"
          hint="This text appears in the announcement bar at the top of the store."
          value={bannerText}
          onChange={setBannerText}
          placeholder="e.g. ✨ Must Read Before Purchasing ✨"
        />
        <div>
          <label className={labelCls}>Preview</label>
          <div
            className="w-full py-2.5 flex items-center justify-center rounded-xl overflow-hidden"
            style={{
              background:
                "linear-gradient(90deg, #1a0a2e 0%, #2d1b4e 15%, #4a1942 30%, #6b2140 45%, #8b4513 55%, #b8860b 65%, #4a6741 80%, #2d4a7a 90%, #1a0a2e 100%)",
            }}
          >
            <span className="text-white font-medium text-sm tracking-wide">
              {bannerText || "(empty)"}
            </span>
          </div>
        </div>
      </Section>

      {/* ===== Admin Notifications ===== */}
      <Section icon={<Bell className="w-5 h-5 text-gray-400" />} title="Admin Notifications">
        <p className={hintCls}>
          Receive an email every time a customer makes a purchase or submits credentials for an upgrade.
          Leave blank to disable notifications.
        </p>
        <Field
          label="Notification Email"
          hint="The email address where you want to receive order notifications."
          value={adminNotificationEmail}
          onChange={setAdminNotificationEmail}
          placeholder="admin@example.com"
          type="email"
        />
        <Field
          label="Support Email"
          hint="Shown to customers in delivery emails and the credential submission page."
          value={supportEmail}
          onChange={setSupportEmail}
          placeholder="support@example.com"
          type="email"
        />
      </Section>

      {/* ===== PayPal F&F ===== */}
      <Section icon={<Wallet className="w-5 h-5 text-gray-400" />} title="PayPal Friends & Family">
        <p className={hintCls}>
          Customers who select PayPal F&amp;F will be shown this email address and asked to send the exact payment amount manually.
        </p>
        <Field
          label="PayPal Email"
          hint="The PayPal email address where customers should send Friends & Family payments."
          value={paypalFfEmail}
          onChange={setPaypalFfEmail}
          placeholder="your-paypal@email.com"
          type="email"
        />
        <Field
          label="PayPal.me Username"
          hint="Your PayPal.me link username (e.g. 'syedfhahmid' for paypal.me/syedfhahmid). Enables the 'Pay Now' button on the pending page."
          value={paypalMeUsername}
          onChange={setPaypalMeUsername}
          placeholder="syedfhahmid"
        />
      </Section>

      {/* ===== Discount Tiers ===== */}
      <Section icon={<Award className="w-5 h-5 text-gray-400" />} title="Discount Tiers">
        <p className={hintCls}>
          Configure loyalty discount tiers. Customers who reach the required number of completed orders automatically get the discount applied.
        </p>
        <div className="space-y-4">
          {/* Bronze */}
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <span className="text-orange-400 font-semibold text-sm w-16 shrink-0">Bronze</span>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <Field label="Orders Required" value={bronzeOrders} onChange={setBronzeOrders} type="number" placeholder="2" />
              <Field label="Discount %" value={bronzeDiscount} onChange={setBronzeDiscount} type="number" placeholder="5" />
            </div>
          </div>
          {/* Silver */}
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <span className="text-gray-300 font-semibold text-sm w-16 shrink-0">Silver</span>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <Field label="Orders Required" value={silverOrders} onChange={setSilverOrders} type="number" placeholder="5" />
              <Field label="Discount %" value={silverDiscount} onChange={setSilverDiscount} type="number" placeholder="10" />
            </div>
          </div>
          {/* Gold */}
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <span className="text-yellow-400 font-semibold text-sm w-16 shrink-0">Gold</span>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <Field label="Orders Required" value={goldOrders} onChange={setGoldOrders} type="number" placeholder="10" />
              <Field label="Discount %" value={goldDiscount} onChange={setGoldDiscount} type="number" placeholder="15" />
            </div>
          </div>
        </div>
      </Section>

      {/* ===== Purchase Confirmation Email ===== */}
      <Section icon={<FileText className="w-5 h-5 text-gray-400" />} title="Purchase Confirmation Email">
        <p className={hintCls}>
          Sent after a customer completes payment. Use <code className="text-orange-400">{"{orderNumber}"}</code> as a placeholder in the subject.
        </p>
        <Field
          label="Subject"
          value={purchaseSubject}
          onChange={setPurchaseSubject}
          placeholder="PremiumVault — Order {orderNumber} Confirmed"
        />
        <Field
          label="Heading"
          value={purchaseHeading}
          onChange={setPurchaseHeading}
          placeholder="Payment Confirmed ✅"
        />
        <Field
          label="Body Text"
          hint="The paragraph above the CTA button."
          value={purchaseBody}
          onChange={setPurchaseBody}
          placeholder="To complete your upgrade, please submit your account credentials..."
          textarea
        />
        <Field
          label="Button Text"
          value={purchaseCtaText}
          onChange={setPurchaseCtaText}
          placeholder="Submit My Credentials →"
        />
        <Field
          label="Footer"
          hint="Use a new line for line breaks."
          value={purchaseFooter}
          onChange={setPurchaseFooter}
          placeholder="Your account will be upgraded within 4–5 business days..."
          textarea
        />
      </Section>

      {/* ===== Credential Confirmation Email ===== */}
      <Section icon={<FileText className="w-5 h-5 text-gray-400" />} title="Credential Confirmation Email">
        <p className={hintCls}>
          Sent after a customer submits their credentials. Use <code className="text-orange-400">{"{orderNumber}"}</code> as a placeholder in the body.
        </p>
        <Field
          label="Subject"
          value={credentialSubject}
          onChange={setCredentialSubject}
          placeholder="PremiumVault — Credentials Received ✅"
        />
        <Field
          label="Heading"
          value={credentialHeading}
          onChange={setCredentialHeading}
          placeholder="Credentials Received!"
        />
        <Field
          label="Body Text"
          value={credentialBody}
          onChange={setCredentialBody}
          placeholder="Congratulations! We've received your account credentials for order {orderNumber}."
          textarea
        />
        <Field
          label="Footer"
          value={credentialFooter}
          onChange={setCredentialFooter}
          placeholder="Thank you for choosing PremiumVault."
        />
      </Section>

      {/* ===== Save Button ===== */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>

      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                   */
/* ------------------------------------------------------------------ */

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}
