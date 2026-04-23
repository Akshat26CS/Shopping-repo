import { useRef, MouseEvent, useState, useMemo, useEffect } from 'react';
import gsap from 'gsap';

export function GridCard({ 
  title, 
  subtitle, 
  imageSrc, 
  className = "",
  variations = [],
  onExplore
}: { 
  title: string; 
  subtitle: string; 
  imageSrc: string;
  className?: string;
  variations?: string[];
  onExplore?: () => void;
}) {
  const [showVariations, setShowVariations] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Use gsap.quickTo for MASSIVE performance gains on mousemove (bypasses object creation and full ticker checks)
  const xToCard = useMemo(() => gsap.quickTo(cardRef.current, "rotateY", { ease: "power3.out", duration: 0.6 }), []);
  const yToCard = useMemo(() => gsap.quickTo(cardRef.current, "rotateX", { ease: "power3.out", duration: 0.6 }), []);
  
  const xToImage = useMemo(() => gsap.quickTo(imageRef.current, "x", { ease: "power3.out", duration: 0.6 }), []);
  const yToImage = useMemo(() => gsap.quickTo(imageRef.current, "y", { ease: "power3.out", duration: 0.6 }), []);
  
  const xToContent = useMemo(() => gsap.quickTo(contentRef.current, "x", { ease: "power3.out", duration: 0.6 }), []);
  const yToContent = useMemo(() => gsap.quickTo(contentRef.current, "y", { ease: "power3.out", duration: 0.6 }), []);

  // Update targets when refs mount
  useEffect(() => {
    if (cardRef.current) gsap.set(cardRef.current, { transformPerspective: 1000 });
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    // Only calculate rect occasionally or assume it's stable if scrolling isn't happening, but for accuracy we compute:
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    // Apply quickTo instances
    if (cardRef.current) {
        xToCard(rotateY);
        yToCard(rotateX);
    }

    if (imageRef.current) {
        gsap.to(imageRef.current, { scale: 1.05, duration: 0.6, ease: "power3.out", overwrite: "auto" }); // Scale isn't quickTo mapping, standard to
        xToImage((x - centerX) * -0.02);
        yToImage((y - centerY) * -0.02);
    }

    if (contentRef.current) {
        xToContent((x - centerX) * 0.05);
        yToContent((y - centerY) * 0.05);
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      ease: "expo.out",
      duration: 1.2,
      overwrite: "auto"
    });

    if (imageRef.current) {
        gsap.to(imageRef.current, {
            x: 0,
            y: 0,
            scale: 1,
            ease: "expo.out",
            duration: 1.2,
            overwrite: "auto"
        });
    }

    if (contentRef.current) {
        gsap.to(contentRef.current, {
            x: 0,
            y: 0,
            ease: "expo.out",
            duration: 1.2,
            overwrite: "auto"
        });
    }
  };

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowVariations(!showVariations);
  };

  return (
    <div className={`relative [perspective:1000px] ${className}`}>
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[65vh] min-h-[450px] w-full cursor-pointer overflow-hidden [transform-style:preserve-3d] group"
        style={{ willChange: "transform" }}
      >
        <div className="absolute inset-0 bg-bg-dark">
          <img 
            ref={imageRef}
            src={imageSrc} 
            alt={title} 
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-80"
            style={{ willChange: "transform" }}
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/50 to-transparent pointer-events-none" />
        
        <div 
            ref={contentRef} 
            className="absolute inset-x-0 bottom-0 p-8 [transform:translateZ(30px)] transition-transform duration-500"
            style={{ willChange: "transform" }}
        >
          <div className="overflow-hidden mb-[10px]">
            <p className="text-[10px] uppercase font-sans text-text-secondary group-hover:text-text-primary transition-colors duration-300 transform translate-y-0 relative z-10">
              {subtitle}
            </p>
          </div>
          <div className="overflow-hidden">
            <h3 className="font-serif text-[24px] italic text-text-primary group-hover:text-white transition-colors duration-300 relative z-10">
              {title}
            </h3>
          </div>
          
          <div className="mt-[15px] flex items-center justify-between w-full lg:opacity-0 lg:-translate-x-4 opacity-100 translate-x-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 lg:delay-100 z-30">
             <button 
                 onClick={(e) => { e.stopPropagation(); onExplore?.(); }}
                 className="text-[10px] uppercase tracking-[1px] text-text-primary border-b border-text-primary pb-[2px] inline-block pointer-events-auto hover:text-gold hover:border-gold transition-colors cursor-pointer"
             >
                 Explore Series
             </button>
             {variations.length > 0 && (
               <button 
                 onClick={handleToggle}
                 className="text-[10px] md:text-[9px] text-gold uppercase tracking-[1px] border border-gold/30 px-[16px] md:px-[12px] py-[10px] md:py-[6px] rounded-full hover:bg-gold/10 active:bg-gold/20 active:scale-95 transition-all pointer-events-auto z-20"
               >
                 {showVariations ? 'Close Guide —' : 'Styling Guide +'}
               </button>
             )}
          </div>

          <div className={`overflow-hidden transition-all duration-500 ease-in-out w-full ${showVariations ? 'max-h-[250px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
             <div className="pt-4 border-t border-border-dark flex flex-col gap-3">
               <p className="text-[9px] uppercase tracking-[2px] text-text-secondary">Signature Styling Maps</p>
               <ul className="flex flex-col gap-2">
                 {variations.map((variant, idx) => (
                   <li key={idx} className="text-[11px] font-sans text-text-primary flex items-center gap-3 tracking-[0.5px]">
                     <span className="w-[3px] h-[3px] bg-gold rounded-full"></span> {variant}
                   </li>
                 ))}
               </ul>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
