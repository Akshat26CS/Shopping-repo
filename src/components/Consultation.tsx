import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, Mail, Phone, Calendar } from 'lucide-react';

export function Consultation({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    if (containerRef.current && contentRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      gsap.fromTo(contentRef.current, { scale: 0.95, y: 20, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.1 });
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    if (containerRef.current && contentRef.current) {
      gsap.to(contentRef.current, { scale: 0.95, y: 20, opacity: 0, duration: 0.3, ease: "power3.in" });
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        delay: 0.1,
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
      <div 
        ref={contentRef}
        className="bg-[#121212] w-full max-w-[450px] border border-[#2a2a2a] rounded-2xl shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[150px] bg-gradient-to-b from-[#D4AF37]/10 to-transparent pointer-events-none"></div>

        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1a] text-[#A9A9A9] hover:text-white hover:bg-[#2a2a2a] transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-12 text-center relative z-10">
          <div className="w-16 h-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-[#D4AF37]" />
          </div>
          
          <h2 className="text-[28px] font-serif tracking-[-0.5px] mb-2 text-white">Book a Consultation</h2>
          <p className="text-[14px] text-[#A9A9A9] mb-8 leading-relaxed">
            Our atelier provides private, bespoke fittings and personalized design consultations. Reach out to our master tailors to schedule your appointment.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-[#161616] border border-[#2a2a2a] p-4 rounded-xl hover:border-[#D4AF37]/50 transition-colors group cursor-pointer" onClick={() => window.location.href = "mailto:atelier@vandana.com"}>
              <Mail className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9]">Email Us</p>
                <p className="text-[14px] font-medium text-white group-hover:text-[#D4AF37] transition-colors">atelier@vandana.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[#161616] border border-[#2a2a2a] p-4 rounded-xl hover:border-[#D4AF37]/50 transition-colors group cursor-pointer" onClick={() => window.open('https://wa.me/919876543210', '_blank')}>
              <Phone className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9]">WhatsApp / Call</p>
                <p className="text-[14px] font-medium text-white group-hover:text-[#D4AF37] transition-colors">+91 98765 43210</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="w-full py-4 mt-8 bg-[#D4AF37] text-black text-[12px] uppercase tracking-[2px] font-bold rounded-xl hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
