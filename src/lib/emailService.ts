// Email service for order confirmations
// Using Resend.com free tier - update with your API key
// For now, using a mock implementation

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';

interface EmailData {
  to: string;
  orderNumber: string;
  customerName: string;
  items: Array<{
    title: string;
    price: number;
    size: string;
  }>;
  totalAmount: number;
  shippingAddress: string;
}

export async function sendOrderConfirmationEmail(data: EmailData) {
  try {
    if (!RESEND_API_KEY) {
      console.log('📧 Mock email sent (Resend API key not configured)');
      console.log(`Order confirmation for ${data.to}`);
      return true;
    }

    // Real Resend API call (requires API key in .env)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'orders@vandanahautecouture.com',
        to: data.to,
        subject: `Order Confirmed - #${data.orderNumber}`,
        html: generateEmailHTML(data),
      }),
    });

    if (!response.ok) {
      console.error('Email send failed:', response.statusText);
      return false;
    }

    console.log('✅ Order confirmation email sent');
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

function generateEmailHTML(data: EmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #121212; color: #fff; padding: 20px; border-radius: 8px; }
          .header { border-bottom: 2px solid #D4AF37; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { color: #D4AF37; margin: 0; }
          .order-number { color: #A9A9A9; font-size: 12px; margin: 0; }
          .items { margin: 20px 0; }
          .item { padding: 10px; background: #1a1a1a; margin-bottom: 10px; border-radius: 4px; }
          .total { font-size: 18px; color: #D4AF37; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 1px solid #2a2a2a; }
          .shipping { margin: 20px 0; padding: 10px; background: #1a1a1a; border-radius: 4px; }
          .footer { margin-top: 20px; text-align: center; color: #A9A9A9; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed ✓</h1>
            <p class="order-number">Order #${data.orderNumber}</p>
          </div>

          <p>Dear ${data.customerName},</p>
          <p>Thank you for your purchase! Your order has been confirmed and will be processed shortly.</p>

          <h3 style="color: #D4AF37; margin-top: 20px;">Order Items</h3>
          <div class="items">
            ${data.items.map(item => `
              <div class="item">
                <p style="margin: 0; font-weight: bold;">${item.title}</p>
                <p style="margin: 5px 0 0 0; color: #A9A9A9;">Size: ${item.size}</p>
                <p style="margin: 5px 0 0 0; color: #D4AF37;">₹ ${item.price.toLocaleString()}</p>
              </div>
            `).join('')}
          </div>

          <div class="total">Total Amount: ₹ ${data.totalAmount.toLocaleString()}</div>

          <div class="shipping">
            <h3 style="margin-top: 0; color: #D4AF37;">Shipping Address</h3>
            <p style="margin: 10px 0; color: #A9A9A9;">${data.shippingAddress}</p>
          </div>

          <p>You will receive tracking information soon. If you have any questions, please contact our support team.</p>

          <div class="footer">
            <p>© 2026 Vandana Haute Couture. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
