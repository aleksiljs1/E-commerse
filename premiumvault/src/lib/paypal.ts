const PAYPAL_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token as string;
}

export async function createPayPalOrder(amountGBP: number): Promise<{ id: string; approveUrl: string }> {
  const accessToken = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "GBP", value: amountGBP.toFixed(2) }, description: "PremiumVault Account Upgrade" }],
      application_context: {
        brand_name: "PremiumVault",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/paypal?action=capture`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
      },
    }),
  });
  const data = await res.json();
  const approveUrl = data.links?.find((l: { rel: string; href: string }) => l.rel === "approve")?.href ?? "";
  return { id: data.id, approveUrl };
}

export async function capturePayPalOrder(orderId: string): Promise<{ status: string; captureId: string }> {
  const accessToken = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? "";
  return { status: data.status, captureId };
}
