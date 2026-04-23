import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    title: "Orders & Shipping",
    items: [
      {
        question: "How long will my custom order take to arrive?",
        answer: "As each Vandana piece is meticulously handcrafted in our ateliers, standard delivery takes 3-4 weeks. For bespoke bridal collections, please allow 8-10 weeks for delivery."
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship globally via trusted luxury couriers (DHL Express, FedEx). International shipping typically takes 5-7 business days once the garment is dispatched. Customs duties may apply depending on your region."
      },
      {
        question: "Can I track my order?",
        answer: "Absolutely. Once your order leaves our atelier, you will receive an email with a secure tracking link to monitor its journey."
      }
    ]
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        question: "What is your return policy?",
        answer: "We accept returns on ready-to-wear items within 7 days of delivery, provided the security tag remains intact and the garment is unworn. Bespoke and custom-tailored pieces are non-refundable."
      },
      {
        question: "How do I initiate an exchange?",
        answer: "Please contact our client services team via the Contact Us page or email support@vandanacouture.com. We will arrange a complimentary pickup for your exchange."
      }
    ]
  },
  {
    title: "Product & Care",
    items: [
      {
        question: "How should I care for my Vandana garments?",
        answer: "All our garments feature intricate hand-embroidery and delicate fabrics like Organza and Pure Silk. We strongly recommend professional dry cleaning only. Store garments in the provided muslin bags away from direct sunlight."
      },
      {
        question: "Do you offer custom tailoring?",
        answer: "Yes, our 'Custom' size option allows you to provide exact measurements. Upon selecting 'Custom' during checkout, an atelier representative will contact you for precise fitting details."
      }
    ]
  }
];

export function Faqs({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>(null);

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

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  // Filter logic based on search query
  const filteredData = FAQ_DATA.map(category => {
    const filteredItems = category.items.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, items: filteredItems };
  }).filter(category => category.items.length > 0);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div 
        ref={contentRef}
        className="bg-[#121212] w-full max-w-[800px] min-h-[70vh] max-h-[90vh] border border-[#2a2a2a] rounded-xl shadow-2xl flex flex-col relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a] sticky top-0 bg-[#121212] z-10">
          <div>
            <h2 className="text-[24px] md:text-[32px] font-serif tracking-[-0.5px]">Help Center</h2>
            <p className="text-[11px] uppercase tracking-[2px] text-[#A9A9A9] mt-1">Frequently Asked Questions</p>
          </div>
          <button 
            onClick={handleClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1a] text-[#A9A9A9] hover:text-white hover:bg-[#2a2a2a] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A9A9]" />
            <input 
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white pl-12 pr-4 py-4 rounded-lg outline-none focus:border-[#D4AF37] transition-colors text-[14px]"
            />
          </div>
        </div>

        {/* FAQ Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {filteredData.length === 0 ? (
            <div className="text-center py-12 text-[#A9A9A9]">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-[14px]">No results found for "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-[#D4AF37] text-[12px] uppercase tracking-[1px] mt-4 hover:text-white transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredData.map((category, catIdx) => (
                <div key={catIdx}>
                  <h3 className="text-[12px] uppercase tracking-[2px] font-semibold text-[#D4AF37] mb-4 pl-2 border-l-2 border-[#D4AF37]">
                    {category.title}
                  </h3>
                  <div className="space-y-3">
                    {category.items.map((item, itemIdx) => {
                      const id = `${catIdx}-${itemIdx}`;
                      const isOpen = openIndex === id;
                      return (
                        <div key={id} className="border border-[#2a2a2a] rounded-lg overflow-hidden bg-[#161616]">
                          <button 
                            onClick={() => toggleAccordion(id)}
                            className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
                          >
                            <span className="text-[14px] font-medium pr-4">{item.question}</span>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-[#D4AF37] shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-[#A9A9A9] shrink-0" />
                            )}
                          </button>
                          <div 
                            className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${
                              isOpen ? 'max-h-[500px] py-4 border-t border-[#2a2a2a]' : 'max-h-0 py-0'
                            }`}
                          >
                            <p className="text-[13px] text-[#A9A9A9] leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-[#2a2a2a] bg-[#161616] mt-auto">
           <p className="text-[12px] text-center text-[#A9A9A9]">
             Still have questions? <a href="#contact" onClick={handleClose} className="text-[#D4AF37] hover:underline">Contact our support team</a>
           </p>
        </div>
      </div>
    </div>
  );
}
