import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { X, ChevronDown, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendOrderConfirmationEmail } from '../lib/emailService';
import { initiatePayment, verifyPayment } from '../lib/paymentService';

interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  size: string;
}

interface CheckoutProps {
  cartItems: CartItem[];
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export function Checkout({ cartItems, onClose, onSuccess }: CheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card',
  });

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    scrollYRef.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' });
    }

    return () => {
      document.body.style.position = 'static';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollYRef.current);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleContinueToPayment = () => {
    if (!orderData.name || !orderData.email || !orderData.phone || !orderData.address || !orderData.city || !orderData.postalCode) {
      alert('Please fill in all shipping details before continuing.');
      return;
    }
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!orderData.name || !orderData.email || !orderData.phone || !orderData.address || !orderData.city || !orderData.postalCode) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_email: orderData.email,
            user_name: orderData.name,
            phone: orderData.phone,
            address: orderData.address,
            city: orderData.city,
            postal_code: orderData.postalCode,
            payment_method: orderData.paymentMethod,
            total_amount: totalAmount,
            order_status: 'pending',
          }
        ])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      // Add order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_title: item.title,
        product_image: item.image,
        size: item.size,
        price: item.price,
        quantity: 1,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items error:', itemsError);
        throw itemsError;
      }

      // Process payment based on method
      if (orderData.paymentMethod === 'cod') {
        // Cash on Delivery - confirm immediately
        await updateOrderStatus(order.id, 'confirmed');
        await sendConfirmationEmail(order, orderItems, orderData);
        setStep('success');
        setTimeout(() => {
          onSuccess(order.id);
        }, 2000);
      } else {
        // Card/UPI/Wallet - process payment
        initiatePayment(
          {
            orderId: order.id,
            amount: totalAmount,
            customerEmail: orderData.email,
            customerPhone: orderData.phone,
            customerName: orderData.name,
            method: orderData.paymentMethod,
          },
          async (paymentId: string) => {
            // Payment successful
            const verified = await verifyPayment(paymentId, order.id);
            if (verified) {
              await updateOrderStatus(order.id, 'confirmed');
              await sendConfirmationEmail(order, orderItems, orderData);
              setStep('success');
              setTimeout(() => {
                onSuccess(order.id);
              }, 2000);
            }
          },
          (error: string) => {
            console.error('Payment error:', error);
            alert(error);
            setLoading(false);
          }
        );
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('id', orderId);

    if (error) {
      console.error('Status update error:', error);
      throw error;
    }
  };

  const sendConfirmationEmail = async (order: any, orderItems: any[], orderData: any) => {
    const emailData = {
      to: orderData.email,
      orderNumber: order.id.slice(0, 12),
      customerName: orderData.name,
      items: orderItems.map(item => ({
        title: item.product_title,
        price: item.price,
        size: item.size,
      })),
      totalAmount,
      shippingAddress: `${orderData.address}, ${orderData.city} - ${orderData.postalCode}`,
    };

    await sendOrderConfirmationEmail(emailData);
  };

  const handleClose = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.4,
        ease: 'expo.inOut',
        onComplete: onClose,
      });
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div onClick={handleClose} className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm" />

      {/* Checkout Modal */}
      <div ref={containerRef} className="fixed inset-0 z-[310] overflow-hidden flex items-end md:items-center justify-center">
        <div className="relative bg-[#121212] w-full h-[100dvh] md:h-auto md:w-[90vw] lg:w-[800px] md:max-h-[90vh] overflow-y-auto border-t md:border border-[#2a2a2a] rounded-none md:rounded-2xl flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-[#121212] z-10 border-b border-[#2a2a2a] p-6 flex justify-between items-center shrink-0">
            <h2 className="text-[18px] md:text-[24px] font-serif tracking-[-0.5px]">
              {step === 'details' && 'Shipping Details'}
              {step === 'payment' && 'Payment Method'}
              {step === 'success' && 'Order Confirmed'}
            </h2>
            <button onClick={handleClose} className="text-[#A9A9A9] hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {step === 'details' && (
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={orderData.name}
                  onChange={handleInputChange}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 text-[14px] outline-none focus:border-[#D4AF37] transition-colors rounded-lg"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  value={orderData.email}
                  onChange={handleInputChange}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 text-[14px] outline-none focus:border-[#D4AF37] transition-colors rounded-lg"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={orderData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 text-[14px] outline-none focus:border-[#D4AF37] transition-colors rounded-lg"
                />
                <textarea
                  name="address"
                  placeholder="Full Address *"
                  value={orderData.address}
                  onChange={handleInputChange}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 text-[14px] outline-none focus:border-[#D4AF37] transition-colors rounded-lg resize-none h-20"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={orderData.city}
                    onChange={handleInputChange}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 text-[14px] outline-none focus:border-[#D4AF37] transition-colors rounded-lg"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code *"
                    value={orderData.postalCode}
                    onChange={handleInputChange}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 text-[14px] outline-none focus:border-[#D4AF37] transition-colors rounded-lg"
                  />
                </div>

                {/* Order Summary */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 mt-6">
                  <h3 className="text-[12px] uppercase tracking-[2px] font-medium mb-3">Order Summary</h3>
                  <div className="space-y-2 mb-3 pb-3 border-b border-[#2a2a2a]">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between text-[13px]">
                        <span className="text-[#A9A9A9]">{item.title} (Size: {item.size})</span>
                        <span>₹ {item.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[14px] font-medium">
                    <span>Total</span>
                    <span className="text-[#D4AF37]">₹ {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleContinueToPayment}
                  className="w-full py-3 bg-white text-black uppercase tracking-[2px] text-[12px] font-bold hover:bg-[#D4AF37] transition-all duration-300 rounded-lg mt-6"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {['card', 'upi', 'wallet', 'cod'].map(method => (
                    <label key={method} className="flex items-center p-4 border border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#D4AF37] transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={orderData.paymentMethod === method}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-[#D4AF37]"
                      />
                      <span className="ml-3 flex-1 text-white uppercase text-[12px] tracking-[1px]">
                        {method === 'card' && 'Credit/Debit Card'}
                        {method === 'upi' && 'UPI Payment'}
                        {method === 'wallet' && 'Digital Wallet'}
                        {method === 'cod' && 'Cash on Delivery'}
                      </span>
                    </label>
                  ))}
                </div>

                {orderData.paymentMethod === 'card' && (
                  <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-lg p-4 space-y-3 text-[12px] text-[#A9A9A9]">
                    <p>✓ Secure payment via Razorpay</p>
                    <p>✓ SSL Encrypted transaction</p>
                    <p>✓ Your card details are not stored</p>
                  </div>
                )}
                {orderData.paymentMethod === 'upi' && (
                  <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-lg p-4 space-y-3 text-[12px] text-[#A9A9A9]">
                    <p>✓ Quick UPI payment via Razorpay</p>
                    <p>✓ Instant confirmation</p>
                    <p>✓ Secure and fast</p>
                  </div>
                )}
                {orderData.paymentMethod === 'wallet' && (
                  <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-lg p-4 space-y-3 text-[12px] text-[#A9A9A9]">
                    <p>✓ Pay using your digital wallet</p>
                    <p>✓ Apple Pay, Google Pay supported</p>
                    <p>✓ Fast checkout experience</p>
                  </div>
                )}
                {orderData.paymentMethod === 'cod' && (
                  <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-lg p-4 space-y-3 text-[12px] text-[#A9A9A9]">
                    <p>✓ Pay when your order arrives</p>
                    <p>✓ No advance payment needed</p>
                    <p>✓ Available across India</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep('details')}
                    className="flex-1 py-3 bg-transparent border border-[#2a2a2a] text-white uppercase tracking-[2px] text-[12px] font-bold hover:border-white transition-colors rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 py-3 bg-[#D4AF37] text-black uppercase tracking-[2px] text-[12px] font-bold hover:bg-white disabled:opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Place Order'}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-[20px] font-serif mb-2">Order Confirmed!</h3>
                <p className="text-[#A9A9A9] text-[14px] mb-6">Thank you for your purchase. A confirmation email will be sent shortly.</p>
                <p className="text-[#D4AF37] text-[12px] uppercase tracking-[2px] font-medium">Redirecting...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
