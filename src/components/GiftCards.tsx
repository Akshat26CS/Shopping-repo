import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X, Gift, Send, ChevronRight, Sparkles, Heart, Star, Sun } from 'lucide-react';

interface GiftCardDesign {
  id: string;
  name: string;
  gradient: string;
  pattern: string;
  accent: string;
  icon: typeof Gift;
}

const CARD_DESIGNS: GiftCardDesign[] = [
  {
    id: 'gold-luxe',
    name: 'Golden Luxe',
    gradient: 'linear-gradient(135deg, #1a1507 0%, #2a2009 30%, #3d2f0a 60%, #1a1507 100%)',
    pattern: 'radial-gradient(ellipse at 20% 50%, rgba(212,175,55,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(212,175,55,0.1) 0%, transparent 40%)',
    accent: '#D4AF37',
    icon: Sparkles,
  },
  {
    id: 'rose-petal',
    name: 'Rose Petal',
    gradient: 'linear-gradient(135deg, #1a0a10 0%, #2d1020 30%, #3d1530 60%, #1a0a10 100%)',
    pattern: 'radial-gradient(ellipse at 30% 70%, rgba(220,100,140,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(255,150,180,0.08) 0%, transparent 40%)',
    accent: '#E8728A',
    icon: Heart,
  },
  {
    id: 'midnight',
    name: 'Midnight Noir',
    gradient: 'linear-gradient(135deg, #080812 0%, #0d0d24 30%, #151540 60%, #080812 100%)',
    pattern: 'radial-gradient(ellipse at 25% 40%, rgba(100,120,255,0.1) 0%, transparent 50%), radial-gradient(ellipse at 75% 60%, rgba(150,100,255,0.08) 0%, transparent 40%)',
    accent: '#8B9CF7',
    icon: Star,
  },
  {
    id: 'festive',
    name: 'Festive Bloom',
    gradient: 'linear-gradient(135deg, #0f1a0a 0%, #1a2d10 30%, #254015 60%, #0f1a0a 100%)',
    pattern: 'radial-gradient(ellipse at 40% 30%, rgba(120,200,80,0.1) 0%, transparent 50%), radial-gradient(ellipse at 60% 70%, rgba(212,175,55,0.08) 0%, transparent 40%)',
    accent: '#A8D86E',
    icon: Sun,
  },
];

const DENOMINATIONS = [500, 1000, 2000, 5000, 10000];

export function GiftCards({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDesign, setSelectedDesign] = useState<GiftCardDesign>(CARD_DESIGNS[0]);
  const [selectedAmount, setSelectedAmount] = useState<number>(2000);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.style.overflow = 'hidden';

    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });

      const sections = containerRef.current.querySelectorAll('.gc-animate');
      gsap.fromTo(sections,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'expo.out', delay: 0.15 }
      );
    }

    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleClose = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, { opacity: 0, duration: 0.35, ease: 'power2.inOut', onComplete: onClose });
    } else onClose();
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    if (hoveredCard !== cardId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const finalAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] text-white w-full h-[100dvh] overflow-y-auto overflow-x-hidden selection:bg-[#D4AF37] selection:text-black"
      style={{ willChange: 'transform', WebkitOverflowScrolling: 'touch' }}
      data-lenis-prevent="true"
    >
      <style>{`
        @keyframes gcShimmer {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(200%) rotate(25deg); }
        }
        @keyframes gcFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes gcPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .gc-card-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 60%);
          animation: gcShimmer 4s ease-in-out infinite;
          pointer-events: none;
          z-index: 2;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 left-0 w-full z-50 h-[80px] px-6 lg:px-[60px] flex justify-between items-center bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="flex items-center gap-4">
          <button onClick={handleClose} className="text-[11px] tracking-[2px] uppercase hover:text-[#D4AF37] active:scale-95 transition-all">&larr; Back</button>
          <div className="w-[1px] h-4 bg-[#2a2a2a] hidden sm:block" />
          <div className="text-[10px] uppercase tracking-[3px] text-[#A9A9A9] hidden sm:block">
            <span className="cursor-pointer hover:text-white transition-colors" onClick={handleClose}>Home</span>
            <span className="mx-2">/</span>
            <span className="text-white">Gift Cards</span>
          </div>
        </div>
        <div className="font-serif text-[20px] tracking-[4px] uppercase text-white">VANDANA</div>
      </header>

      <main className="py-[60px] px-6 lg:px-[80px] max-w-[1200px] mx-auto min-h-screen">

        {/* Hero */}
        <div className="gc-animate mb-16 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5">
            <Gift className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[3px] text-[#D4AF37]">The Gift of Elegance</span>
          </div>
          <h1 className="font-serif text-[40px] md:text-[72px] font-light tracking-[-2px] mb-5 leading-[1]">
            Gift <span className="italic" style={{ background: 'linear-gradient(135deg, #D4AF37, #F5E6A3, #D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Cards</span>
          </h1>
          <p className="text-[13px] text-[#666] max-w-[480px] mx-auto leading-[1.8]">
            Give the gift of choice. Let them pick their perfect piece from our curated collections of heritage silks and contemporary designs.
          </p>
        </div>

        {/* Step 1: Choose Design */}
        <section className="gc-animate mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-[12px] font-bold">1</div>
            <h2 className="font-serif text-[24px] font-light">Choose a Design</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CARD_DESIGNS.map((card) => {
              const isSelected = selectedDesign.id === card.id;
              const isHovered = hoveredCard === card.id;
              const tiltX = isHovered ? (mousePos.y - 0.5) * -20 : 0;
              const tiltY = isHovered ? (mousePos.x - 0.5) * 20 : 0;
              const IconComp = card.icon;

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedDesign(card)}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => { setHoveredCard(null); setMousePos({ x: 0.5, y: 0.5 }); }}
                  onMouseMove={(e) => handleCardMouseMove(e, card.id)}
                  className={`gc-card-shimmer relative cursor-pointer rounded-2xl overflow-hidden aspect-[16/10] transition-all duration-300 ${isSelected ? '' : 'hover:scale-[1.02]'}`}
                  style={{
                    background: card.gradient,
                    perspective: '800px',
                    transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                    transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
                    boxShadow: isSelected ? `0 0 30px ${card.accent}20, 0 0 0 2px ${card.accent}` : 'none',
                    outlineOffset: '3px',
                  }}
                >
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 z-[1]" style={{ background: card.pattern }} />

                  {/* Card Content */}
                  <div className="relative z-[3] h-full flex flex-col justify-between p-5">
                    <div className="flex justify-between items-start">
                      <span className="font-serif text-[16px] tracking-[3px] uppercase opacity-80">VANDANA</span>
                      <IconComp className="w-5 h-5 opacity-60" style={{ color: card.accent }} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[2px] opacity-50 mb-1">Gift Card</p>
                      <p className="text-[13px] font-medium" style={{ color: card.accent }}>{card.name}</p>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-[4] w-6 h-6 rounded-full flex items-center justify-center" style={{ background: card.accent }}>
                      <span className="text-black text-[11px] font-bold">✓</span>
                    </div>
                  )}

                  {/* Shine highlight on hover */}
                  {isHovered && (
                    <div
                      className="absolute inset-0 z-[3] pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.06) 0%, transparent 50%)`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 2: Select Amount */}
        <section className="gc-animate mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-[12px] font-bold">2</div>
            <h2 className="font-serif text-[24px] font-light">Select Amount</h2>
          </div>
          <div className="flex flex-wrap gap-3 mb-5">
            {DENOMINATIONS.map((amt) => (
              <button
                key={amt}
                onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                className={`px-6 py-3 rounded-xl text-[14px] font-medium border transition-all duration-300 ${
                  selectedAmount === amt && !customAmount
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                    : 'bg-[#111] border-[#222] text-white hover:border-[#D4AF37]/40 hover:bg-[#141410]'
                }`}
              >
                ₹{amt.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#555] uppercase tracking-[1px]">or enter custom</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555] text-[14px]">₹</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Amount"
                className="bg-[#111] border border-[#222] rounded-xl pl-8 pr-4 py-3 text-[14px] text-white w-[160px] outline-none focus:border-[#D4AF37] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </section>

        {/* Step 3: Personalize */}
        <section className="gc-animate mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-[12px] font-bold">3</div>
            <h2 className="font-serif text-[24px] font-light">Personalize Your Gift</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] uppercase tracking-[2px] text-[#555] block mb-2">Recipient's Name</label>
              <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Who is this for?" className="w-full bg-[#111] border border-[#222] text-white px-5 py-4 text-[14px] rounded-xl outline-none focus:border-[#D4AF37] transition-colors" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[2px] text-[#555] block mb-2">Recipient's Email</label>
              <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="their@email.com" className="w-full bg-[#111] border border-[#222] text-white px-5 py-4 text-[14px] rounded-xl outline-none focus:border-[#D4AF37] transition-colors" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[2px] text-[#555] block mb-2">Your Name</label>
              <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="From..." className="w-full bg-[#111] border border-[#222] text-white px-5 py-4 text-[14px] rounded-xl outline-none focus:border-[#D4AF37] transition-colors" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[2px] text-[#555] block mb-2">Personal Message</label>
              <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add a special note..." className="w-full bg-[#111] border border-[#222] text-white px-5 py-4 text-[14px] rounded-xl outline-none focus:border-[#D4AF37] transition-colors" />
            </div>
          </div>
        </section>

        {/* Live Preview + CTA */}
        <section className="gc-animate mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-[12px] font-bold">4</div>
            <h2 className="font-serif text-[24px] font-light">Preview & Send</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Live preview card */}
            <div className="w-full lg:w-[480px] flex-shrink-0">
              <div
                className="gc-card-shimmer relative rounded-2xl overflow-hidden aspect-[16/10]"
                style={{
                  background: selectedDesign.gradient,
                  boxShadow: `0 20px 60px ${selectedDesign.accent}15, 0 0 1px ${selectedDesign.accent}30`,
                  animation: 'gcFloat 5s ease-in-out infinite',
                }}
              >
                <div className="absolute inset-0 z-[1]" style={{ background: selectedDesign.pattern }} />
                <div className="relative z-[3] h-full flex flex-col justify-between p-6 md:p-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-serif text-[18px] md:text-[22px] tracking-[4px] uppercase opacity-80">VANDANA</span>
                      <p className="text-[9px] uppercase tracking-[2px] opacity-40 mt-1">Haute Couture Gift Card</p>
                    </div>
                    <selectedDesign.icon className="w-6 h-6 opacity-50" style={{ color: selectedDesign.accent }} />
                  </div>
                  <div>
                    <p className="font-serif text-[32px] md:text-[40px] font-light mb-1" style={{ color: selectedDesign.accent }}>
                      ₹{finalAmount > 0 ? finalAmount.toLocaleString() : '—'}
                    </p>
                    {recipientName && <p className="text-[12px] opacity-60">For {recipientName}</p>}
                    {senderName && <p className="text-[10px] opacity-40 mt-1">With love from {senderName}</p>}
                  </div>
                </div>
              </div>
              {message && (
                <div className="mt-4 p-4 bg-[#111] border border-[#1a1a1a] rounded-xl">
                  <p className="text-[10px] uppercase tracking-[2px] text-[#555] mb-2">Personal Message</p>
                  <p className="text-[13px] text-[#999] italic leading-[1.6]">"{message}"</p>
                </div>
              )}
            </div>

            {/* Summary + Send */}
            <div className="flex-1 w-full">
              <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6 md:p-8">
                <h3 className="font-serif text-[20px] mb-6">Order Summary</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-[#1a1a1a]">
                    <span className="text-[12px] text-[#666] uppercase tracking-[1px]">Design</span>
                    <span className="text-[13px]" style={{ color: selectedDesign.accent }}>{selectedDesign.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#1a1a1a]">
                    <span className="text-[12px] text-[#666] uppercase tracking-[1px]">Amount</span>
                    <span className="text-[13px] text-white">₹{finalAmount > 0 ? finalAmount.toLocaleString() : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#1a1a1a]">
                    <span className="text-[12px] text-[#666] uppercase tracking-[1px]">To</span>
                    <span className="text-[13px] text-white">{recipientName || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#1a1a1a]">
                    <span className="text-[12px] text-[#666] uppercase tracking-[1px]">Delivery</span>
                    <span className="text-[13px] text-white">{recipientEmail || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[14px] font-medium text-white">Total</span>
                    <span className="text-[20px] font-serif" style={{ color: selectedDesign.accent }}>₹{finalAmount > 0 ? finalAmount.toLocaleString() : '0'}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!recipientName || !recipientEmail || finalAmount <= 0) {
                      alert('Please fill in all required fields and select an amount.');
                      return;
                    }
                    setShowPreview(true);
                    setTimeout(() => {
                      alert(`🎉 Gift card of ₹${finalAmount.toLocaleString()} sent to ${recipientName} at ${recipientEmail}!`);
                      setShowPreview(false);
                    }, 500);
                  }}
                  className="w-full py-4 bg-[#D4AF37] text-black text-[12px] uppercase tracking-[3px] font-bold rounded-xl hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Send className="w-4 h-4" />
                  Send Gift Card
                </button>
                <p className="text-[10px] text-[#444] text-center mt-4">Delivered instantly via email. Valid for 12 months.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
