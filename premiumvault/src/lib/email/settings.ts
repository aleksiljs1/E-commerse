import { prisma } from "@/lib/db";

export type SmtpSettings = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export type EmailTemplateSettings = {
  purchaseSubject: string;
  purchaseHeading: string;
  purchaseBody: string;
  purchaseCtaText: string;
  purchaseFooter: string;
  credentialSubject: string;
  credentialHeading: string;
  credentialBody: string;
  credentialFooter: string;
};

export type EmailSettings = SmtpSettings & EmailTemplateSettings;

const DEFAULTS: EmailSettings = {
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER ?? "",
  pass: process.env.SMTP_PASS ?? "",
  from: process.env.EMAIL_FROM ?? "",
  purchaseSubject: "PremiumVault — Order {orderNumber} Confirmed",
  purchaseHeading: "Payment Confirmed ✅",
  purchaseBody: "To complete your upgrade, please submit your account credentials using the secure link below. This link expires in 7 days.",
  purchaseCtaText: "Submit My Credentials →",
  purchaseFooter: "Your account will be upgraded within 4–5 business days after credential submission.\nQuestions? Contact our support team.",
  credentialSubject: "PremiumVault — Credentials Received ✅",
  credentialHeading: "Credentials Received!",
  credentialBody: "Congratulations! We've received your account credentials for order {orderNumber}.",
  credentialFooter: "Thank you for choosing PremiumVault.",
};

const KEY_MAP: Record<string, keyof EmailSettings> = {
  smtp_host: "host",
  smtp_port: "port",
  smtp_secure: "secure",
  smtp_user: "user",
  smtp_pass: "pass",
  email_from: "from",
  email_purchase_subject: "purchaseSubject",
  email_purchase_heading: "purchaseHeading",
  email_purchase_body: "purchaseBody",
  email_purchase_cta_text: "purchaseCtaText",
  email_purchase_footer: "purchaseFooter",
  email_credential_subject: "credentialSubject",
  email_credential_heading: "credentialHeading",
  email_credential_body: "credentialBody",
  email_credential_footer: "credentialFooter",
};

export async function getEmailSettings(): Promise<EmailSettings> {
  const keys = Object.keys(KEY_MAP);
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));

  const settings = { ...DEFAULTS };
  for (const [dbKey, field] of Object.entries(KEY_MAP)) {
    const val = map.get(dbKey);
    if (val !== undefined && val !== "") {
      if (field === "port") {
        (settings as any)[field] = Number(val);
      } else if (field === "secure") {
        (settings as any)[field] = val === "true";
      } else {
        (settings as any)[field] = val;
      }
    }
  }
  return settings;
}
