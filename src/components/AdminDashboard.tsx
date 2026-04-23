import { useEffect, useState } from 'react';
import { X, DownloadCloud, Filter } from 'lucide-react';
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

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => order.id === orderId ? { ...order, order_status: newStatus } : order));
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.order_status === statusFilter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'pending').length,
    confirmed: orders.filter(o => o.order_status === 'confirmed').length,
    shipped: orders.filter(o => o.order_status === 'shipped').length,
    delivered: orders.filter(o => o.order_status === 'delivered').length,
    revenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
  };

  const downloadCSV = () => {
    const csv = [
      ['Order ID', 'Date', 'Customer', 'Email', 'Amount', 'Status', 'Payment Method'],
      ...orders.map(o => [
        o.id,
        new Date(o.created_at).toLocaleDateString(),
        o.user_name,
        o.user_email,
        o.total_amount,
        o.order_status,
        o.payment_method,
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#121212] w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-[#2a2a2a] rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#121212] border-b border-[#2a2a2a] p-6 flex justify-between items-center">
          <h2 className="text-[24px] font-serif tracking-[-0.5px]">Admin Dashboard</h2>
          <button onClick={onClose} className="text-[#A9A9A9] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard label="Total Orders" value={stats.total} color="text-white" />
            <StatCard label="Pending" value={stats.pending} color="text-[#A9A9A9]" />
            <StatCard label="Confirmed" value={stats.confirmed} color="text-[#D4AF37]" />
            <StatCard label="Shipped" value={stats.shipped} color="text-blue-400" />
            <StatCard label="Delivered" value={stats.delivered} color="text-green-400" />
          </div>

          {/* Revenue */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <p className="text-[12px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Total Revenue</p>
            <p className="text-[28px] font-serif text-[#D4AF37]">₹ {stats.revenue.toLocaleString()}</p>
          </div>

          {/* Filter & Export */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#A9A9A9]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#1a1a1a] border border-[#2a2a2a] text-white px-3 py-2 text-[12px] rounded outline-none focus:border-[#D4AF37]"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2 text-[12px] font-bold uppercase tracking-[1px] rounded hover:bg-white transition-colors"
            >
              <DownloadCloud className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Orders Table */}
          {loading ? (
            <p className="text-[#A9A9A9] text-center py-8">Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-[#A9A9A9] text-center py-8">No orders found</p>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border border-[#2a2a2a] rounded-lg p-4 hover:border-[#D4AF37] transition-colors">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                    <div>
                      <p className="text-[12px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Order ID</p>
                      <p className="text-[13px] font-mono text-white">{order.id.slice(0, 12)}...</p>
                    </div>
                    <div>
                      <p className="text-[12px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Customer</p>
                      <p className="text-[13px] text-white">{order.user_name}</p>
                      <p className="text-[11px] text-[#A9A9A9]">{order.user_email}</p>
                    </div>
                    <div>
                      <p className="text-[12px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Amount</p>
                      <p className="text-[14px] text-[#D4AF37] font-medium">₹ {order.total_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[12px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Status</p>
                      <select
                        value={order.order_status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-[#1a1a1a] border border-[#2a2a2a] text-white px-3 py-1 text-[11px] rounded outline-none focus:border-[#D4AF37] capitalize"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="text-[11px] uppercase tracking-[1px] text-[#D4AF37] hover:text-white transition-colors"
                  >
                    {expandedId === order.id ? '▼ Hide' : '▶ Show'} Details
                  </button>

                  {expandedId === order.id && (
                    <div className="mt-4 pt-4 border-t border-[#2a2a2a] space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Date</p>
                          <p className="text-[12px] text-white">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Payment</p>
                          <p className="text-[12px] text-white capitalize">{order.payment_method}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Phone</p>
                          <p className="text-[12px] text-white">{order.phone}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Address</p>
                        <p className="text-[12px] text-white">{order.address}, {order.city} - {order.postal_code}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[2px] text-[#A9A9A9] mb-1">Items</p>
                        <div className="space-y-1">
                          {order.order_items.map((item, idx) => (
                            <p key={idx} className="text-[12px] text-white">• {item.product_title} (Size: {item.size}) - ₹ {item.price}</p>
                          ))}
                        </div>
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

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-center">
      <p className="text-[10px] uppercase tracking-[1px] text-[#A9A9A9] mb-1">{label}</p>
      <p className={`text-[24px] font-bold ${color}`}>{value}</p>
    </div>
  );
}
