import { formatPrice } from "@shared/const";

const BRAND_RED = "#B91C1C";
const BRAND_BG = "#FDF2F2";

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F7F7F7;font-family:'Helvetica Neue',Arial,sans-serif;color:#333;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F7;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <!-- Header -->
  <tr><td style="background:${BRAND_RED};padding:24px 32px;text-align:center;">
    <span style="font-size:24px;font-weight:700;color:#FFFFFF;letter-spacing:2px;">KEMZOBO</span>
    <br><span style="font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:1px;">THE ORIGINAL ZOBO DRINK</span>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:24px 32px;border-top:1px solid #EEEEEE;text-align:center;">
    <p style="margin:0;font-size:12px;color:#999;">KEMZOBO — BOLD hibiscus. Timeless tradition. Ready to drink.</p>
    <p style="margin:8px 0 0;font-size:11px;color:#BBB;">kemzobo.com</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function orderConfirmationEmail(order: {
  orderNumber: string;
  total: number;
  items: Array<{ productName: string; variantName: string; quantity: number; unitPrice: number }>;
  shippingAddress?: { name: string; street: string; city: string; state: string; zip: string } | null;
}): { subject: string; html: string } {
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #F5F5F5;font-size:14px;">${item.productName} <span style="color:#999;">(${item.variantName})</span></td>
      <td style="padding:8px 0;border-bottom:1px solid #F5F5F5;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #F5F5F5;font-size:14px;text-align:right;">$${formatPrice(item.unitPrice * item.quantity)}</td>
    </tr>
  `).join("");

  const addressHtml = order.shippingAddress ? `
    <div style="background:${BRAND_BG};border-radius:8px;padding:16px;margin-top:24px;">
      <p style="margin:0 0 4px;font-size:12px;color:${BRAND_RED};font-weight:600;text-transform:uppercase;letter-spacing:1px;">Shipping To</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.5;">
        ${order.shippingAddress.name}<br>
        ${order.shippingAddress.street}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}
      </p>
    </div>
  ` : "";

  return {
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: layout(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;border-radius:50%;background:#E8F5E9;display:inline-flex;align-items:center;justify-content:center;font-size:28px;">✓</div>
        <h1 style="margin:16px 0 4px;font-size:24px;color:#111;font-weight:700;">Order Confirmed!</h1>
        <p style="margin:0;font-size:14px;color:#777;">Thank you for your order.</p>
      </div>

      <div style="background:${BRAND_BG};border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:12px;color:${BRAND_RED};font-weight:600;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:#111;">${order.orderNumber}</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr style="border-bottom:2px solid #EEE;">
          <th style="padding:8px 0;font-size:12px;color:#999;text-align:left;text-transform:uppercase;letter-spacing:1px;">Item</th>
          <th style="padding:8px 0;font-size:12px;color:#999;text-align:center;text-transform:uppercase;letter-spacing:1px;">Qty</th>
          <th style="padding:8px 0;font-size:12px;color:#999;text-align:right;text-transform:uppercase;letter-spacing:1px;">Amount</th>
        </tr>
        ${itemRows}
      </table>

      <div style="text-align:right;padding-top:8px;border-top:2px solid #EEE;">
        <span style="font-size:12px;color:#999;">Total</span>
        <span style="font-size:20px;font-weight:700;color:#111;margin-left:12px;">$${formatPrice(order.total)}</span>
      </div>

      ${addressHtml}

      <div style="text-align:center;margin-top:32px;">
        <a href="https://kemzobo.com/my-account" style="display:inline-block;background:${BRAND_RED};color:#FFF;padding:12px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">View My Orders</a>
      </div>

      <p style="margin:24px 0 0;font-size:13px;color:#999;text-align:center;">
        We'll notify you when your order ships.
      </p>
    `),
  };
}

export function passwordResetEmail(resetLink: string): { subject: string; html: string } {
  return {
    subject: "Reset Your Password — KEMZOBO",
    html: layout(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;border-radius:50%;background:${BRAND_BG};display:inline-flex;align-items:center;justify-content:center;font-size:28px;">🔒</div>
        <h1 style="margin:16px 0 4px;font-size:24px;color:#111;font-weight:700;">Reset Your Password</h1>
        <p style="margin:0;font-size:14px;color:#777;">You requested a password reset for your KEMZOBO account.</p>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${resetLink}" style="display:inline-block;background:${BRAND_RED};color:#FFF;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:600;font-size:16px;">Reset Password</a>
      </div>

      <p style="font-size:13px;color:#999;text-align:center;line-height:1.6;">
        This link expires in 1 hour.<br>
        If you didn't request this, you can safely ignore this email.
      </p>
    `),
  };
}

export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to KEMZOBO!",
    html: layout(`
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="margin:0 0 4px;font-size:24px;color:#111;font-weight:700;">Welcome, ${name || "there"}!</h1>
        <p style="margin:0;font-size:14px;color:#777;">Your KEMZOBO account is ready.</p>
      </div>

      <p style="font-size:15px;color:#555;line-height:1.7;">
        Thanks for joining KEMZOBO. You can now order online, track your deliveries,
        and be the first to know about new drops and special offers.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="https://kemzobo.com/products" style="display:inline-block;background:${BRAND_RED};color:#FFF;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:600;font-size:16px;">Shop Now</a>
      </div>

      <p style="font-size:13px;color:#999;text-align:center;">
        BOLD hibiscus. Timeless tradition. Ready to drink.
      </p>
    `),
  };
}
