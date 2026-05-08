"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  Mail,
  Send,
  FileText,
  Bell,
  Award,
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

  /* SMTP */
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [emailFrom, setEmailFrom] = useState("");

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

  /* Admin Notification */
  const [adminNotificationEmail, setAdminNotificationEmail] = useState("");

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
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);

  /* ---- Load settings ---- */
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const map = new Map<string, string>();
        for (const s of data.data ?? []) map.set(s.key, s.value);

        setBannerText(map.get("banner_text") ?? "✨ Must Read Before Purchasing ✨");

        setSmtpHost(map.get("smtp_host") ?? "");
        setSmtpPort(map.get("smtp_port") ?? "");
        setSmtpSecure(map.get("smtp_secure") === "true");
        setSmtpUser(map.get("smtp_user") ?? "");
        setSmtpPass(map.get("smtp_pass") ?? "");
        setEmailFrom(map.get("email_from") ?? "");

        setPurchaseSubject(map.get("email_purchase_subject") ?? "");
        setPurchaseHeading(map.get("email_purchase_heading") ?? "");
        setPurchaseBody(map.get("email_purchase_body") ?? "");
        setPurchaseCtaText(map.get("email_purchase_cta_text") ?? "");
        setPurchaseFooter(map.get("email_purchase_footer") ?? "");

        setCredentialSubject(map.get("email_credential_subject") ?? "");
        setCredentialHeading(map.get("email_credential_heading") ?? "");
        setCredentialBody(map.get("email_credential_body") ?? "");
        setCredentialFooter(map.get("email_credential_footer") ?? "");

        setAdminNotificationEmail(map.get("admin_notification_email") ?? "");

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
        { key: "smtp_host", value: smtpHost },
        { key: "smtp_port", value: smtpPort },
        { key: "smtp_secure", value: String(smtpSecure) },
        { key: "smtp_user", value: smtpUser },
        { key: "smtp_pass", value: smtpPass },
        { key: "email_from", value: emailFrom },
        { key: "email_purchase_subject", value: purchaseSubject },
        { key: "email_purchase_heading", value: purchaseHeading },
        { key: "email_purchase_body", value: purchaseBody },
        { key: "email_purchase_cta_text", value: purchaseCtaText },
        { key: "email_purchase_footer", value: purchaseFooter },
        { key: "email_credential_subject", value: credentialSubject },
        { key: "email_credential_heading", value: credentialHeading },
        { key: "email_credential_body", value: credentialBody },
        { key: "email_credential_footer", value: credentialFooter },
        { key: "admin_notification_email", value: adminNotificationEmail },
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

  /* ---- Send test email ---- */
  async function handleTestEmail() {
    if (!testEmail) return showToast("error", "Enter a recipient email address.");
    const host = smtpHost || process.env.NEXT_PUBLIC_SMTP_HOST || "smtp.gmail.com";
    const port = Number(smtpPort) || 587;
    const user = smtpUser;
    const pass = smtpPass;
    const from = emailFrom || smtpUser;
    if (!user || !pass) return showToast("error", "SMTP user and password are required to send a test.");

    setTesting(true);
    try {
      const res = await fetch("/api/admin/email-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail, host, port, secure: smtpSecure, user, pass, from }),
      });
      const data = await res.json();
      if (res.ok) showToast("success", "Test email sent! Check your inbox.");
      else showToast("error", data.error ?? "Test email failed.");
    } catch {
      showToast("error", "Failed to send test email.");
    } finally {
      setTesting(false);
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

      {/* ===== SMTP Configuration ===== */}
      <Section icon={<Mail className="w-5 h-5 text-gray-400" />} title="SMTP Configuration">
        <p className={hintCls}>
          Configure your outgoing email server. Leave blank to use environment variable defaults.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="SMTP Host" value={smtpHost} onChange={setSmtpHost} placeholder="smtp.gmail.com" />
          <Field label="SMTP Port" value={smtpPort} onChange={setSmtpPort} placeholder="587" type="number" />
          <Field label="SMTP User" value={smtpUser} onChange={setSmtpUser} placeholder="you@gmail.com" />
          <Field label="SMTP Password" value={smtpPass} onChange={setSmtpPass} placeholder="App password" type="password" />
          <Field label="From Email" value={emailFrom} onChange={setEmailFrom} placeholder="you@gmail.com" />
          <div className="flex items-center gap-3 pt-6">
            <button
              type="button"
              role="switch"
              aria-checked={smtpSecure}
              onClick={() => setSmtpSecure(!smtpSecure)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                smtpSecure ? "bg-orange-500" : "bg-white/[0.1]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                  smtpSecure ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-gray-400">SSL/TLS (port 465)</span>
          </div>
        </div>

        {/* Test email */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <label className={labelCls}>Send Test Email</label>
          <div className="flex gap-3">
            <input
              type="email"
              className={inputCls}
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="recipient@example.com"
            />
            <button
              onClick={handleTestEmail}
              disabled={testing}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] border border-white/[0.1] text-white text-sm font-semibold rounded-xl hover:bg-white/[0.1] transition-colors disabled:opacity-50 shrink-0"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {testing ? "Sending..." : "Send Test"}
            </button>
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
