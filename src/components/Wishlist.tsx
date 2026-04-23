import { useState } from 'react';
import { X, Heart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';

export function Wishlist({ onClose }: { onClose: () => void }) {
  const { wishlist, removeFromWishlist } = useWishlistStore();

  return (
    <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#121212] w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[#2a2a2a] rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#121212] border-b border-[#2a2a2a] p-6 flex justify-between items-center">
          <div>
            <h2 className="text-[24px] font-serif tracking-[-0.5px]">Wishlist</h2>
            <p className="text-[12px] text-[#A9A9A9]">{wishlist.length} items</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A9A9A9] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
          {wishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-[#A9A9A9] mx-auto mb-4 opacity-50" />
              <p className="text-[#A9A9A9] mb-2">Your wishlist is empty</p>
              <p className="text-[12px] text-[#666]">Save items you love for later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishlist.map((item) => (
                <div key={item.id} className="bg-[#1a1a1a] p-4 rounded-lg group">
                  <div className="relative mb-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded"
                    />
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-[14px] font-medium text-white mb-1">{item.title}</h3>
                  <p className="text-[14px] text-[#D4AF37] font-medium">₹ {item.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}