// Payment service for handling payment gateway integration
// Supports Razorpay with mock payment option for demo

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || '';

interface PaymentData {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  method: string;
}

export async function initiatePayment(paymentData: PaymentData, onSuccess: (paymentId: string) => void, onError: (error: string) => void) {
  try {
    // If using mock payment or COD, skip payment gateway
    if (paymentData.method === 'cod' || !RAZORPAY_KEY) {
      console.log('✓ Mock payment successful (or COD selected)');
      onSuccess(`MOCK_${Date.now()}`);
      return;
    }

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      await loadRazorpayScript();
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: paymentData.amount * 100, // Convert to paise
      currency: 'INR',
      name: 'Vandana Haute Couture',
      description: `Order ${paymentData.orderId}`,
      order_id: paymentData.orderId,
      prefill: {
        email: paymentData.customerEmail,
        contact: paymentData.customerPhone,
        name: paymentData.customerName,
      },
      theme: {
        color: '#D4AF37',
      },
      handler: function (response: any) {
        console.log('✓ Payment successful:', response);
        onSuccess(response.razorpay_payment_id);
      },
      modal: {
        ondismiss: function () {
          onError('Payment cancelled by user');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Payment error:', error);
    onError(error instanceof Error ? error.message : 'Payment initiation failed');
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

export async function verifyPayment(paymentId: string, orderId: string): Promise<boolean> {
  try {
    // If mock payment, always succeed
    if (paymentId.startsWith('MOCK_')) {
      console.log('✓ Mock payment verified');
      return true;
    }

    // For real Razorpay, you would verify on your backend
    // This is a placeholder - implement actual verification on your backend
    console.log('Payment verification:', { paymentId, orderId });
    return true;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}
