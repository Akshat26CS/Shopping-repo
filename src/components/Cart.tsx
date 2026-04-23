import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export function Cart({ onClose }: { onClose: () => void }) {
  const { cart, removeFromCart } = useCartStore();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setQuantities(prev => ({ ...prev, [id]: newQuantity }));
  };

  const getItemQuantity = (id: string) => {
    return quantities[id] || cart.find(item => item.id === id)?.quantity || 1;
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const quantity = getItemQuantity(item.id);
      return total + (item.price * quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + getItemQuantity(item.id), 0);
  };

  return (
    <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#121212] w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[#2a2a2a] rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#121212] border-b border-[#2a2a2a] p-6 flex justify-between items-center">
          <div>
            <h2 className="text-[24px] font-serif tracking-[-0.5px]">Shopping Cart</h2>
            <p className="text-[12px] text-[#A9A9A9]">{getTotalItems()} items</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A9A9A9] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-[#A9A9A9] mx-auto mb-4 opacity-50" />
              <p className="text-[#A9A9A9] mb-2">Your cart is empty</p>
              <p className="text-[12px] text-[#666]">Add some items to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 bg-[#1a1a1a] p-4 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-[14px] font-medium text-white mb-1">{item.title}</h3>
                    <p className="text-[12px] text-[#A9A9A9] mb-2">Size: {item.size}</p>
                    <p className="text-[14px] text-[#D4AF37] font-medium">₹ {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#A9A9A9] hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, getItemQuantity(item.id) - 1)}
                        className="w-6 h-6 bg-[#2a2a2a] text-white rounded flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[12px] text-white min-w-[20px] text-center">
                        {getItemQuantity(item.id)}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, getItemQuantity(item.id) + 1)}
                        className="w-6 h-6 bg-[#2a2a2a] text-white rounded flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="sticky bottom-0 bg-[#121212] border-t border-[#2a2a2a] p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[14px] text-white">Total</span>
              <span className="text-[18px] text-[#D4AF37] font-semibold">₹ {getTotalPrice().toLocaleString()}</span>
            </div>
            <button
              onClick={() => alert('Checkout coming soon')}
              className="w-full py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#c4a037] transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}