import { useEffect, useState } from 'react';
import { X, Truck, CheckCircle, Clock, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  created_at: string;
  user_email: string;
  user_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  payment_method: string;
  total_amount: number;
  order_status: string;
}

interface OrderWithItems extends Order {
  order_items: any[];
}

export function OrderHistory({ userEmail, onClose }: { userEmail: string; onClose: () => void }) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [userEmail]);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return { ...order, order_items: itemsData || [] };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-[#D4AF37]" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-[#D4AF37]" />;
      case 'delivered':
        return <Package className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-[#A9A9A9]" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Processing';
      case 'confirmed':
        return 'Confirmed';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#121212] w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#2a2a2a] rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#121212] border-b border-[#2a2a2a] p-6 flex justify-between items-center">
          <h2 className="text-[24px] font-serif tracking-[-0.5px]">Order History</h2>
          <button onClick={onClose} className="text-[#A9A9A9] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <p className="text-[#A9A9A9] text-center py-8">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-[#A9A9A9] text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-[#2a2a2a] rounded-lg p-4 hover:border-[#D4AF37] transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Order ID</p>
                      <p className="text-[14px] font-medium text-white font-mono">{order.id.slice(0, 12)}...</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.order_status)}
                      <span className="text-[12px] uppercase tracking-[1px] font-medium text-[#D4AF37]">
                        {getStatusText(order.order_status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 pb-3 border-b border-[#2a2a2a]">
                    <div>
                      <p className="text-[11px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Order Date</p>
                      <p className="text-[13px] text-white">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Total Amount</p>
                      <p className="text-[13px] text-[#D4AF37] font-medium">₹ {order.total_amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="text-[11px] uppercase tracking-[1px] text-[#D4AF37] hover:text-white transition-colors mb-2"
                  >
                    {expandedId === order.id ? '▼ Hide' : '▶ View'} Items & Details
                  </button>

                  {expandedId === order.id && (
                    <div className="mt-4 pt-4 border-t border-[#2a2a2a] space-y-4">
                      {/* Items */}
                      <div>
                        <p className="text-[12px] uppercase tracking-[2px] font-medium mb-2">Items</p>
                        <div className="space-y-2">
                          {order.order_items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 bg-[#1a1a1a] p-3 rounded">
                              {item.product_image && (
                                <img src={item.product_image} alt={item.product_title} className="w-16 h-20 object-cover rounded" />
                              )}
                              <div className="flex-1">
                                <p className="text-[13px] font-medium text-white">{item.product_title}</p>
                                <p className="text-[11px] text-[#A9A9A9]">Size: {item.size}</p>
                                <p className="text-[12px] text-[#D4AF37] font-medium">₹ {item.price.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <p className="text-[12px] uppercase tracking-[2px] font-medium mb-2">Shipping Address</p>
                        <div className="bg-[#1a1a1a] p-3 rounded text-[12px] text-[#A9A9A9]">
                          <p>{order.user_name}</p>
                          <p>{order.address}</p>
                          <p>{order.city} - {order.postal_code}</p>
                          <p>Ph: {order.phone}</p>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="flex justify-between text-[12px]">
                        <span className="text-[#A9A9A9] uppercase tracking-[1px]">Payment Method</span>
                        <span className="text-white capitalize">{order.payment_method}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
