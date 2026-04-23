import { useEffect, useState } from 'react';
import { X, Package, CheckCircle, Truck, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  order_status: string;
  order_items: any[];
}

export function UserDashboard({ userEmail, onClose, onLogout }: { userEmail: string; onClose: () => void; onLogout: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserOrders();
  }, [userEmail]);

  const fetchUserOrders = async () => {
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;

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
        return <Truck className="w-5 h-5 text-blue-400" />;
      case 'delivered':
        return <Package className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-[#A9A9A9]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-[#A9A9A9]';
      case 'confirmed':
        return 'text-[#D4AF37]';
      case 'shipped':
        return 'text-blue-400';
      case 'delivered':
        return 'text-green-500';
      default:
        return 'text-[#A9A9A9]';
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#121212] w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#2a2a2a] rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#121212] border-b border-[#2a2a2a] p-6 flex justify-between items-center">
          <div>
            <h2 className="text-[24px] font-serif tracking-[-0.5px]">My Orders</h2>
            <p className="text-[12px] text-[#A9A9A9]">{userEmail}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-transparent border border-[#2a2a2a] text-[#A9A9A9] hover:text-white text-[11px] uppercase tracking-[1px] rounded-lg transition-colors"
            >
              Logout
            </button>
            <button 
              onClick={onClose}
              className="text-[#A9A9A9] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <p className="text-[#A9A9A9] text-center py-8">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-[#A9A9A9] mx-auto mb-4 opacity-50" />
              <p className="text-[#A9A9A9] mb-2">No orders yet</p>
              <p className="text-[12px] text-[#666]">Start shopping to see your orders here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-[#2a2a2a] rounded-lg p-4 hover:border-[#D4AF37] transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[12px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Order ID</p>
                      <p className="text-[13px] font-mono text-white">{order.id.slice(0, 12)}...</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.order_status)}
                      <span className={`text-[12px] uppercase tracking-[1px] font-medium ${getStatusColor(order.order_status)}`}>
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 pb-3 border-b border-[#2a2a2a]">
                    <div>
                      <p className="text-[11px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Order Date</p>
                      <p className="text-[13px] text-white">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Total Amount</p>
                      <p className="text-[13px] text-[#D4AF37] font-medium">₹ {order.total_amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="text-[11px] uppercase tracking-[1px] text-[#D4AF37] hover:text-white transition-colors"
                  >
                    {expandedId === order.id ? '▼ Hide' : '▶ View'} Items
                  </button>

                  {expandedId === order.id && (
                    <div className="mt-4 pt-4 border-t border-[#2a2a2a] space-y-2">
                      {order.order_items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 bg-[#1a1a1a] p-3 rounded">
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_title} className="w-12 h-16 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <p className="text-[12px] font-medium text-white">{item.product_title}</p>
                            <p className="text-[11px] text-[#A9A9A9]">Size: {item.size}</p>
                            <p className="text-[12px] text-[#D4AF37]">₹ {item.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
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
