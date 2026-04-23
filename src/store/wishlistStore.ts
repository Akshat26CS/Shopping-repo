import { create } from 'zustand';

type WishlistItem = {
  id: string;
  title: string;
  price: number;
  image: string;
};

type WishlistState = {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]'),

  addToWishlist: (item) =>
    set((state) => {
      if (state.wishlist.some(wishlistItem => wishlistItem.id === item.id)) {
        return state; // Item already in wishlist
      }
      const updatedWishlist = [...state.wishlist, item];
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      return { wishlist: updatedWishlist };
    }),

  removeFromWishlist: (id) =>
    set((state) => {
      const updatedWishlist = state.wishlist.filter((item) => item.id !== id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      return { wishlist: updatedWishlist };
    }),

  isInWishlist: (id) => {
    return get().wishlist.some(item => item.id === id);
  },
}));