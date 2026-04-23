import { useEffect, useRef, useState, MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Star, ChevronDown, Check, X, Ruler, Truck, ShoppingBag, ZoomIn, Heart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { supabase } from '../lib/supabase';
import { Checkout } from './Checkout';

interface CategoryItem {
  title: string;
  imageSrc: string;
  price: number;
}

const ACCORDION_DATA = [
  {
    title: 'Product Description',
    content: 'A masterclass in minimal architecture. This piece dissects centuries-old weaving techniques and reconstructs them into stark silhouettes for the contemporary luxury wearer. Drapes effortlessly and commands attention in any room. Designed in our New Delhi atelier.'
  },
  {
    title: 'Fabric & Care',
    content: '100% Pure Handwoven Silk Organza. Adorned with microscopic Zardosi hand-embroidery. Dry Clean Only. Store in the provided muslin garment bag away from direct sunlight.'
  },
  {
    title: 'Styling Notes',
    content: 'Pair with sculptural, brutalist silver jewelry and a sleek pulled-back hair look. The dramatic fall of the fabric requires high structural heels to maintain its imposing silhouette.'
  }
];

export function ProductDetails({ item, onClose }: { item: CategoryItem; onClose: () => void }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);
  // ADDED: Extract the remove function from your global store
  const removeFromGlobalCart = useCartStore((state) => state.removeFromCart);
  
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  
  // Checking the array directly instead of calling a missing store function
  const wishlist = useWishlistStore((state) => state.wishlist);
  const isItemInWishlist = wishlist?.some((w: any) => w.id === item.title) || false;

  const [cartItems, setCartItems] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const miniCartRef = useRef<HTMLDivElement>(null);
  const sizeModalRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef<number>(0);
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [cartState, setCartState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);

  // Delivery state
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [deliveryMessage, setDeliveryMessage] = useState('');

  // Derive extra gallery images (mocking variations for luxury feel)
  const images = [
    item.imageSrc,
    "https://images.unsplash.com/photo-1595777707802-c8468c7bc895?q=80&w=1500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1500&auto=format&fit=crop"
  ];

  useEffect(() => {
    fetchCart();
  }, []);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }

    setCartState('adding');

    // Update global Zustand Store so the main Cart updates immediately
    addToCart({
      id: item.title + '-' + selectedSize,
      title: item.title,
      price: item.price,
      image: item.imageSrc,
      size: selectedSize,
      quantity: 1
    });

    const { error } = await supabase.from('cart').insert([
      {
        title: item.title,
        price: item.price,
        image: item.imageSrc,
        size: selectedSize,
        quantity: 1
      }
    ]);

    if (error) {
      console.error("Cart error:", error.message);
      alert("Failed to add to cart");
      setCartState('idle');
      return;
    }

    setCartState('added');
    setIsCartOpen(true);
    
    // Refresh cart after adding
    setTimeout(() => fetchCart(), 500);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    setCheckoutItems([{
      id: Math.random().toString(),
      title: item.title,
      image: item.imageSrc,
      price: item.price,
      size: selectedSize
    }]);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutFromCart = () => {
    const formattedItems = cartItems.map(item => ({
      id: item.id,
      title: item.title,
      image: item.image,
      price: item.price,
      size: item.size
    }));
    setCheckoutItems(formattedItems);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = async (orderId: string) => {
    // Clear cart from database
    await supabase.from('cart').delete().gt('id', 0);
    setCartItems([]);
    setCartState('idle');
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    onClose();
    alert(`Order placed successfully! Order ID: ${orderId}`);
  };

  const checkDelivery = () => {
    if (!pincode) {
        setDeliveryStatus('error');
        setDeliveryMessage('Please enter a PIN code');
        return;
    }
    
    // Indian PIN codes are 6 digits and do not start with 0
    const isValidPin = /^[1-9][0-9]{5}$/.test(pincode);
    
    if (!isValidPin) {
        setDeliveryStatus('error');
        setDeliveryMessage('Please enter a valid 6-digit Indian PIN code');
        return;
    }
    
    setDeliveryStatus('checking');
    
    // Simulate API call
    setTimeout(() => {
        setDeliveryStatus('success');
        
        const firstDigit = parseInt(pincode.charAt(0));
        let days = '3-5';
        
        // Simple logic for delivery estimates based on region
        if (firstDigit <= 4) {
            days = '2-3'; // North & West
        } else if (firstDigit <= 6) {
            days = '3-4'; // South
        } else {
            days = '5-7'; // East & North-East
        }
        
        setDeliveryMessage(`Delivery available. Expected in ${days} business days.`);
    }, 800);
  };

  const fetchCart = async () => {
    const { data, error } = await supabase.from('cart').select('*');

    if (error) {
      console.error("Fetch error:", error.message);
      return;
    }

    setCartItems(data || []);
  };

  const removeFromCart = async (itemId: string) => {
    // ADDED: Find the item locally first so we know its title and size for the global store
    const itemToRemove = cartItems.find(i => i.id === itemId);

    const { error } = await supabase.from('cart').delete().eq('id', itemId);

    if (error) {
      console.error("Remove error:", error.message);
      alert("Failed to remove from cart");
      return;
    }

    // ADDED: Remove from the global Zustand store so the main navbar cart updates!
    if (itemToRemove) {
      removeFromGlobalCart(itemToRemove.title + '-' + itemToRemove.size);
    }

    // Refresh cart after removing
    fetchCart();
    
    // Reset cart state when cart becomes empty
    setCartState('idle');
  };

  useEffect(() => {
    if (miniCartRef.current) {
      if (isCartOpen) {
        gsap.to(miniCartRef.current, { x: 0, duration: 0.8, ease: "power2.out" });
      } else {
        gsap.to(miniCartRef.current, { x: '100%', duration: 0.6, ease: "power2.inOut" });
      }
    }
  }, [isCartOpen]);

  useEffect(() => {
    if (isSizeModalOpen && sizeModalRef.current) {
        gsap.fromTo(sizeModalRef.current, { opacity: 0, scale: 0.9, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "power2.out" });
    }
  }, [isSizeModalOpen]);
  
  useEffect(() => {
    // Preserve the user's scroll position and lock page scrolling while the modal is open.
    scrollYRef.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { scale: 0.9, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
      );
      gsap.set(containerRef.current, {
        transformOrigin: 'center center'
      });
    }

    return () => {
      document.body.style.position = 'static';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.scrollTo(0, scrollYRef.current);
    };
  }, []);

  const handleClose = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 40,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: onClose
      });
    }
  };

  // Accordion Component (Local)
  const Accordion = ({ title, content, defaultOpen = false}: { title: string, content: string, defaultOpen?: boolean}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (contentRef.current) {
        if (isOpen) {
          gsap.to(contentRef.current, { height: 'auto', opacity: 1, duration: 0.5, ease: "expo.out" });
        } else {
          gsap.to(contentRef.current, { height: 0, opacity: 0, duration: 0.4, ease: "expo.inOut" });
        }
      }
    }, [isOpen]);

    return (
      <div className="border-b border-[#2a2a2a] py-4">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-full flex justify-between items-center text-left focus:outline-none group hover:text-[#D4AF37] active:scale-[0.98] transition-all duration-300"
        >
          <span className="text-[12px] uppercase tracking-[2px] font-medium">{title}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#D4AF37]' : 'text-[#A9A9A9] group-hover:text-[#D4AF37]'}`} />
        </button>
        <div ref={contentRef} className="overflow-hidden h-0 opacity-0">
          <p className="pt-4 text-[#A9A9A9] text-[13px] leading-[1.8] tracking-[0.5px]">
            {content}
          </p>
        </div>
      </div>
    );
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 z-[170] bg-black/90 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <div 
        ref={containerRef}
        className="fixed inset-0 z-[180] overflow-hidden"
        style={{ willChange: "transform", transformOrigin: "center center" }}
      >
        <div data-lenis-prevent="true" className="absolute inset-0 w-full h-full bg-[#121212] rounded-none overflow-y-auto md:overflow-hidden flex flex-col md:flex-row shadow-2xl border border-[#2a2a2a]">
          
          {/* Close Button */}
          <button 
            onClick={handleClose} 
            className="fixed md:absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-[#D4AF37] backdrop-blur-md rounded-full text-white transition-all duration-300 active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>

          {/* LEFT: Visual Gallery */}
          <div className="w-full md:w-[55%] h-[65vh] md:h-full relative bg-black flex group shrink-0">
            
            {/* Main Slider Area */}
            <div className="w-full h-full relative overflow-hidden">
                <img 
                    src={images[activeImage]} 
                    alt={item.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
                    onClick={() => setIsZoomed(!isZoomed)}
                />
                {/* Desktop Zoom Hint */}
                <div className="absolute bottom-4 right-4 hidden md:flex items-center gap-2 text-[#A9A9A9] bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[9px]">
                    <ZoomIn className="w-3 h-3" />
                    <span className="uppercase tracking-[1px]">Click to Zoom</span>
                </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:left-2 md:-translate-y-1/2 md:-translate-x-0 flex md:flex-col gap-2 z-40 bg-black/20 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-2 rounded-full">
                {images.map((img, idx) => (
                    <button 
                        key={idx}
                        onClick={() => { setActiveImage(idx); setIsZoomed(false); }}
                        className={`relative w-2 h-2 md:w-12 md:h-16 rounded-full md:rounded-sm overflow-hidden transition-all duration-300 active:scale-90 ${activeImage === idx ? 'bg-white md:border-2 md:border-white scale-125 md:scale-100' : 'bg-white/40 md:border-2 md:border-transparent md:opacity-50 hover:opacity-100'}`}
                    >
                        <img src={img} className="hidden md:block w-full h-full object-cover" alt="" />
                    </button>
                ))}
            </div>
          </div>

          {/* RIGHT: Product Information */}
          <div ref={rightPanelRef} className="w-full md:w-[45%] h-auto md:h-full overflow-y-visible md:overflow-y-auto bg-[#121212] px-6 py-8 md:px-8 shrink-0">
            <div className="max-w-full">
                
                {/* Header */}
                <div className="text-[#A9A9A9] text-[9px] uppercase tracking-[2px] mb-2">Vandana Haute Couture</div>
                <h1 className="font-serif text-[22px] md:text-[28px] leading-[1.1] font-light text-white mb-4">
                    {item.title} Elegance
                </h1>
                
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#2a2a2a]">
                    <div className="flex items-center text-white">
                        <span className="text-[12px] font-medium mr-1">4.9</span>
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <Star className="w-2.5 h-2.5 fill-white opacity-50" />
                    </div>
                    <div className="w-[1px] h-3 bg-[#2a2a2a]"></div>
                    <button className="text-[10px] text-[#A9A9A9] underline tracking-[1px] hover:text-white transition-colors">124 Reviews</button>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                    <div className="flex items-end gap-3">
                        <span className="text-[20px] md:text-[24px] font-light tracking-[1px]">₹ {item.price.toLocaleString()}</span>
                        <span className="text-[12px] text-[#A9A9A9] line-through pb-0.5">₹ {Math.round(item.price * 1.2).toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-[#A9A9A9] tracking-[1px] mt-1 uppercase">Inclusive of all taxes</p>
                </div>

                {/* Size Selection */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] uppercase tracking-[2px] font-medium">Select Size <span className="text-red-500">*</span></span>
                        <button 
                            onClick={() => setIsSizeModalOpen(true)}
                            className="flex items-center gap-1 text-[9px] uppercase tracking-[1px] text-[#A9A9A9] hover:text-white active:scale-95 transition-all"
                        >
                            <Ruler className="w-2.5 h-2.5" /> Size Chart
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['XS', 'S', 'M', 'L', 'XL', 'Custom'].map((size) => (
                            <button 
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border text-[10px] tracking-[1px] transition-all duration-300 ${
                                    selectedSize === size 
                                    ? 'border-white bg-white text-black font-bold' 
                                    : 'border-[#2a2a2a] text-[#A9A9A9] hover:border-white hover:text-white'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                    {selectedSize === 'Custom' && (
                        <p className="text-[#D4AF37] text-[9px] tracking-[1px] uppercase mt-2">Our atelier will contact you for precise measurements.</p>
                    )}
                </div>

                {/* Add to Cart Actions */}
                <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-[#2a2a2a]">
                    <div className="flex gap-3">
                        <button 
                            onClick={handleAddToCart}
                            disabled={cartState !== 'idle'}
                            className={`flex-1 py-3 flex items-center justify-center gap-2 uppercase tracking-[2px] text-[10px] font-bold transition-all duration-300 rounded-sm ${
                                cartState === 'added' 
                                ? 'bg-[#1a1a1a] text-[#D4AF37] border border-[#D4AF37]' 
                                : 'bg-white text-black hover:bg-[#e0e0e0] active:scale-[0.98]'
                            }`}
                        >
                            {cartState === 'idle' && 'Add to Cart'}
                            {cartState === 'adding' && <span className="animate-pulse">Reserving piece...</span>}
                            {cartState === 'added' && <><Check className="w-3 h-3" /> Added to Atelier</>}
                        </button>
                        <button 
                            onClick={() => {
                                if (isItemInWishlist) {
                                    removeFromWishlist(item.title);
                                } else {
                                    addToWishlist({
                                        id: item.title,
                                        title: item.title,
                                        price: item.price,
                                        image: item.imageSrc
                                    });
                                }
                            }}
                            className={`w-12 h-12 flex items-center justify-center rounded-sm border transition-all duration-300 ${
                                isItemInWishlist
                                ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                                : 'bg-transparent border-[#2a2a2a] text-[#A9A9A9] hover:border-[#D4AF37] hover:text-[#D4AF37]'
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isItemInWishlist ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleBuyNow}
                        className="w-full py-3 bg-transparent border border-[#2a2a2a] text-white uppercase tracking-[2px] text-[10px] font-bold hover:border-white transition-all duration-300 active:scale-[0.98] rounded-sm"
                    >
                        Buy It Now
                    </button>
                </div>

                {/* Delivery Check */}
                <div className="mb-6 pb-6 border-b border-[#2a2a2a]">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] font-medium mb-2">
                        <Truck className="w-3 h-3" /> Delivery
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="PIN Code" 
                            maxLength={6}
                            value={pincode}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, ''); // Allow only numbers
                                setPincode(val);
                                if (deliveryStatus !== 'idle') {
                                    setDeliveryStatus('idle');
                                }
                            }}
                            className={`bg-[#1a1a1a] border ${deliveryStatus === 'error' ? 'border-red-500' : deliveryStatus === 'success' ? 'border-green-500' : 'border-[#2a2a2a]'} text-white px-3 py-2 w-full text-[16px] md:text-[11px] tracking-[1px] outline-none focus:border-[#D4AF37] transition-colors rounded-sm`}
                        />
                        <button 
                            onClick={checkDelivery}
                            disabled={deliveryStatus === 'checking'}
                            className="px-4 bg-[#2a2a2a] text-white text-[9px] uppercase tracking-[1px] font-medium hover:bg-[#D4AF37] hover:text-black transition-colors rounded-sm disabled:opacity-50 min-w-[80px]"
                        >
                            {deliveryStatus === 'checking' ? '...' : 'Check'}
                        </button>
                    </div>
                    {deliveryStatus !== 'idle' && (
                        <p className={`mt-2 text-[10px] tracking-[1px] ${deliveryStatus === 'error' ? 'text-red-500' : deliveryStatus === 'success' ? 'text-green-500' : 'text-[#A9A9A9]'}`}>
                            {deliveryMessage}
                        </p>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="mb-6 pb-6 border-b border-[#2a2a2a]">
                    <div className="flex overflow-x-auto gap-1 md:gap-2 mb-4 pb-2 scrollbar-hide">
                        {['overview', 'description', 'care', 'styling'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 md:px-4 py-2 text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                                    activeTab === tab ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-[#A9A9A9] hover:text-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            <Accordion title="Product Description" content={ACCORDION_DATA[0].content} defaultOpen={true} />
                            <Accordion title="Fabric & Care" content={ACCORDION_DATA[1].content} />
                            <Accordion title="Styling Notes" content={ACCORDION_DATA[2].content} />
                        </div>
                    )}
                    {activeTab === 'description' && (
                        <div>
                            <p className="text-[#A9A9A9] text-[13px] leading-[1.8] tracking-[0.5px]">
                                {ACCORDION_DATA[0].content}
                            </p>
                        </div>
                    )}
                    {activeTab === 'care' && (
                        <div>
                            <p className="text-[#A9A9A9] text-[13px] leading-[1.8] tracking-[0.5px]">
                                {ACCORDION_DATA[1].content}
                            </p>
                        </div>
                    )}
                    {activeTab === 'styling' && (
                        <div>
                            <p className="text-[#A9A9A9] text-[13px] leading-[1.8] tracking-[0.5px]">
                                {ACCORDION_DATA[2].content}
                            </p>
                        </div>
                    )}
                </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- Overlay Modals --- */}

      {/* Slide-out Mini Cart */}
      {isCartOpen && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
      )}
      <div 
        ref={miniCartRef}
        className="fixed top-0 right-0 h-[100dvh] w-[100vw] md:w-[450px] bg-[#121212] z-[210] border-l border-[#2a2a2a] p-8 flex flex-col translate-x-full"
        style={{ willChange: "transform" }}
      >
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#2a2a2a]">
              <h3 className="text-[14px] uppercase tracking-[3px] font-medium flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-[#D4AF37]" /> Your Atelier ({cartItems.length})
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="text-[#A9A9A9] hover:text-white active:scale-90 transition-all">
                  <X className="w-6 h-6" />
              </button>
          </div>

          <div className="flex-1 overflow-y-auto">
  {cartItems.length === 0 ? (
    <p className="text-[#A9A9A9]">Cart is empty</p>
  ) : (
    cartItems.map((cartItem, index) => (
      <div key={index} className="flex gap-6 mb-8 group">
        <div className="w-[100px] h-[130px] bg-black overflow-hidden relative">
          <img
            src={cartItem.image}
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
            alt="Cart item"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h4 className="font-serif text-[20px] mb-2">
              {cartItem.title}
            </h4>
            <p className="text-[10px] text-[#A9A9A9] uppercase tracking-[1px] mb-1">
              Size: {cartItem.size}
            </p>
            <p className="text-[14px] tracking-[1px]">
              ₹ {cartItem.price}
            </p>
          </div>
          <button
            onClick={() => removeFromCart(cartItem.id)}
            className="text-[11px] uppercase tracking-[1px] text-[#D4AF37] hover:text-white transition-colors w-fit active:scale-90"
          >
            Remove
          </button>
        </div>
      </div>
    ))
  )}
</div>

          <div className="pt-8 border-t border-[#2a2a2a]">
              <div className="flex justify-between text-[12px] tracking-[1px] mb-6">
                  <span className="text-[#A9A9A9] uppercase">Subtotal</span>
                  <span>₹ {cartItems.reduce((acc, item) => acc + item.price, 0).toLocaleString()}</span>
              </div>
              <button 
                  onClick={handleCheckoutFromCart}
                  className="w-full py-5 bg-white text-black uppercase tracking-[2px] text-[11px] font-bold hover:bg-[#D4AF37] hover:text-white transition-all duration-300"
              >
                  Proceed to Checkout
              </button>
          </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <Checkout 
          cartItems={checkoutItems} 
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Size Chart Modal */}
      {isSizeModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSizeModalOpen(false)}></div>
            <div 
                ref={sizeModalRef}
                className="relative bg-[#121212] border border-[#2a2a2a] w-full max-w-[600px] p-8 md:p-12 z-10 rounded-lg"
            >
                <button onClick={() => setIsSizeModalOpen(false)} className="absolute top-6 right-6 text-[#A9A9A9] hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
                <h3 className="font-serif text-[32px] tracking-[-0.5px] mb-2">Sartorial Dimensions</h3>
                <p className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] mb-8">All measurements in inches</p>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] tracking-[1px] uppercase">
                        <thead>
                            <tr className="border-b border-[#2a2a2a] text-[#A9A9A9]">
                                <th className="py-4 font-normal">Size</th>
                                <th className="py-4 font-normal">Bust</th>
                                <th className="py-4 font-normal">Waist</th>
                                <th className="py-4 font-normal">Hip</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-[#2a2a2a]/50">
                                <td className="py-4 text-white">XS</td><td>32"</td><td>24"</td><td>35"</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a]/50">
                                <td className="py-4 text-white">S</td><td>34"</td><td>26"</td><td>37"</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a]/50">
                                <td className="py-4 text-white">M</td><td>36"</td><td>28"</td><td>39"</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a]/50">
                                <td className="py-4 text-white">L</td><td>38"</td><td>30"</td><td>41"</td>
                            </tr>
                            <tr>
                                <td className="py-4 text-white">XL</td><td>40"</td><td>32"</td><td>43"</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </>
  , document.body);
}