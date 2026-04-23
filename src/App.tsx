import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { supabase } from './lib/supabase';
import { ThreeFabric } from './components/ThreeFabric';
import { GridCard } from './components/GridCard';
import { MagneticButton } from './components/MagneticButton';
import { AllCollections } from './components/AllCollections';
import { OrderHistory } from './components/OrderHistory';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';
import { UserDashboard } from './components/UserDashboard';
import { Cart } from './components/Cart';
import { Wishlist } from './components/Wishlist';
import { GiftCards } from './components/GiftCards';
import { Faqs } from './components/Faqs';
import { Legal } from './components/Legal';
import { User, LogOut, Menu, ShoppingBag, Heart, X, Package, Bookmark, CreditCard, MapPin, Ticket, ChevronRight, UserCircle, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ force3D: true });

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const horizontalWrapRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const footerTitleRef = useRef<HTMLHeadingElement>(null);
  const [showCollections, setShowCollections] = useState(false);
  const [collectionsScrollTarget, setCollectionsScrollTarget] = useState<string | undefined>(undefined);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showAccountPage, setShowAccountPage] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showGiftCards, setShowGiftCards] = useState(false);
  const [showFaqs, setShowFaqs] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  
  // State for Profile Details Modal
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // State for Edit Profile Functionality
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    alternate_phone: '',
    gender: '',
    birthday: ''
  });

  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from('test').select('*');
      console.log("DATA:", data);
      console.log("ERROR:", error);
    };

    test();
  }, []);

  // Fetch user profile data from Supabase 
  useEffect(() => {
    if (userEmail) {
      const fetchProfile = async () => {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', userEmail)
          .single();
        
        if (!error && data) {
          setUserProfile(data);
          // Initialize edit form data
          setEditFormData({
            name: data.name || '',
            phone: data.phone || '',
            alternate_phone: data.alternate_phone || '',
            gender: data.gender || '',
            birthday: data.birthday || ''
          });
        }
        setLoadingProfile(false);
      };
      fetchProfile();
    } else {
      setUserProfile(null);
    }
  }, [userEmail]);

  // Function to handle saving profile updates to Supabase
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase
        .from('users')
        .update({
            name: editFormData.name,
            phone: editFormData.phone,
            alternate_phone: editFormData.alternate_phone,
            gender: editFormData.gender,
            birthday: editFormData.birthday
        })
        .eq('email', userEmail);
    
    if (!error) {
        // Update local state immediately to reflect changes
        setUserProfile({ ...userProfile, ...editFormData });
        setIsEditingProfile(false); // Close edit mode
    } else {
        alert('Failed to update profile. Ensure your database has the new columns.');
        console.error(error);
    }
    setSavingProfile(false);
  };

  useEffect(() => {
    // 1. Initialize Lenis (Smooth Scroll)
    const lenis = new Lenis({
      lerp: 0.05, // Uses linear interpolation for incredibly smooth, buttery physics
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothWheel: true,
      syncTouch: false,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    
    // Disable lag smoothing to prevent physics desync between scrolling and scroll-bound animations
    gsap.ticker.lagSmoothing(0);

    const isMobile = window.innerWidth <= 768;
    const scrubValue = isMobile ? true : 1.5;

    // 2. Initial Hero Reveal Animation
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroTitleRef.current && heroSubtitleRef.current) {
        const titleChars = Array.from(heroTitleRef.current.children);
        
        tl.fromTo(titleChars, 
            { y: '100%', opacity: 0, rotateX: 90, z: -200 }, 
            { y: '0%', opacity: 1, rotateX: 0, z: 0, duration: 1.8, stagger: 0.1, delay: 0.3, ease: 'expo.out' }
        )
        .fromTo(heroSubtitleRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2 },
            "-=1.2"
        );
    }

    // 3. Horizontal Scroll Section (Pinned)
    if (horizontalWrapRef.current && horizontalScrollRef.current) {
        const wrap = horizontalWrapRef.current;
        const scroll = horizontalScrollRef.current;
        
        // Calculate the total scroll distance needed
        const getScrollAmount = () => -(scroll.scrollWidth - window.innerWidth);

        gsap.to(scroll, {
            x: getScrollAmount,
            ease: "none",
            scrollTrigger: {
                trigger: wrap,
                start: "top top",
                end: () => `+=${scroll.scrollWidth}`, // scroll for the length of the container
                pin: true,
                scrub: scrubValue, // Reduced for snappier mobile feel while remaining smooth
                invalidateOnRefresh: true
            }
        });

        // Add internal parallax to horizontal images
        const hImages = scroll.querySelectorAll('.h-image');
        hImages.forEach((img) => {
           gsap.to(img, {
               x: 100, // Move image to the right inside its container as it scrolls
               ease: "none",
               scrollTrigger: {
                   trigger: wrap,
                   start: "top top",
                   end: () => `+=${scroll.scrollWidth}`,
                   scrub: scrubValue,
               }
           })
        });
    }

    // 4. Transform 3D Scroll Effects
    const animate3dElements = document.querySelectorAll('.animate-3d-scroll');
    animate3dElements.forEach((el) => {
        gsap.fromTo(el,
            { rotateX: 25, rotateY: 10, scale: 0.85, opacity: 0, y: 150 },
            {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                opacity: 1,
                y: 0,
                duration: 2,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 95%",
                    end: "top 40%",
                    scrub: scrubValue
                }
            }
        );
    });

    // 5. Text Reveal on Scroll
    const textReveals = document.querySelectorAll('.text-reveal-scroll');
    textReveals.forEach((text) => {
        gsap.fromTo(text,
            { y: 60, opacity: 0, scale: 0.95 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 1.8,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: text,
                    start: "top 85%",
                }
            }
        );
    });

    // 6. Parallax Backgrounds
    const parallaxBgs = document.querySelectorAll('.parallax-bg');
    parallaxBgs.forEach((bg) => {
        gsap.fromTo(bg,
            { yPercent: -20 },
            {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: bg.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: scrubValue
                }
            }
        );
    });

    // 7. Footer Animation
    if (footerTitleRef.current) {
        gsap.fromTo(footerTitleRef.current,
            { scale: 0.9, opacity: 0, rotateX: -20 },
            {
                scale: 1,
                opacity: 1,
                rotateX: 0,
                duration: 1.5,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: footerTitleRef.current,
                    start: "top 85%",
                }
            }
        )
    }

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-bg-dark text-text-primary font-sans selection:bg-gold-muted/30">
      
      {showOrderHistory && (
        <OrderHistory userEmail={userEmail} onClose={() => setShowOrderHistory(false)} />
      )}
      {showAdminDashboard && <AdminDashboard onClose={() => setShowAdminDashboard(false)} />}
      {showUserDashboard && (
        <UserDashboard 
          userEmail={userEmail} 
          onClose={() => setShowUserDashboard(false)}
          onLogout={() => {
            setUserEmail('');
            setIsAdmin(false);
            setShowUserDashboard(false);
          }}
        />
      )}
      {showLoginPage && (
        <LoginPage 
          onUserLogin={(email) => {
            setUserEmail(email);
            setIsAdmin(false);
            setShowLoginPage(false);
          }}
          onAdminLogin={(password) => {
            setIsAdmin(true);
            setShowLoginPage(false);
            setShowAdminDashboard(true);
          }}
          onClose={() => setShowLoginPage(false)}
        />
      )}
      {showFaqs && <Faqs onClose={() => setShowFaqs(false)} />}
      {showLegal && <Legal onClose={() => setShowLegal(false)} />}

      {showHamburgerMenu && (
        <div className="fixed inset-0 z-[450] flex">
          <div data-lenis-prevent="true" className="w-[320px] max-w-[80vw] h-full bg-[#121212] border-r border-[#2a2a2a] p-6 overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[11px] uppercase tracking-[3px] text-[#A9A9A9] mb-1">Menu</p>
                <h2 className="text-[24px] font-serif tracking-[-0.5px]">VANDANA</h2>
              </div>
              <button onClick={() => setShowHamburgerMenu(false)} className="text-[#A9A9A9] hover:text-white">Close</button>
            </div>

            <div className="space-y-4 text-[13px] text-white flex-1">
              
              {/* Hello User Greeting inside the Hamburger Menu */}
              {userEmail && (
                <div className="pb-4 mb-2 border-b border-[#2a2a2a]">
                    <p className="text-[16px] text-white font-serif">
                        Hello, <span className="text-[#D4AF37] italic">{userProfile?.name ? userProfile.name.split(' ')[0] : 'User'}</span>
                    </p>
                </div>
              )}

              <button
                onClick={() => {
                  setShowHamburgerMenu(false);
                  setShowAccountPage(true);
                }}
                className="w-full text-left py-3 px-4 bg-[#181818] rounded-lg hover:bg-[#262626] transition-colors flex items-center gap-3"
              >
                <UserCircle className="w-4 h-4 text-[#D4AF37]" />
                My Account
              </button>
              <button
                onClick={() => {
                  setCollectionsScrollTarget('Sarees');
                  setShowCollections(true);
                  setShowHamburgerMenu(false);
                }}
                className="w-full text-left py-3 px-4 bg-[#181818] rounded-lg hover:bg-[#262626] transition-colors"
              >
                Sarees
              </button>
              <button
                onClick={() => {
                  setCollectionsScrollTarget('Kurtis');
                  setShowCollections(true);
                  setShowHamburgerMenu(false);
                }}
                className="w-full text-left py-3 px-4 bg-[#181818] rounded-lg hover:bg-[#262626] transition-colors"
              >
                Kurti
              </button>
              <button
                onClick={() => {
                  setCollectionsScrollTarget('Ethnic Dresses');
                  setShowCollections(true);
                  setShowHamburgerMenu(false);
                }}
                className="w-full text-left py-3 px-4 bg-[#181818] rounded-lg hover:bg-[#262626] transition-colors"
              >
                Ethnic Dresses
              </button>
              <button
                onClick={() => setShowCollections(true)}
                className="w-full text-left py-3 px-4 bg-[#181818] rounded-lg hover:bg-[#262626] transition-colors"
              >
                Home & Living
              </button>
              
              <button
                onClick={() => {
                  if (userEmail) {
                    setShowUserDashboard(true);
                    setShowHamburgerMenu(false);
                  } else {
                    setShowLoginPage(true);
                    setShowHamburgerMenu(false);
                  }
                }}
                className="w-full text-left py-3 px-4 bg-[#181818] rounded-lg hover:bg-[#262626] transition-colors"
              >
                Order
              </button>
              <button
                onClick={() => {
                  setShowGiftCards(true);
                  setShowHamburgerMenu(false);
                }}
                className="w-full text-left py-3 px-4 bg-[#181818] rounded-lg hover:bg-[#262626] transition-colors"
              >
                Gift Cards
              </button>
              <button
                onClick={() => window.location.hash = '#contact'}
                className="w-full text-left py-3 px-4 bg-[#181818] rounded-lg hover:bg-[#262626] transition-colors"
              >
                Contact Us
              </button>
              <button
                onClick={() => {
                  setShowFaqs(true);
                  setShowHamburgerMenu(false);
                }}
                className="w-full text-left py-3 px-4 bg-[#181818] rounded-lg hover:bg-[#262626] transition-colors"
              >
                FAQs
              </button>
              <button
                onClick={() => {
                  setShowLegal(true);
                  setShowHamburgerMenu(false);
                }}
                className="w-full text-left py-3 px-4 bg-[#181818] rounded-lg hover:bg-[#262626] transition-colors"
              >
                Legal
              </button>
              
              {/* ADDED: Dynamic Log In / Log Out button at the bottom most */}
              <div className="pt-4 mt-4 border-t border-[#2a2a2a]">
                {userEmail ? (
                  <button
                    onClick={() => {
                      setUserEmail('');
                      setIsAdmin(false);
                      setShowUserDashboard(false);
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full text-left py-3 px-4 bg-[#181818] text-[#D4AF37] rounded-lg hover:bg-[#262626] transition-colors flex justify-between items-center"
                  >
                    <span>Log Out</span>
                    <LogOut className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowHamburgerMenu(false);
                      setShowLoginPage(true);
                    }}
                    className="w-full text-left py-3 px-4 bg-[#181818] rounded-lg hover:bg-[#262626] transition-colors flex justify-between items-center"
                  >
                    <span>Log In</span>
                    <User className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          </div>
          <div className="flex-1" onClick={() => setShowHamburgerMenu(false)} />
        </div>
      )}

      {showCollections && (
        <AllCollections 
          onClose={() => {
            setShowCollections(false);
            setCollectionsScrollTarget(undefined);
          }} 
          scrollToCategory={collectionsScrollTarget}
        />
      )}

      {showCart && <Cart onClose={() => setShowCart(false)} />}
      {showWishlist && <Wishlist onClose={() => setShowWishlist(false)} />}
      {showGiftCards && <GiftCards onClose={() => setShowGiftCards(false)} />}

      {/* FULL PAGE: Profile Details Modal Overlay */}
      {showProfileDetails && (
        <div 
          className="fixed inset-0 z-[600] bg-[#121212] w-full h-[100dvh] overflow-y-auto selection:bg-[#D4AF37] selection:text-black"
          style={{ willChange: "transform", WebkitOverflowScrolling: "touch" }}
        >
          {/* Header matching AllCollections */}
          <header className="sticky top-0 left-0 w-full z-50 h-[80px] px-6 lg:px-[60px] flex justify-between items-center bg-[#121212]/80 backdrop-blur-xl border-b border-[#2a2a2a]">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setShowProfileDetails(false);
                  setIsEditingProfile(false); // Reset edit state when closing
                }}
                className="text-[11px] tracking-[2px] uppercase hover:text-[#D4AF37] active:scale-95 transition-all text-white"
              >
                &larr; Back
              </button>
              <div className="w-[1px] h-4 bg-[#2a2a2a] hidden sm:block"></div>
              <div className="text-[10px] uppercase tracking-[3px] text-[#A9A9A9] hidden sm:block">
                <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setShowProfileDetails(false)}>Account</span> 
                <span className="mx-2">/</span> 
                <span className="text-white">Profile Details</span>
              </div>
            </div>
            <div className="font-serif text-[20px] tracking-[4px] uppercase text-white">
                VANDANA
            </div>
          </header>

          <main className="py-[80px] px-6 lg:px-[80px] max-w-[1200px] mx-auto min-h-[calc(100vh-80px)]">
            <div className="mb-12">
              <h1 className="font-serif text-[40px] md:text-[56px] font-light tracking-[-1px] text-white mb-4">
                {isEditingProfile ? 'Edit Profile' : 'Profile Details'}
              </h1>
              <p className="text-[13px] text-[#A9A9A9] tracking-[1px] uppercase">
                {isEditingProfile ? 'Update your personal and contact information' : 'Your personal and contact information'}
              </p>
            </div>

            {loadingProfile ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-[#D4AF37] text-[13px] uppercase tracking-[2px] animate-pulse">Loading your profile...</p>
              </div>
            ) : userProfile ? (
              
              isEditingProfile ? (
                <div className="space-y-8 bg-[#1a1a1a] p-8 md:p-12 rounded-2xl border border-[#2a2a2a]">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                       {/* Name */}
                       <div>
                           <label className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] block mb-2">Full Name</label>
                           <input 
                               type="text" 
                               value={editFormData.name} 
                               onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                               className="w-full bg-[#121212] border border-[#2a2a2a] text-white px-5 py-4 text-[14px] rounded-lg outline-none focus:border-[#D4AF37] transition-colors" 
                           />
                       </div>
                       {/* Email (Read Only) */}
                       <div>
                           <label className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] block mb-2">Email Address (Cannot be changed)</label>
                           <input 
                               type="text" 
                               value={userProfile.email} 
                               disabled
                               className="w-full bg-[#121212] border border-[#2a2a2a] text-[#A9A9A9] px-5 py-4 text-[14px] rounded-lg opacity-50 cursor-not-allowed" 
                           />
                       </div>
                       {/* Gender */}
                       <div>
                           <label className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] block mb-2">Gender</label>
                           <select 
                               value={editFormData.gender} 
                               onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                               className="w-full bg-[#121212] border border-[#2a2a2a] text-white px-5 py-4 text-[14px] rounded-lg outline-none focus:border-[#D4AF37] appearance-none cursor-pointer transition-colors"
                           >
                               <option value="" disabled>Select Gender</option>
                               <option value="male">Male</option>
                               <option value="female">Female</option>
                               <option value="other">Other</option>
                               <option value="prefer not to say">Prefer not to say</option>
                           </select>
                       </div>
                       {/* Birthday */}
                       <div>
                           <label className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] block mb-2">Birthday</label>
                           <input 
                               type="text" 
                               placeholder="DD/MM/YYYY"
                               value={editFormData.birthday} 
                               onChange={(e) => setEditFormData({...editFormData, birthday: e.target.value})}
                               className="w-full bg-[#121212] border border-[#2a2a2a] text-white px-5 py-4 text-[14px] rounded-lg outline-none focus:border-[#D4AF37] transition-colors" 
                           />
                       </div>
                       {/* Primary Phone */}
                       <div>
                           <label className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] block mb-2">Primary Phone</label>
                           <input 
                               type="tel" 
                               value={editFormData.phone} 
                               onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                               className="w-full bg-[#121212] border border-[#2a2a2a] text-white px-5 py-4 text-[14px] rounded-lg outline-none focus:border-[#D4AF37] transition-colors" 
                           />
                       </div>
                       {/* Alternate Phone */}
                       <div>
                           <label className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] block mb-2">Alternate Mobile</label>
                           <input 
                               type="tel" 
                               value={editFormData.alternate_phone} 
                               onChange={(e) => setEditFormData({...editFormData, alternate_phone: e.target.value})}
                               className="w-full bg-[#121212] border border-[#2a2a2a] text-white px-5 py-4 text-[14px] rounded-lg outline-none focus:border-[#D4AF37] transition-colors" 
                           />
                       </div>
                   </div>
                   
                   <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-[#2a2a2a]">
                       <button 
                           onClick={() => setIsEditingProfile(false)}
                           className="flex-1 py-4 bg-transparent border border-[#2a2a2a] text-white uppercase tracking-[2px] text-[12px] font-bold hover:border-white transition-all duration-300 rounded-lg"
                       >
                           Cancel
                       </button>
                       <button 
                           onClick={handleSaveProfile}
                           disabled={savingProfile}
                           className="flex-1 py-4 bg-[#D4AF37] text-black uppercase tracking-[2px] text-[12px] font-bold hover:bg-white transition-all duration-300 rounded-lg disabled:opacity-50"
                       >
                           {savingProfile ? 'Saving...' : 'Save Changes'}
                       </button>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* Personal Information Group */}
                  <div className="space-y-6 bg-[#1a1a1a] p-8 md:p-10 rounded-2xl border border-[#2a2a2a]">
                    <h3 className="font-serif text-[24px] text-white border-b border-[#2a2a2a] pb-4 mb-6">Personal Information</h3>
                    
                    <div>
                      <label className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] block mb-2">Full Name</label>
                      <div className="w-full bg-[#121212] border border-[#2a2a2a] text-white px-5 py-4 text-[14px] rounded-lg">
                        {userProfile.name || 'Not provided'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] block mb-2">Email Address</label>
                      <div className="w-full bg-[#121212] border border-[#2a2a2a] text-[#A9A9A9] px-5 py-4 text-[14px] rounded-lg">
                        {userProfile.email}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] block mb-2">Gender</label>
                        <div className="w-full bg-[#121212] border border-[#2a2a2a] text-white px-5 py-4 text-[14px] rounded-lg capitalize">
                          {userProfile.gender || 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] block mb-2">Birthday</label>
                        <div className="w-full bg-[#121212] border border-[#2a2a2a] text-white px-5 py-4 text-[14px] rounded-lg">
                          {userProfile.birthday || 'DD/MM/YYYY'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Group */}
                  <div className="space-y-6 bg-[#1a1a1a] p-8 md:p-10 rounded-2xl border border-[#2a2a2a] flex flex-col">
                    <h3 className="font-serif text-[24px] text-white border-b border-[#2a2a2a] pb-4 mb-6">Contact Details</h3>
                    
                    <div>
                      <label className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] block mb-2">Primary Phone</label>
                      <div className="w-full bg-[#121212] border border-[#2a2a2a] text-white px-5 py-4 text-[14px] rounded-lg">
                        {userProfile.phone || 'Not provided'}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-[2px] text-[#A9A9A9] block mb-2">Alternate Mobile</label>
                      <div className="w-full bg-[#121212] border border-[#2a2a2a] text-white px-5 py-4 text-[14px] rounded-lg">
                        {userProfile.alternate_phone || 'Not provided'}
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-8 border-t border-[#2a2a2a]">
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="w-full py-4 bg-white text-black uppercase tracking-[2px] text-[12px] font-bold hover:bg-[#D4AF37] hover:text-white transition-all duration-300 rounded-lg"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-20 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
                <p className="text-[#A9A9A9] text-[14px]">Profile information not found.</p>
              </div>
            )}
          </main>
        </div>
      )}

      {showAccountPage && (
        <div 
          className="fixed inset-0 z-[500] bg-[#0a0a0a] text-white w-full h-[100dvh] overflow-y-auto overflow-x-hidden selection:bg-[#D4AF37] selection:text-black"
          style={{ 
            willChange: "transform", 
            WebkitOverflowScrolling: "touch",
            animation: "accountFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
        >
          <style>{`
            @keyframes accountFadeIn {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes accountItemSlide {
              from { opacity: 0; transform: translateX(-16px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes shimmerGlow {
              0%, 100% { opacity: 0.4; }
              50% { opacity: 0.8; }
            }
            @keyframes avatarPulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.3); }
              50% { box-shadow: 0 0 32px 8px rgba(212, 175, 55, 0.1); }
            }
          `}</style>

          {/* Header */}
          <header className="sticky top-0 left-0 w-full z-50 h-[80px] px-6 lg:px-[60px] flex justify-between items-center bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a]">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowAccountPage(false)}
                className="text-[11px] tracking-[2px] uppercase hover:text-[#D4AF37] active:scale-95 transition-all text-white"
              >
                &larr; Back
              </button>
              <div className="w-[1px] h-4 bg-[#2a2a2a] hidden sm:block"></div>
              <div className="text-[10px] uppercase tracking-[3px] text-[#A9A9A9] hidden sm:block">
                <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setShowAccountPage(false)}>Home</span> 
                <span className="mx-2">/</span> 
                <span className="text-white">Account</span>
              </div>
            </div>
            <div className="font-serif text-[20px] tracking-[4px] uppercase text-white">
                VANDANA
            </div>
          </header>

          <main className="py-[40px] px-6 lg:px-[80px] max-w-[720px] mx-auto min-h-[calc(100vh-80px)]">

            {userEmail ? (
              <>
                {/* Profile Card */}
                <div className="relative mb-12 p-8 md:p-10 rounded-2xl border border-[#1a1a1a] overflow-hidden" style={{ background: 'linear-gradient(145deg, #141414 0%, #0e0e0e 50%, #121210 100%)' }}>
                  {/* Subtle glow behind avatar */}
                  <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', transform: 'translate(-30%, -30%)', animation: 'shimmerGlow 4s ease-in-out infinite' }} />
                  
                  <div className="relative flex items-center gap-6">
                    {/* Avatar with initials */}
                    <div 
                      className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7320] flex items-center justify-center flex-shrink-0"
                      style={{ animation: 'avatarPulse 3s ease-in-out infinite' }}
                    >
                      <span className="text-[24px] font-serif font-medium text-black tracking-[1px]">
                        {userProfile?.name ? userProfile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h1 className="font-serif text-[28px] md:text-[32px] font-light tracking-[-0.5px] text-white truncate">
                        {userProfile?.name || 'Welcome'}
                      </h1>
                      <p className="text-[12px] text-[#666] tracking-[1px] mt-1 truncate">{userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items — clean vertical list */}
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-[3px] text-[#555] mb-4 px-2">Account Settings</p>

                  {[
                    { icon: Package, title: 'Orders', desc: 'Track purchases & returns', action: () => setShowUserDashboard(true) },
                    { icon: UserCircle, title: 'Profile Details', desc: 'Manage personal information', action: () => setShowProfileDetails(true) },
                    { icon: Bookmark, title: 'Collections & Wishlist', desc: 'Your saved styles', action: () => setShowWishlist(true) },
                  ].map((item, idx) => (
                    <button
                      key={item.title}
                      onClick={() => {
                        item.action();
                        setShowAccountPage(false);
                      }}
                      className="w-full flex items-center gap-5 py-5 px-5 rounded-xl hover:bg-[#141414] group transition-all duration-300"
                      style={{ animation: `accountItemSlide 0.5s cubic-bezier(0.16,1,0.3,1) ${0.1 + idx * 0.06}s both` }}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center flex-shrink-0 group-hover:border-[#D4AF37]/40 group-hover:bg-[#1a1812] transition-all duration-300">
                        <item.icon className="w-[18px] h-[18px] text-[#666] group-hover:text-[#D4AF37] transition-colors duration-300" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="text-[14px] font-medium text-white group-hover:text-[#D4AF37] transition-colors duration-300">{item.title}</h3>
                        <p className="text-[11px] text-[#555] mt-0.5 truncate">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#333] group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                    </button>
                  ))}

                  {/* Divider */}
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-[#1a1a1a] to-transparent my-4" />
                  
                  <p className="text-[9px] uppercase tracking-[3px] text-[#555] mb-4 mt-6 px-2">Payments & Locations</p>

                  {[
                    { icon: CreditCard, title: 'Saved Cards', desc: 'Manage payment methods', action: () => alert('Saved cards coming soon') },
                    { icon: MapPin, title: 'Addresses', desc: 'Delivery locations', action: () => alert('Addresses coming soon') },
                    { icon: Ticket, title: 'Coupons', desc: 'Available offers & discounts', action: () => alert('Coupons coming soon') },
                  ].map((item, idx) => (
                    <button
                      key={item.title}
                      onClick={() => {
                        item.action();
                        setShowAccountPage(false);
                      }}
                      className="w-full flex items-center gap-5 py-5 px-5 rounded-xl hover:bg-[#141414] group transition-all duration-300"
                      style={{ animation: `accountItemSlide 0.5s cubic-bezier(0.16,1,0.3,1) ${0.35 + idx * 0.06}s both` }}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center flex-shrink-0 group-hover:border-[#D4AF37]/40 group-hover:bg-[#1a1812] transition-all duration-300">
                        <item.icon className="w-[18px] h-[18px] text-[#666] group-hover:text-[#D4AF37] transition-colors duration-300" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="text-[14px] font-medium text-white group-hover:text-[#D4AF37] transition-colors duration-300">{item.title}</h3>
                        <p className="text-[11px] text-[#555] mt-0.5 truncate">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#333] group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                    </button>
                  ))}

                  {/* Divider */}
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-[#1a1a1a] to-transparent my-4" />

                  {/* Log Out */}
                  <button
                    onClick={() => {
                      setUserEmail('');
                      setIsAdmin(false);
                      setShowUserDashboard(false);
                      setShowAccountPage(false);
                    }}
                    className="w-full flex items-center gap-5 py-5 px-5 rounded-xl hover:bg-[#1a1212] group transition-all duration-300"
                    style={{ animation: `accountItemSlide 0.5s cubic-bezier(0.16,1,0.3,1) 0.55s both` }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center flex-shrink-0 group-hover:border-red-900/40 group-hover:bg-[#1a1214] transition-all duration-300">
                      <LogOut className="w-[18px] h-[18px] text-[#666] group-hover:text-red-400 transition-colors duration-300" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-[14px] font-medium text-white group-hover:text-red-400 transition-colors duration-300">Log Out</h3>
                      <p className="text-[11px] text-[#555] mt-0.5">Sign out of your account</p>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              /* Logged Out — cinematic sign-in invitation */
              <div className="flex flex-col items-center justify-center text-center min-h-[60vh]" style={{ animation: 'accountFadeIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
                {/* Decorative glow */}
                <div className="relative mb-10">
                  <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-transparent flex items-center justify-center" style={{ animation: 'avatarPulse 3s ease-in-out infinite' }}>
                    <div className="w-[80px] h-[80px] rounded-full border border-[#D4AF37]/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-[#D4AF37]/60" />
                    </div>
                  </div>
                </div>

                <h1 className="font-serif text-[36px] md:text-[48px] font-light tracking-[-1px] mb-4">
                  Your <span className="italic" style={{ background: 'linear-gradient(135deg, #D4AF37, #F5E6A3, #D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Atelier</span> Awaits
                </h1>
                <p className="text-[13px] text-[#666] max-w-[360px] leading-[1.8] mb-10">
                  Sign in to unlock your personal dashboard — track orders, save favourites, and enjoy a curated experience.
                </p>
                <button
                  onClick={() => {
                    setShowAccountPage(false);
                    setShowLoginPage(true);
                  }}
                  className="relative px-10 py-4 bg-[#D4AF37] text-black text-[12px] uppercase tracking-[3px] font-bold rounded-full hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Sign In
                </button>
                <p className="text-[11px] text-[#444] mt-6">
                  New here? <span className="text-[#D4AF37] cursor-pointer hover:underline" onClick={() => { setShowAccountPage(false); setShowLoginPage(true); }}>Create an account</span>
                </p>
              </div>
            )}

          </main>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 h-[80px] px-6 lg:px-[60px] flex justify-between items-center glass-panel border-b border-border-dark mix-blend-plus-lighter">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHamburgerMenu(true)}
            className="text-[#A9A9A9] hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="font-serif text-[24px] md:text-[28px] tracking-[6px] uppercase font-normal text-text-primary">
            VANDANA
          </div>
        </div>
        <div className="flex gap-[10px] sm:gap-[20px] md:gap-[50px] text-[10px] md:text-[11px] tracking-[3px] uppercase font-medium text-text-secondary items-center">
            <a href="#collection" className="hover:text-gold transition-colors duration-300">Shop</a>
            <a href="#atelier" className="hover:text-gold transition-colors duration-300 hidden md:block">Atelier</a>
            <a href="#contact" className="hover:text-gold transition-colors duration-300 hidden md:block">Contact</a>
            <button 
              onClick={() => setShowWishlist(true)}
              className="text-[#A9A9A9] hover:text-[#D4AF37] transition-colors duration-300 p-2"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowCart(true)}
              className="text-[#A9A9A9] hover:text-[#D4AF37] transition-colors duration-300 p-2"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
        </div>
      </nav>

      {/* 1. Cinematic Hero */}
      <section className="relative h-[100dvh] lg:h-screen w-full flex flex-col items-center justify-center overflow-hidden border-b border-border-dark perspective-wrap">
        <ThreeFabric />
        
        <div className="z-10 text-center px-4 w-full">
          <h1 ref={heroTitleRef} className="font-serif uppercase text-[11vw] sm:text-[12vw] md:text-[120px] leading-[0.8] tracking-[4px] md:tracking-[12px] mb-6 flex justify-center font-normal drop-shadow-2xl ms-[4px] md:ms-[12px]">
            {"VANDANA".split('').map((char, i) => (
                <span key={i} className="inline-block transform-origin-bottom" style={{ transformStyle: 'preserve-3d' }}>
                    {char}
                </span>
            ))}
          </h1>
          <p ref={heroSubtitleRef} className="text-[12px] md:text-[14px] leading-[1.8] text-text-secondary max-w-[400px] mx-auto mt-8 font-medium tracking-[2px] uppercase">
            A Legacy of Silk & Shadow
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-6">
            <p className="text-[9px] uppercase tracking-[3px] text-gold-muted font-semibold">— Scroll into the Atelier</p>
            <div className="w-[1px] h-16 bg-gradient-to-b from-gold to-transparent"></div>
        </div>

        {/* Absolute floating decor - restricted to first page */}
        <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 -rotate-90 text-[10px] tracking-[6px] text-[#444] uppercase whitespace-nowrap z-0 select-none hidden 2xl:block mix-blend-plus-lighter pointer-events-none">
          Vandana Haute Couture — Est. 1994
        </div>
      </section>

      {/* 2. Brand Ethos / Mission (New Section) */}
      <section className="py-[120px] md:py-[200px] px-6 lg:px-[80px] max-w-[1800px] mx-auto flex flex-col lg:flex-row gap-16 md:gap-32 items-center justify-between border-b border-border-dark relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-muted/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="w-full lg:w-1/2 text-reveal-scroll">
            <h2 className="font-serif text-[36px] md:text-[64px] leading-[1.1] font-light mb-8">
                Where <span className="italic gold-gradient-text font-medium">tradition</span> meets<br/> uncompromising modernity.
            </h2>
            <p className="font-sans text-[14px] leading-[2] text-text-secondary max-w-[480px]">
                Founded in 1994, Vandana alters the paradigm of Indian haute couture. We dissect centuries-old weaving techniques and reconstruct them into stark, architectural silhouettes for the contemporary luxury wearer. It is not just clothing; it is a canvas of heritage worn in the dark.
            </p>
            <div className="mt-12">
               <MagneticButton className="w-[140px] h-[140px] border-border-dark hover:border-gold transition-colors duration-500">
                  <span className="flex flex-col items-center active:scale-95 transition-transform duration-300">
                      <span className="mb-2 text-[9px] uppercase tracking-[2px]">Discover</span>
                      <div className="w-8 h-[1px] bg-gold-muted group-hover:bg-bg-dark transition-colors duration-300"></div>
                      <span className="mt-2 text-[9px] uppercase tracking-[2px]">Craft</span>
                  </span>
               </MagneticButton>
            </div>
        </div>
        <div className="w-full lg:w-1/2 perspective-wrap mt-12 lg:mt-0">
            <div className="relative w-full lg:w-[85%] ml-auto aspect-[3/4] lg:aspect-[4/5] animate-3d-scroll rounded-[4px] overflow-hidden bg-surface shadow-2xl">
                <img 
                    src="https://images.unsplash.com/photo-1622378158084-f2221260e688?q=80&w=1500&auto=format&fit=crop" 
                    alt="Intricate Embroidery" 
                    className="absolute inset-0 w-full h-full object-cover parallax-bg scale-125 origin-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/10 to-transparent opacity-90 z-10 pointer-events-none"></div>
                <div className="absolute bottom-8 left-8 flex items-center gap-4 z-20">
                    <span className="text-gold text-[12px] tracking-[3px] uppercase font-bold drop-shadow-md">01</span>
                    <div className="w-12 h-[1px] bg-gold/50"></div>
                    <span className="text-text-primary text-[12px] tracking-[3px] uppercase font-bold drop-shadow-md">The Weave</span>
                </div>
            </div>
        </div>
      </section>

      {/* 3. Horizontal Scroll Gallery (Pinned Section) */}
      <section id="collection" ref={horizontalWrapRef} className="h-[100dvh] lg:h-screen w-full bg-bg-dark relative flex items-center overflow-hidden border-b border-border-dark">
        <div className="absolute top-8 md:top-12 left-6 lg:left-[60px] z-10 text-reveal-scroll">
            <h3 className="font-serif text-[36px] md:text-[48px] italic text-text-primary opacity-30">Featured Vault</h3>
        </div>
        
        {/* The scrolling track */}
        <div ref={horizontalScrollRef} className="flex h-[60vh] md:h-[70vh] pl-[10vw] pr-[20vw] gap-[10vw] w-[315vw] md:w-[210vw] items-center" style={{ willChange: "transform" }}>
            
            {/* Slide 1 */}
            <div className="relative w-[75vw] md:w-[40vw] h-full shrink-0 animate-3d-scroll group cursor-pointer overflow-hidden rounded-[2px] mt-12 md:mt-0" style={{ willChange: "transform" }}>
                <img src="https://images.unsplash.com/photo-1533659828870-95ee305cee3e?q=80&w=1200&auto=format&fit=crop" alt="Look 1" className="w-full h-full object-cover h-image md:grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 ease-out scale-110" style={{ willChange: "transform" }} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700"></div>
                <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 translate-y-0 lg:translate-y-4 opacity-100 lg:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <h4 className="font-serif text-[26px] md:text-[32px] italic text-gold">The Obsidian Drape</h4>
                    <p className="text-[10px] uppercase tracking-[3px] text-text-secondary mt-2">Series Alpha</p>
                </div>
            </div>

            {/* Slide 2 */}
            <div className="relative w-[75vw] md:w-[40vw] h-full shrink-0 group cursor-pointer overflow-hidden rounded-[2px] transform translate-y-0 md:translate-y-12" style={{ willChange: "transform" }}>
                <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop" alt="Look 2" className="w-full h-full object-cover h-image md:grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 ease-out scale-110" style={{ willChange: "transform" }} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700"></div>
                <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 translate-y-0 lg:translate-y-4 opacity-100 lg:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <h4 className="font-serif text-[26px] md:text-[32px] italic text-gold">Ivory Threadwork</h4>
                    <p className="text-[10px] uppercase tracking-[3px] text-text-secondary mt-2">Series Beta</p>
                </div>
            </div>

            {/* Slide 3 */}
            <div className="relative w-[75vw] md:w-[40vw] h-full shrink-0 group cursor-pointer overflow-hidden rounded-[2px] transform -translate-y-0 md:-translate-y-12" style={{ willChange: "transform" }}>
                <img src="https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Look 3" className="w-full h-full object-cover h-image md:grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 ease-out scale-110" style={{ willChange: "transform" }}/>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700"></div>
                <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 translate-y-0 lg:translate-y-4 opacity-100 lg:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <h4 className="font-serif text-[26px] md:text-[32px] italic text-gold">Crimson Silhouette</h4>
                    <p className="text-[10px] uppercase tracking-[3px] text-text-secondary mt-2">Series Gamma</p>
                </div>
            </div>

             {/* Outro slide */}
             <div className="relative w-[30vw] shrink-0 flex items-center justify-center">
                 <button onClick={() => setShowCollections(true)} className="font-serif text-[24px] md:text-[40px] italic hover:text-gold transition-colors duration-300">View All Collections &rarr;</button>
             </div>

        </div>
      </section>

      {/* 4. Full Width Editorial Parallax */}
      <section className="relative h-[60dvh] lg:h-[80vh] w-full overflow-hidden flex items-center justify-center perspective-wrap border-b border-border-dark">
         <img src="https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=2500&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover parallax-bg scale-[1.3] opacity-40 z-0" style={{ willChange: "transform" }}/>
         <div className="absolute inset-0 bg-gradient-to-b from-bg-dark via-transparent to-bg-dark z-0"></div>
         
         <div className="relative z-10 text-center max-w-[800px] px-6">
             <h2 className="font-serif text-[28px] md:text-[56px] leading-[1.2] font-light text-reveal-scroll">
                 "Vandana doesn't just design garments. They construct <span className="text-gold italic">wearable architecture</span> that honors the spirit of royalty."
             </h2>
             <p className="mt-10 text-[11px] uppercase tracking-[4px] text-text-secondary font-semibold text-reveal-scroll">
                 — Vogue Avant-Garde
             </p>
         </div>
      </section>

      {/* Heritage & Craftsmanship (Brand History) */}
      <section id="atelier" className="relative py-[150px] px-6 lg:px-[80px] bg-bg-dark border-b border-border-dark overflow-hidden flex flex-col gap-[120px] md:gap-[180px]">
        {/* Story Block 1 */}
        <div className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row items-center gap-12 md:gap-20">
            <div className="w-full lg:w-1/2 perspective-wrap">
                <div className="relative aspect-[4/5] md:aspect-[3/4] w-full md:w-[85%] animate-3d-scroll overflow-hidden rounded-[2px] bg-surface shadow-2xl" style={{ willChange: "transform" }}>
                    <img 
                        src="https://images.unsplash.com/photo-1617694820985-a5476fe22722?q=80&w=1200&auto=format&fit=crop" 
                        alt="Artisan Craftsmanship" 
                        className="absolute inset-0 w-full h-full object-cover parallax-bg scale-125 origin-center md:grayscale-[20%]"
                        style={{ willChange: "transform" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-bg-dark/80 via-transparent to-transparent pointer-events-none"></div>
                </div>
            </div>
            <div className="w-full lg:w-1/2 lg:pl-12 text-reveal-scroll">
                <span className="text-gold text-[10px] tracking-[4px] uppercase font-bold mb-6 block drop-shadow-sm">The Heritage</span>
                <h2 className="font-serif text-[32px] md:text-[56px] leading-[1.1] mb-8 font-light">
                    Over 200 hours of manual labor tailored into a <span className="italic text-gold font-medium">singular masterpiece.</span>
                </h2>
                <p className="font-sans text-[14px] leading-[2] text-text-secondary max-w-[480px]">
                    Our ateliers in Varanasi and Kanchipuram operate just as they did a century ago. 
                    No automation. No compromise. Every thread of metallic zari is hand-woven by 
                    master artisans who have inherited these meticulous techniques through generations of weaving.
                </p>
            </div>
        </div>

        {/* Story Block 2 */}
        <div className="max-w-[1400px] mx-auto w-full flex flex-col-reverse lg:flex-row items-center gap-12 md:gap-20">
             <div className="w-full lg:w-1/2 lg:pr-12 text-reveal-scroll flex flex-col items-start lg:items-end text-left lg:text-right">
                <span className="text-gold text-[10px] tracking-[4px] uppercase font-bold mb-6 block drop-shadow-sm">The Legacy</span>
                <h2 className="font-serif text-[32px] md:text-[56px] leading-[1.1] mb-8 font-light max-w-[600px]">
                    Preserving the rich <span className="italic text-gold font-medium">soul</span> of Indian textiles.
                </h2>
                <p className="font-sans text-[14px] leading-[2] text-text-secondary max-w-[480px] lg:ml-auto">
                    By integrating pure gold and silver threads into raw, untreated silk, Vandana creates 
                    garments that do not just drape the body—they carry the weight of history. We are 
                    custodians of an art form that refuses to be forgotten in the modern era.
                </p>
            </div>
            <div className="w-full lg:w-1/2 perspective-wrap flex justify-start lg:justify-end">
                <div className="relative aspect-[16/10] lg:aspect-[4/3] w-full lg:w-[90%] animate-3d-scroll overflow-hidden rounded-[2px] bg-surface shadow-2xl" style={{ willChange: "transform" }}>
                    <img 
                        src="https://images.unsplash.com/photo-1551893665-f843f600794e?q=80&w=1200&auto=format&fit=crop" 
                        alt="Legacy Silk" 
                        className="absolute inset-0 w-full h-full object-cover parallax-bg scale-125 origin-center md:grayscale-[30%] brightness-75"
                        style={{ willChange: "transform" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-tl from-bg-dark/80 via-transparent to-transparent pointer-events-none"></div>
                </div>
            </div>
        </div>
      </section>

      {/* 5. Classic 3-Grid GridCard Section */}
      <section id="categories" className="relative z-20 py-[120px] px-6 lg:px-[80px] w-full mx-auto bg-bg-dark">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-8 pb-10 border-b border-border-dark text-reveal-scroll">
            <h2 className="font-serif text-[40px] md:text-[64px] leading-[0.9] tracking-[-1px] font-normal">
                Categories
            </h2>
            <p className="text-[13px] leading-[1.6] text-text-secondary max-w-[320px]">
                Browse by distinct lines, spanning rigorous traditional homage to bold metropolitan styles.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 perspective-wrap">
            <div className="animate-3d-scroll mt-0">
                <GridCard 
                    title="Heritage Sarees" 
                    subtitle="Traditional Weaves"
                    imageSrc="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=2164&auto=format&fit=crop"
                    variations={["Classic Kanjeevaram Drape", "Pre-stitched Belted Saree", "Organza with Minimalist Blouse"]}
                    onExplore={() => {
                        setCollectionsScrollTarget('Sarees');
                        setShowCollections(true);
                    }}
                />
            </div>
            <div className="animate-3d-scroll md:mt-[80px]">
                <GridCard 
                    title="Modern Dresses" 
                    subtitle="Avant-Garde Silhouettes"
                    imageSrc="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2183&auto=format&fit=crop"
                    variations={["Asymmetric A-Line Fall", "Plunge Neckline with Cape", "Structured Corset Gown"]}
                    onExplore={() => {
                        setCollectionsScrollTarget('Ethnic Dresses');
                        setShowCollections(true);
                    }}
                />
            </div>
            <div className="animate-3d-scroll md:mt-[160px]">
                <GridCard 
                    title="Bespoke Bridal" 
                    subtitle="03 Luxury Couture"
                    imageSrc="https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9?q=80&w=2000&auto=format&fit=crop"
                    variations={["Heavy Zardosi Lehenga", "Monochrome Ivory Sequins", "Velvet Regal Bodice"]}
                    onExplore={() => {
                        setCollectionsScrollTarget('Ethnic Dresses');
                        setShowCollections(true);
                    }}
                />
            </div>
        </div>

        <div className="mt-24 md:mt-32 flex justify-center text-reveal-scroll pb-10">
            <button 
                onClick={() => setShowCollections(true)} 
                className="px-12 py-5 bg-transparent border border-text-primary rounded-full group hover:bg-gold hover:border-gold hover:text-bg-dark active:scale-95 transition-all duration-500 text-[10px] md:text-[11px] uppercase tracking-[3px] font-medium"
            >
                View All Collections
            </button>
        </div>
      </section>

      {/* 6. Contact / CTA Footer */}
      <footer id="contact" className="relative bg-surface pt-[100px] pb-[60px] px-6 lg:px-[80px] border-t border-border-dark z-20 flex flex-col items-center md:items-stretch overflow-hidden">
        
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-gold/30 opacity-50 m-6 hidden md:block"></div>
        <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-gold/30 opacity-50 m-6 hidden md:block"></div>

        <div className="flex flex-col lg:flex-row justify-between items-center w-full mb-16 md:mb-24 gap-12 md:gap-16">
            <h2 ref={footerTitleRef} className="font-serif text-[40px] md:text-[80px] tracking-[-1px] font-normal leading-[0.9] text-center lg:text-left [perspective:1000px]">
                Experience <br/><span className="italic text-gold">Elegance.</span>
            </h2>
            
            <MagneticButton className="w-[150px] h-[150px] border-border-dark hover:border-gold transition-colors duration-500">
                <span className="flex flex-col items-center active:scale-95 transition-transform duration-300">
                    <span className="mb-2 text-[10px] uppercase tracking-[2px] font-semibold">Book</span>
                    <div className="w-8 h-[1px] bg-gold-muted group-hover:bg-bg-dark transition-colors duration-300"></div>
                    <span className="mt-2 text-[10px] uppercase tracking-[2px] font-semibold">Consultation</span>
                </span>
            </MagneticButton>
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-16 pt-16 border-t border-border-dark w-full">
            <div className="w-full xl:w-1/3">
                <p className="text-[10px] uppercase tracking-[3px] font-semibold text-text-secondary mb-6">Join The Inner Circle</p>
                <div className="flex items-end gap-4">
                    <input 
                        type="email" 
                        placeholder="ENTER YOUR EMAIL" 
                        className="bg-transparent border-b border-border-dark text-text-primary py-[12px] w-full text-[11px] tracking-[1px] outline-none focus:border-gold transition-colors duration-300"
                    />
                    <button className="bg-text-primary text-bg-dark hover:bg-gold hover:text-black border-none px-[32px] py-[14px] text-[10px] uppercase tracking-[2px] font-bold cursor-pointer transition-colors duration-300 whitespace-nowrap">
                        Subscribe
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-16 w-full xl:w-auto justify-between xl:justify-end text-[10px] uppercase tracking-[2px] text-text-secondary font-medium">
                <div className="flex flex-col gap-5">
                    <a href="#" className="hover:text-gold transition-colors duration-300">Instagram</a>
                    <a href="#" className="hover:text-gold transition-colors duration-300">Pinterest</a>
                    <a href="#" className="hover:text-gold transition-colors duration-300">Vogue Feature</a>
                </div>
                <div className="flex flex-col gap-5">
                    <a href="#" className="hover:text-gold transition-colors duration-300">The Atelier</a>
                    <a href="#" className="hover:text-gold transition-colors duration-300">Shipping & Returns</a>
                    <a href="#" className="hover:text-gold transition-colors duration-300">Legal Notice</a>
                </div>
            </div>
        </div>

        <div className="mt-24 pt-8 border-t border-border-dark w-full flex justify-between items-center text-[9px] uppercase tracking-[2px] text-text-secondary">
            <p>&copy; 2026 Vandana Haute Couture. All Rights Reserved.</p>
            <p className="hidden md:block">Crafted with precision.</p>
        </div>
      </footer>
      
    </div>
  );
}