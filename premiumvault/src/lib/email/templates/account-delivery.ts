type DeliveredAccount = {
  productTitle: string;
  username: string;
  password: string;
};

type AccountDeliveryData = {
  orderNumber: string;
  customerEmail: string;
  accounts: DeliveredAccount[];
  supportEmail: string;
};

export function accountDeliveryTemplate(data: AccountDeliveryData): string {
  const accountRows = data.accounts
    .map(
      (acc, i) => `
      <div style="background: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 12px;">
        <p style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 10px 0;">
          ${acc.productTitle}${data.accounts.filter(a => a.productTitle === acc.productTitle).length > 1 ? ` &mdash; Account ${data.accounts.filter((a, idx) => a.productTitle === acc.productTitle && idx <= i).length}` : ""}
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #71717a; font-size: 13px; padding: 4px 0; width: 100px;">Email / Username</td>
            <td style="color: #ffffff; font-size: 13px; font-family: 'Courier New', monospace; padding: 4px 0; font-weight: 600;">${acc.username}</td>
          </tr>
          <tr>
            <td style="color: #71717a; font-size: 13px; padding: 4px 0;">Password</td>
            <td style="color: #ffffff; font-size: 13px; font-family: 'Courier New', monospace; padding: 4px 0; font-weight: 600;">${acc.password}</td>
          </tr>
        </table>
      </div>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="background: #09090b; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 560px; margin: 0 auto;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">PremiumVault</h1>
      <p style="color: #71717a; font-size: 14px; margin-top: 8px;">Account Upgrade Services</p>
    </div>

    <!-- Card -->
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px;">
      <div style="font-size: 40px; text-align: center; margin-bottom: 16px;">&#x1F511;</div>
      <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 4px; text-align: center;">
        Your Account Details
      </h2>
      <p style="color: #71717a; font-size: 14px; margin-top: 0; margin-bottom: 24px; text-align: center;">
        Order <strong style="color: #a1a1aa;">${data.orderNumber}</strong>
      </p>

      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Your purchase is complete. Below are the account credentials for the service(s) you purchased.
      </p>

      ${accountRows}

      <!-- Warning -->
      <div style="background: #1c1917; border: 1px solid #78350f; border-radius: 10px; padding: 16px; margin-top: 20px;">
        <p style="color: #fbbf24; font-size: 13px; font-weight: 600; margin: 0 0 6px 0;">
          &#x26A0;&#xFE0F; Keep these credentials safe
        </p>
        <p style="color: #92400e; font-size: 12px; line-height: 1.6; margin: 0;">
          Do not share these details with anyone. Log in and change the password as soon as possible.
          If you have any issues accessing the account, contact our support team.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <p style="text-align: center; color: #52525b; font-size: 12px; margin-top: 24px;">
      Questions or issues? Contact us at
      <a href="mailto:${data.supportEmail}" style="color: #71717a;">${data.supportEmail}</a>
    </p>
    <p style="text-align: center; color: #3f3f46; font-size: 11px; margin-top: 8px;">
      Thank you for choosing PremiumVault.
    </p>
  </div>
</body>
</html>
  `;
}
