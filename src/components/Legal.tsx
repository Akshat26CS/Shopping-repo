import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X, Scale, ShieldCheck, Truck } from 'lucide-react';

const LEGAL_TABS = [
  { id: 'terms', label: 'Terms of Service', icon: Scale },
  { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
  { id: 'shipping', label: 'Shipping & Returns', icon: Truck },
];

export function Legal({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('terms');

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    if (containerRef.current && contentRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      gsap.fromTo(contentRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.1 });
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    if (containerRef.current && contentRef.current) {
      gsap.to(contentRef.current, { y: 50, opacity: 0, duration: 0.4, ease: "power3.in" });
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        delay: 0.1,
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div 
        ref={contentRef}
        data-lenis-prevent="true"
        className="bg-[#121212] w-full max-w-[900px] min-h-[80vh] max-h-[90vh] border border-[#2a2a2a] rounded-xl shadow-2xl flex flex-col md:flex-row relative overflow-hidden"
      >
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <h2 className="text-[20px] font-serif tracking-[-0.5px]">Legal Hub</h2>
          <button onClick={handleClose} className="text-[#A9A9A9] hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="w-full md:w-[280px] bg-[#161616] border-r border-[#2a2a2a] flex flex-col shrink-0">
          <div className="hidden md:flex items-center justify-between p-8 pb-4">
            <div>
              <h2 className="text-[28px] font-serif tracking-[-0.5px]">Legal Hub</h2>
              <p className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] mt-2">Vandana Haute Couture</p>
            </div>
          </div>

          <div className="flex md:flex-col overflow-x-auto md:overflow-visible p-4 md:p-6 gap-2 border-b md:border-b-0 border-[#2a2a2a]">
            {LEGAL_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
                    isActive 
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' 
                    : 'text-[#A9A9A9] hover:bg-[#1a1a1a] hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[13px] font-medium tracking-[0.5px]">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex mt-auto p-6 border-t border-[#2a2a2a]">
            <button 
              onClick={handleClose}
              className="flex items-center gap-2 text-[12px] text-[#A9A9A9] hover:text-white transition-colors uppercase tracking-[1px]"
            >
              &larr; Return to Store
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#121212] relative">
          {/* Desktop Close Button */}
          <button 
            onClick={handleClose} 
            className="absolute top-6 right-6 hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-[#1a1a1a] text-[#A9A9A9] hover:text-white hover:bg-[#2a2a2a] transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-[600px] pb-12 prose prose-invert prose-headings:font-serif prose-p:text-[#A9A9A9] prose-p:text-[14px] prose-p:leading-relaxed">
            
            {activeTab === 'terms' && (
              <div className="animate-fade-in">
                <h1 className="text-[32px] mb-2 font-light">Terms of Service</h1>
                <p className="text-[11px] uppercase tracking-[2px] text-[#D4AF37] mb-8">Last Updated: April 2026</p>
                
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing and placing an order with Vandana Haute Couture, you confirm that you are in agreement with and bound by the terms of service contained herein.</p>
                
                <h3>2. Bespoke Orders</h3>
                <p>All custom-tailored and bespoke bridal pieces require a 50% non-refundable deposit upfront. Due to the highly personalized nature of these garments, changes to the design cannot be made once the weaving and embroidery processes have commenced in our ateliers.</p>
                
                <h3>3. Intellectual Property</h3>
                <p>All designs, silhouettes, embroidery patterns, and website content are the exclusive intellectual property of Vandana Haute Couture. Unauthorized reproduction is strictly prohibited and protected by international copyright laws.</p>
                
                <h3>4. Pricing and Payments</h3>
                <p>Prices are subject to change without notice. We reserve the right to refuse or cancel orders at our sole discretion. In the event of a cancellation on our part, a full refund will be issued.</p>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="animate-fade-in">
                <h1 className="text-[32px] mb-2 font-light">Privacy Policy</h1>
                <p className="text-[11px] uppercase tracking-[2px] text-[#D4AF37] mb-8">Last Updated: April 2026</p>
                
                <h3>1. Information Collection</h3>
                <p>We collect information necessary to process your orders and provide a highly personalized haute couture experience. This includes your name, shipping address, contact details, and precise body measurements for custom orders.</p>
                
                <h3>2. Use of Information</h3>
                <p>Your data is used strictly for fulfilling your orders, processing payments via our secure gateways, and communicating updates regarding your bespoke pieces. We do not sell or share your personal data with third-party marketers.</p>
                
                <h3>3. Data Security</h3>
                <p>We implement state-of-the-art security measures to maintain the safety of your personal information. All measurement profiles and payment details are encrypted.</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="animate-fade-in">
                <h1 className="text-[32px] mb-2 font-light">Shipping & Returns</h1>
                <p className="text-[11px] uppercase tracking-[2px] text-[#D4AF37] mb-8">Global Shipping Policy</p>
                
                <h3>1. Standard vs. Bespoke Timelines</h3>
                <p>Ready-to-wear collections are dispatched within 5-7 business days. Custom tailored items require 3-4 weeks. Bespoke bridal orders necessitate 8-10 weeks of meticulous craftsmanship before dispatch.</p>
                
                <h3>2. Shipping Partners</h3>
                <p>We partner exclusively with premium logistics providers (DHL Express, FedEx Priority) to ensure the safe global transit of your luxury garments. All shipments are fully insured until signed for upon delivery.</p>
                
                <h3>3. Return Policy</h3>
                <p>Due to the intricate hand-crafted nature of our garments, returns are only accepted on standard-sized, unworn items with all security tags attached within 7 days of delivery. <strong>Custom and bespoke orders are strictly final sale.</strong></p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
