import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import { ProductDetails } from './ProductDetails';

interface CategoryItem {
  title: string;
  imageSrc: string;
  price: number;
}

const CATEGORY_DATA: Record<string, CategoryItem[]> = {
  Sarees: [
    { title: 'Banarasi Silk', imageSrc: 'https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?q=80&w=400&auto=format&fit=crop', price: 85000 },
    { title: 'Kanjeevaram', imageSrc: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop', price: 120000 },
    { title: 'Chiffon', imageSrc: 'https://images.unsplash.com/photo-1679006831648-7c9ea12e5807?q=80&w=400&auto=format&fit=crop', price: 45000 },
    { title: 'Georgette', imageSrc: 'https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9?q=80&w=400&auto=format&fit=crop', price: 55000 },
    { title: 'Organza', imageSrc: 'https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb?q=80&w=400&auto=format&fit=crop', price: 65000 },
    { title: 'Designer', imageSrc: 'https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?q=80&w=400&auto=format&fit=crop', price: 180000 },
  ],
  Kurtis: [
    { title: 'Everyday Wear', imageSrc: 'https://images.unsplash.com/photo-1741847639057-b51a25d42892?q=80&w=400&auto=format&fit=crop', price: 12000 },
    { title: 'Anarkali', imageSrc: 'https://images.unsplash.com/photo-1745313452052-0e4e341f326c?q=80&w=400&auto=format&fit=crop', price: 35000 },
    { title: 'Short Kurtis', imageSrc: 'https://images.unsplash.com/photo-1708534419572-6e6614a53ca1?q=80&w=400&auto=format&fit=crop', price: 8500 },
    { title: 'Festive Sets', imageSrc: 'https://images.unsplash.com/photo-1668371679302-a8ec781e876e?q=80&w=400&auto=format&fit=crop', price: 48000 },
  ],
  'Ethnic Dresses': [
    { title: 'Indo-Western Gowns', imageSrc: 'https://images.unsplash.com/photo-1656574781686-40935ee15db5?q=80&w=400&auto=format&fit=crop', price: 145000 },
    { title: 'Maxi Dresses', imageSrc: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=400&auto=format&fit=crop', price: 28000 },
    { title: 'Co-ord Sets', imageSrc: 'https://images.unsplash.com/photo-1686173554823-0e25d1d6e45f?q=80&w=400&auto=format&fit=crop', price: 22000 },
  ]
};

export function AllCollections({ onClose, scrollToCategory }: { onClose: () => void; scrollToCategory?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<CategoryItem | null>(null);

  useEffect(() => {
    // Scroll to top when mounted
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Stop body scroll for background
    document.body.style.overflow = 'hidden';

    if (containerRef.current) {
      const overlay = containerRef.current;
      
      // Ultra-smooth Entrance: Fade container, slide contents
      gsap.fromTo(overlay, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );

      // Header entrance
      const header = overlay.querySelector('header');
      gsap.fromTo(header,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.1 }
      );

      // Title entrance
      const texts = overlay.querySelectorAll('h1, p');
      gsap.fromTo(texts,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
      );

      const cards = containerRef.current.querySelectorAll('.collection-card');
      
      // Removed expensive scale transformations, simple performant slide-up
      gsap.fromTo(cards, 
        { y: 40, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.03, 
          ease: "power2.out",
          delay: 0.3,
          onComplete: () => {
            // After entrance animation, scroll to the target category if provided
            if (scrollToCategory && containerRef.current) {
              const sectionId = `category-${scrollToCategory.toLowerCase().replace(/\s+/g, '-')}`;
              const targetSection = containerRef.current.querySelector(`#${sectionId}`);
              if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          }
        }
      );
    }

    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [scrollToCategory]);

  const handleClose = () => {
    if (containerRef.current) {
        gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: onClose
        });
    } else {
        onClose();
    }
  };

  return (
    <div 
        ref={containerRef} 
        className="fixed inset-0 z-[100] bg-[#121212] text-white w-full h-[100dvh] overflow-y-auto overflow-x-hidden selection:bg-[#D4AF37] selection:text-black"
        style={{ willChange: "transform", WebkitOverflowScrolling: "touch" }}
        data-lenis-prevent="true"
    >
      {/* 1. Minimalist Header & Breadcrumbs */}
      <header className="sticky top-0 left-0 w-full z-50 h-[80px] px-6 lg:px-[60px] flex justify-between items-center bg-[#121212] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleClose}
            className="text-[11px] tracking-[2px] uppercase hover:text-[#D4AF37] active:scale-95 transition-all"
          >
            &larr; Back
          </button>
          <div className="w-[1px] h-4 bg-[#2a2a2a] hidden sm:block"></div>
          <div className="text-[10px] uppercase tracking-[3px] text-[#A9A9A9] hidden sm:block">
            <span className="cursor-pointer hover:text-white transition-colors" onClick={handleClose}>Home</span> 
            <span className="mx-2">/</span> 
            <span className="cursor-pointer hover:text-white transition-colors">Collections</span>
            <span className="mx-2">/</span>
            <span className="text-white">All</span>
          </div>
        </div>
        <div className="font-serif text-[20px] tracking-[4px] uppercase text-white">
            VANDANA
        </div>
      </header>

      <main className="py-[100px] px-6 lg:px-[80px] max-w-[1800px] mx-auto min-h-screen">
        <div className="mb-20">
          <h1 className="font-serif text-[40px] md:text-[64px] font-light tracking-[-1px] mb-4">All Collections</h1>
          <p className="text-[13px] text-[#A9A9A9] tracking-[1px] uppercase">Curated lines for the modern wearer</p>
        </div>

        {/* Categories Sections */}
        <div className="flex flex-col gap-24 group/grid"> 
          {/* group/grid used for parent hovering to dim all cards */}
          {Object.entries(CATEGORY_DATA).map(([category, items]) => (
            <section key={category} id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex items-end justify-between mb-8 pb-4 border-b border-[#2a2a2a]">
                <h2 className="font-serif text-[32px] font-light text-white">{category}</h2>
                <span className="text-[10px] tracking-[2px] uppercase text-[#A9A9A9]">{items.length} Series</span>
              </div>
              
              {/* Dense Small Card CSS Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
                {items.map((item, idx) => (
                    <div 
                    key={idx} 
                    onClick={() => setSelectedProduct(item)}
                    className="collection-card opacity-0 group overflow-hidden relative cursor-pointer aspect-[4/5] bg-black hover:!opacity-100 group-hover/grid:opacity-40 transition-opacity duration-500"
                    style={{ willChange: "transform, opacity" }}
                  >
                    <div className="absolute inset-0 bg-[#000000]">
                        <img 
                            src={item.imageSrc} 
                            alt={item.title} 
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover md:grayscale-[40%] opacity-70 group-hover:scale-105 md:group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-out"
                            style={{ willChange: "transform" }}
                        />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500 pointer-events-none"></div>
                    
                    <div className="absolute inset-x-0 bottom-0 p-5 transform group-hover:-translate-y-2 transition-transform duration-500 ease-out flex flex-col justify-end">
                      <h3 className="font-sans text-[12px] md:text-[14px] font-medium tracking-[0.5px] text-white">
                        {item.title}
                      </h3>
                      
                      {/* The sliding arrow text */}
                      <div className="overflow-hidden mt-2">
                        <p className="text-[#A9A9A9] text-[9px] uppercase tracking-[1px] transform translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-out flex items-center gap-2">
                          View Collection <span className="text-[#D4AF37]">&rarr;</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <ProductDetails 
            item={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
