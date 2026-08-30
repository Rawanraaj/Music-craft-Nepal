import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// CORS headers for Web API / Client calls
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sender address configuration
// Default to onboarding@resend.dev for testing (Resend free tier requirement before domain verification).
// Switching to a verified custom domain is a 1-line change: update FROM_EMAIL_DEFAULT or set the FROM_EMAIL secret in Supabase.
const FROM_EMAIL_DEFAULT = 'Music Craft Nepal <onboarding@resend.dev>';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || FROM_EMAIL_DEFAULT;

interface OrderItemPayload {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface OrderEmailPayload {
  order_id: string;
  email: string;
  customer_name: string;
  total: number;
  items: OrderItemPayload[];
  address: string;
  payment_method?: string;
  phone?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'RESEND_API_KEY secret is missing. Please set RESEND_API_KEY in Supabase secrets.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const payload: OrderEmailPayload = await req.json();

    const {
      order_id,
      email,
      customer_name,
      total,
      items = [],
      address,
      payment_method = 'Cash on Delivery',
      phone,
    } = payload;

    if (!order_id || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: order_id and email are required.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Build Itemized HTML Table Rows
    const itemRowsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
            <strong style="color: #0f172a;">${escapeHtml(item.name)}</strong>
            ${item.variant ? `<br/><span style="font-size: 12px; color: #0284c7; font-weight: 600;">Variant: ${escapeHtml(item.variant)}</span>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569; text-align: right;">
            Rs. ${Number(item.price).toLocaleString()}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">
            Rs. ${(Number(item.price) * Number(item.quantity)).toLocaleString()}
          </td>
        </tr>
      `
      )
      .join('');

    const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);
    const shipping = total >= subtotal ? Math.max(0, total - subtotal) : 0;

    // Plain Text Version
    const textContent = `
Music Craft Nepal - Order Confirmation
Order ID: ${order_id}

Hello ${customer_name || 'Valued Customer'},
Thank you for shopping with Music Craft Nepal! Your order has been placed successfully.

ORDER DETAILS:
Order ID: ${order_id}
Customer: ${customer_name || 'N/A'}
Email: ${email}
Phone: ${phone || 'N/A'}
Delivery Address: ${address || 'N/A'} (Kathmandu Valley)
Payment Method: ${payment_method}

ITEMIZED PRODUCTS:
${items.map((i) => `- ${i.name}${i.variant ? ` (${i.variant})` : ''} x ${i.quantity}: Rs. ${(i.price * i.quantity).toLocaleString()}`).join('\n')}

Subtotal: Rs. ${subtotal.toLocaleString()}
Delivery Fee: ${shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
Grand Total: Rs. ${total.toLocaleString()}

Need help? Contact support@musiccraftnepal.com or call 01-4123456.
Thank you for supporting Nepalese craftsmanship!
    `.trim();

    // Rich HTML Template
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #${escapeHtml(order_id)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 32px; text-align: left;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Music Craft <span style="color: #0284c7;">NEPAL</span></h1>
                    <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Handcrafted Instruments & Audio Gear</p>
                  </td>
                  <td align="right">
                    <span style="background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: 800; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">ORDER CONFIRMED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Container -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 8px 0;">Thank you for your order, ${escapeHtml(customer_name || 'valued customer')}!</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                We have received your order <strong style="color: #0f172a;">#${escapeHtml(order_id)}</strong>. Our artisan workshop is preparing your instruments for delivery.
              </p>

              <!-- Order Metadata Box -->
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; padding: 16px;">
                <tr>
                  <td width="50%" style="vertical-align: top; font-size: 13px; line-height: 1.5; color: #475569;">
                    <strong style="color: #0f172a; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Delivery Address</strong>
                    <span style="color: #0f172a; font-weight: 700;">${escapeHtml(customer_name)}</span><br/>
                    ${escapeHtml(address)}<br/>
                    ${phone ? `Phone: ${escapeHtml(phone)}<br/>` : ''}
                    <span style="color: #0284c7; font-size: 12px; font-weight: 600; display: inline-block; margin-top: 4px;">🚚 Kathmandu Valley Delivery</span>
                  </td>
                  <td width="50%" style="vertical-align: top; font-size: 13px; line-height: 1.5; color: #475569;">
                    <strong style="color: #0f172a; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Order Info</strong>
                    <strong>Order #:</strong> ${escapeHtml(order_id)}<br/>
                    <strong>Payment:</strong> ${escapeHtml(payment_method)}<br/>
                    <strong>Status:</strong> Placed (Processing)
                  </td>
                </tr>
              </table>

              <!-- Itemized Products Table -->
              <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Itemized Products</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Product</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Qty</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Price</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRowsHtml}
                </tbody>
              </table>

              <!-- Totals Breakdown -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="50%"></td>
                  <td width="50%">
                    <table role="presentation" width="100%" style="font-size: 14px; color: #475569;">
                      <tr>
                        <td style="padding: 4px 0;">Subtotal:</td>
                        <td align="right" style="font-weight: 600; color: #0f172a;">Rs. ${subtotal.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">Delivery Fee:</td>
                        <td align="right" style="font-weight: 600; color: #0f172a;">${shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0 0 0; font-size: 16px; font-weight: 800; color: #0f172a; border-top: 2px solid #0f172a;">Grand Total:</td>
                        <td align="right" style="padding: 10px 0 0 0; font-size: 18px; font-weight: 800; color: #0284c7; border-top: 2px solid #0f172a;">Rs. ${Number(total).toLocaleString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Scoping & Support Note -->
              <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <h4 style="color: #0369a1; font-size: 13px; font-weight: 800; margin: 0 0 4px 0;">Need to change your order?</h4>
                <p style="color: #0c4a6e; font-size: 12px; margin: 0; line-height: 1.5;">
                  You can cancel or message our support team any time BEFORE your package is shipped directly from your <strong style="color: #0369a1;">My Orders</strong> page.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 6px 0;"><strong>Music Craft Nepal Pvt. Ltd.</strong> — Bhotahity, Kathmandu, Nepal</p>
              <p style="margin: 0;">Phone: 01-4123456 | Email: support@musiccraftnepal.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `Order Confirmation #${order_id} - Music Craft Nepal`,
        html: htmlContent,
        text: textContent,
      }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: resendResult.message || resendResult.error || 'Failed to send email via Resend.',
          details: resendResult,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: resendResponse.status,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order confirmation email sent successfully via Resend.',
        id: resendResult.id,
        from: FROM_EMAIL,
        to: email,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err: any) {
    console.error('send-order-email error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Internal error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
