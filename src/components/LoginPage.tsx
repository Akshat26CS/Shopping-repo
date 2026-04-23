import { useState } from 'react';
import { ArrowLeft, LogIn, UserPlus, ShieldCheck, Eye, EyeOff, Mail, Lock, Phone, UserIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

type LoginMode = 'choose' | 'user-login' | 'user-signup' | 'admin-login';

interface LoginProps {
  onUserLogin: (email: string) => void;
  onAdminLogin: (password: string) => void;
  onClose: () => void;
}

export function LoginPage({ onUserLogin, onAdminLogin, onClose }: LoginProps) {
  const [mode, setMode] = useState<LoginMode>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUserLogin = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        setError('Invalid email or password');
        return;
      }

      onUserLogin(email);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSignup = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        setError('User with this email already exists');
        return;
      }

      // Insert new user
      const { error } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: password, // In production, hash this
          name,
          phone
        });

      if (error) {
        setError('Signup failed. Please try again.');
        return;
      }

      onUserLogin(email);
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    // Default admin password (change this in production)
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin@123';
    
    if (password !== adminPassword) {
      setError('Invalid admin password');
      return;
    }
    setError('');
    onAdminLogin(password);
  };

  const switchMode = (newMode: LoginMode) => {
    setError('');
    setPassword('');
    setConfirmPassword('');
    setMode(newMode);
  };

  const inputClass = "w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white pl-12 pr-4 py-4 text-[14px] rounded-xl outline-none focus:border-[#D4AF37] transition-all duration-300 placeholder:text-[#555]";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] pointer-events-none";

  // Heading & subtitle for each mode
  const headings: Record<LoginMode, { title: string; subtitle: string }> = {
    'choose': { title: 'Welcome', subtitle: 'To the world of Vandana Haute Couture' },
    'user-login': { title: 'Welcome Back', subtitle: 'Sign in to your account' },
    'user-signup': { title: 'Join Us', subtitle: 'Create your Vandana account' },
    'admin-login': { title: 'Admin Access', subtitle: 'Restricted area — authorized personnel only' },
  };

  return (
    <div className="fixed inset-0 z-[400] bg-[#030303] flex" style={{ animation: 'loginFadeIn 0.4s ease-out' }}>
      <style>{`
        @keyframes loginFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .login-slide-up {
          animation: slideUp 0.5s ease-out both;
        }
        .login-slide-up-d1 { animation-delay: 0.05s; }
        .login-slide-up-d2 { animation-delay: 0.1s; }
        .login-slide-up-d3 { animation-delay: 0.15s; }
        .login-slide-up-d4 { animation-delay: 0.2s; }
        .login-slide-up-d5 { animation-delay: 0.25s; }
        .login-slide-up-d6 { animation-delay: 0.3s; }
        .login-slide-up-d7 { animation-delay: 0.35s; }
      `}</style>

      {/* Left Panel — Decorative (hidden on mobile) */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden items-center justify-center">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1583391733958-d25e07facdfa?q=80&w=1500&auto=format&fit=crop"
          alt="Luxury fabric"
          className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110"
          style={{ animation: 'floatSlow 20s ease-in-out infinite' }}
        />
        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-[#030303]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]" />

        {/* Decorative gold lines */}
        <div className="absolute top-12 left-12 w-24 h-24 border-t border-l border-[#D4AF37]/20" />
        <div className="absolute bottom-12 right-12 w-24 h-24 border-b border-r border-[#D4AF37]/20" />

        {/* Centered branding */}
        <div className="relative z-10 text-center px-12">
          <p className="text-[10px] uppercase tracking-[4px] text-[#D4AF37]/60 mb-6">Est. 1994</p>
          <h2 className="font-serif text-[64px] tracking-[8px] uppercase font-light text-white/90 leading-[0.9] mb-8">
            VANDANA
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-8" />
          <p className="text-[12px] tracking-[3px] uppercase text-[#9a9a9a] font-light max-w-[280px] mx-auto leading-relaxed">
            A Legacy of Silk & Shadow
          </p>
        </div>

        {/* Floating decorative dots */}
        <div className="absolute top-[20%] right-[20%] w-2 h-2 bg-[#D4AF37]/20 rounded-full" style={{ animation: 'floatSlow 8s ease-in-out infinite' }} />
        <div className="absolute bottom-[30%] left-[15%] w-1.5 h-1.5 bg-[#D4AF37]/15 rounded-full" style={{ animation: 'floatSlow 12s ease-in-out infinite 2s' }} />
        <div className="absolute top-[60%] right-[30%] w-1 h-1 bg-[#D4AF37]/25 rounded-full" style={{ animation: 'floatSlow 10s ease-in-out infinite 4s' }} />
      </div>

      {/* Right Panel — Form Area */}
      <div className="w-full lg:w-[55%] flex flex-col min-h-full relative">
        {/* Border accent on left (desktop) */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#2a2a2a] to-transparent" />

        {/* Top bar */}
        <header className="flex items-center justify-between px-6 lg:px-12 py-6 shrink-0">
          {mode !== 'choose' ? (
            <button
              onClick={() => switchMode('choose')}
              className="flex items-center gap-2 text-[11px] uppercase tracking-[2px] text-[#9a9a9a] hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}
          {/* Mobile brand */}
          <div className="lg:hidden font-serif text-[20px] tracking-[4px] uppercase text-white">VANDANA</div>
          <button
            onClick={onClose}
            className="text-[11px] uppercase tracking-[2px] text-[#9a9a9a] hover:text-[#D4AF37] transition-colors duration-300 px-4 py-2 border border-[#2a2a2a] rounded-lg hover:border-[#D4AF37]/40"
          >
            Skip
          </button>
        </header>

        {/* Main form content — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-16 xl:px-24 pb-12">
          <div className="w-full max-w-[440px]">

            {/* Heading (shared across all modes) */}
            <div className="mb-10 login-slide-up" key={mode + '-heading'}>
              <h1 className="font-serif text-[36px] md:text-[48px] text-white font-light tracking-[-0.5px] mb-3">
                {headings[mode].title}
              </h1>
              <p className="text-[12px] uppercase tracking-[2px] text-[#9a9a9a]">
                {headings[mode].subtitle}
              </p>
            </div>

            {/* ───── Mode: Choose ───── */}
            {mode === 'choose' && (
              <div className="space-y-4" key="choose-form">
                <button
                  onClick={() => switchMode('user-login')}
                  className="login-slide-up login-slide-up-d1 w-full py-4 bg-white text-[#030303] uppercase tracking-[2px] text-[12px] font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-400"
                >
                  <LogIn className="w-4 h-4" /> User Login
                </button>
                <button
                  onClick={() => switchMode('user-signup')}
                  className="login-slide-up login-slide-up-d2 w-full py-4 bg-transparent border border-white/20 text-white uppercase tracking-[2px] text-[12px] font-bold rounded-xl flex items-center justify-center gap-3 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.08)] transition-all duration-400"
                >
                  <UserPlus className="w-4 h-4" /> Create Account
                </button>
                <button
                  onClick={() => switchMode('admin-login')}
                  className="login-slide-up login-slide-up-d3 w-full py-4 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] uppercase tracking-[2px] text-[12px] font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/60 transition-all duration-400"
                >
                  <ShieldCheck className="w-4 h-4" /> Admin Login
                </button>

                <p className="login-slide-up login-slide-up-d4 text-center text-[11px] text-[#666] pt-4">
                  Browse as guest or login for order tracking & exclusive access
                </p>
              </div>
            )}

            {/* ───── Mode: User Login ───── */}
            {mode === 'user-login' && (
              <div className="space-y-5" key="login-form">
                <div className="login-slide-up login-slide-up-d1 relative">
                  <Mail className={iconClass} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className={inputClass}
                    onKeyDown={(e) => e.key === 'Enter' && handleUserLogin()}
                  />
                </div>

                <div className="login-slide-up login-slide-up-d2 relative">
                  <Lock className={iconClass} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={`${inputClass} pr-12`}
                    onKeyDown={(e) => e.key === 'Enter' && handleUserLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#D4AF37] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && <p className="login-slide-up text-red-400 text-[12px] bg-red-400/5 border border-red-400/10 rounded-lg px-4 py-3">{error}</p>}

                <button
                  onClick={handleUserLogin}
                  disabled={loading}
                  className="login-slide-up login-slide-up-d3 w-full py-4 bg-white text-[#030303] uppercase tracking-[2px] text-[12px] font-bold rounded-xl hover:bg-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-400 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {loading ? 'Signing in...' : 'Continue'}
                </button>

                <p className="login-slide-up login-slide-up-d4 text-center text-[12px] text-[#666] pt-2">
                  Don't have an account?{' '}
                  <button onClick={() => switchMode('user-signup')} className="text-[#D4AF37] hover:underline">
                    Create one
                  </button>
                </p>
              </div>
            )}

            {/* ───── Mode: User Signup ───── */}
            {mode === 'user-signup' && (
              <div className="space-y-4" key="signup-form">
                <div className="login-slide-up login-slide-up-d1 relative">
                  <Mail className={iconClass} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className={inputClass}
                  />
                </div>

                <div className="login-slide-up login-slide-up-d2 relative">
                  <UserIcon className={iconClass} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className={inputClass}
                  />
                </div>

                <div className="login-slide-up login-slide-up-d3 relative">
                  <Phone className={iconClass} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className={inputClass}
                  />
                </div>

                <div className="login-slide-up login-slide-up-d4 relative">
                  <Lock className={iconClass} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#D4AF37] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="login-slide-up login-slide-up-d5 relative">
                  <Lock className={iconClass} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className={`${inputClass} pr-12`}
                    onKeyDown={(e) => e.key === 'Enter' && handleUserSignup()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#D4AF37] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && <p className="login-slide-up text-red-400 text-[12px] bg-red-400/5 border border-red-400/10 rounded-lg px-4 py-3">{error}</p>}

                <button
                  onClick={handleUserSignup}
                  disabled={loading}
                  className="login-slide-up login-slide-up-d6 w-full py-4 bg-white text-[#030303] uppercase tracking-[2px] text-[12px] font-bold rounded-xl hover:bg-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-400 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <p className="login-slide-up login-slide-up-d7 text-center text-[12px] text-[#666] pt-1">
                  Already have an account?{' '}
                  <button onClick={() => switchMode('user-login')} className="text-[#D4AF37] hover:underline">
                    Sign in
                  </button>
                </p>
              </div>
            )}

            {/* ───── Mode: Admin Login ───── */}
            {mode === 'admin-login' && (
              <div className="space-y-5" key="admin-form">
                <div className="login-slide-up login-slide-up-d1 relative">
                  <Lock className={iconClass} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin password"
                    className={`${inputClass} pr-12`}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#D4AF37] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <p className="login-slide-up login-slide-up-d2 text-[10px] text-[#555] tracking-[1px]">Default: admin@123</p>

                {error && <p className="login-slide-up text-red-400 text-[12px] bg-red-400/5 border border-red-400/10 rounded-lg px-4 py-3">{error}</p>}

                <button
                  onClick={handleAdminLogin}
                  className="login-slide-up login-slide-up-d3 w-full py-4 bg-[#D4AF37] text-[#030303] uppercase tracking-[2px] text-[12px] font-bold rounded-xl hover:bg-white hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-400"
                >
                  Authenticate
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Bottom bar */}
        <footer className="px-6 lg:px-12 py-5 text-[9px] uppercase tracking-[2px] text-[#444] flex justify-between items-center border-t border-[#1a1a1a] shrink-0">
          <span>&copy; 2026 Vandana Haute Couture</span>
          <span className="hidden sm:inline">Crafted with precision</span>
        </footer>
      </div>
    </div>
  );
}
