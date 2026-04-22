import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, BookOpen, ChevronRight, BarChart2, DollarSign, Eye, EyeOff, ArrowLeft, KeyRound, TrendingUp } from 'lucide-react';
import axiosInstance from '../../api/axios.config';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';

type View = 'login' | 'forgot-email' | 'forgot-otp';

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  rightEl?: React.ReactNode;
  error?: string;
  labelRight?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, icon, type, placeholder, value, onChange, autoFocus, rightEl, error, labelRight }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</label>
      {labelRight}
    </div>
    <div className={`group flex items-center border rounded-xl bg-white dark:bg-slate-800/60 transition-all duration-200 focus-within:ring-2 focus-within:ring-lime-500/25 focus-within:border-lime-500 dark:focus-within:border-lime-500 overflow-hidden ${error ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-slate-700'}`}>
      <div className="flex items-center gap-2.5 flex-1 px-3.5 py-3">
        <span className="shrink-0 text-gray-500 group-focus-within:text-lime-600 dark:text-slate-400 dark:group-focus-within:text-lime-500 transition-colors duration-200">
          {icon}
        </span>
        <input
          type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} autoFocus={autoFocus}
          className="flex-1 min-w-0 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
        />
        {rightEl}
      </div>
    </div>
    {error && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>}
  </div>
);

const slideVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const AuthorLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter both email and password'); return; }
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/author/auth/login', { email, password });
      if (res.data.success) { login(res.data.data.user, res.data.data.tokens); navigate('/author/dashboard'); }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setIsLoading(false); }
  };

  const sendResetOTP = async () => {
    setError('');
    if (!resetEmail) { setError('Please enter your registered email'); return; }
    setIsLoading(true);
    try {
      await axiosInstance.post('/author/auth/send-login-otp', { email: resetEmail });
      toast.success('OTP sent to your email');
      setView('forgot-otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }
    if (!newPassword || newPassword.length < 4) { setError('Password must be at least 4 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setIsLoading(true);
    try {
      await axiosInstance.post('/author/auth/verify-login-otp', { email: resetEmail, otp, newPassword });
      setSuccessMsg('Password reset successfully! You can now sign in.');
      setView('login');
      setEmail(resetEmail);
      setOtp(''); setNewPassword(''); setConfirmPassword('');
      toast.success('Password reset successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally { setIsLoading(false); }
  };

  const goBackToLogin = () => { setView('login'); setError(''); setResetEmail(''); setOtp(''); setNewPassword(''); setConfirmPassword(''); };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: isDark ? '#07101f' : '#ffffff' }}>
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(132,204,22,0.07)' : 'rgba(101,163,13,0.06)'} 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
        {/* Right-side glow blob (behind form) */}
        <div style={{ position: 'absolute', right: 0, top: 0, width: '52%', height: '100%', background: isDark ? 'radial-gradient(ellipse at 60% 50%, rgba(132,204,22,0.15) 0%, rgba(132,204,22,0.05) 55%, transparent 100%)' : 'radial-gradient(ellipse at 60% 50%, rgba(132,204,22,0.30) 0%, rgba(132,204,22,0.09) 55%, transparent 100%)' }} />
        {/* Top-right corner accent */}
        <div style={{ position: 'absolute', right: -50, top: -50, width: 320, height: 320, borderRadius: '50%', background: isDark ? 'radial-gradient(circle, rgba(132,204,22,0.10) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(187,247,208,0.70) 0%, transparent 70%)' }} />
        {/* Bottom-left accent */}
        <div style={{ position: 'absolute', left: -60, bottom: -60, width: 260, height: 260, borderRadius: '50%', background: isDark ? 'radial-gradient(circle, rgba(101,163,13,0.08) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(132,204,22,0.18) 0%, transparent 70%)' }} />
        {/* Spinning comet rings */}
        <div style={{ position: 'absolute', width: 620, height: 620, borderRadius: '50%', top: '50%', left: '74%', background: isDark ? 'conic-gradient(from 0deg, transparent 75%, rgba(132,204,22,0.40) 90%, rgba(132,204,22,0.60) 96%, transparent 100%)' : 'conic-gradient(from 0deg, transparent 75%, rgba(101,163,13,0.34) 90%, rgba(101,163,13,0.54) 96%, transparent 100%)', animation: 'authRingCW 22s linear infinite' }} />
        <div style={{ position: 'absolute', width: 440, height: 440, borderRadius: '50%', top: '50%', left: '74%', background: isDark ? 'conic-gradient(from 180deg, transparent 78%, rgba(132,204,22,0.28) 92%, rgba(132,204,22,0.46) 97%, transparent 100%)' : 'conic-gradient(from 180deg, transparent 78%, rgba(101,163,13,0.26) 92%, rgba(101,163,13,0.42) 97%, transparent 100%)', animation: 'authRingCCW 16s linear infinite' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', top: '50%', left: '74%', border: isDark ? '1.5px solid rgba(132,204,22,0.26)' : '1.5px solid rgba(101,163,13,0.30)', animation: 'authRingCW 10s linear infinite' }} />
        <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', top: '50%', left: '74%', border: isDark ? '1px solid rgba(132,204,22,0.15)' : '1px solid rgba(101,163,13,0.20)', animation: 'authRingCCW 18s linear infinite' }} />
        <div style={{ position: 'absolute', width: 760, height: 760, borderRadius: '50%', top: '50%', left: '74%', border: isDark ? '1px solid rgba(132,204,22,0.09)' : '1px solid rgba(101,163,13,0.13)', animation: 'authRingCW 32s linear infinite' }} />
      </div>

      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex w-[52%] flex-col relative z-10"
      >
        <div className="flex flex-col justify-between h-full px-16 xl:px-20 py-14">
          <Link to="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold text-white"
              style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}>B</div>
            <span className="text-xl font-bold" style={{ color: isDark ? 'white' : '#1a2e05' }}>Povital</span>
          </Link>

          <div className="my-auto py-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: LIME_DARK }} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: isDark ? '#86efac' : '#4d7c0f' }}>Welcome back, storyteller</span>
            </div>
            <h1 className="font-extrabold mb-5" style={{ fontSize: '2.8rem', lineHeight: 1.1, color: isDark ? 'white' : '#14532d' }}>
              Your next chapter<br />starts at your<br />
              <span style={{ color: LIME_DARK }}>finger tips.</span>
            </h1>
            <p className="text-base leading-relaxed mb-12 max-w-[320px]" style={{ color: isDark ? '#94a3b8' : '#4b5563' }}>
              Sign in to manage your books, track royalties in real time, and reach millions of readers across India's largest publishing network.
            </p>

            <div className="space-y-3 mb-14">
              {[
                { icon: BookOpen, text: '100% royalty, paid every month' },
                { icon: BarChart2, text: 'Distribute to 570+ channels instantly' },
                { icon: DollarSign, text: 'Trusted by 1,200+ published authors' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 backdrop-blur-sm"
                  style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.75)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)'}`, boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center" style={{ background: `${LIME}20`, border: `1.5px solid ${LIME}45` }}>
                    <Icon style={{ width: 17, height: 17, color: LIME_DARK }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: isDark ? '#cbd5e1' : '#374151' }}>{text}</span>
                </div>
              ))}
            </div>

            <div className="inline-flex flex-col rounded-2xl px-5 py-4 backdrop-blur-sm"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.75)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)'}`, boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)' }}>
              <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: isDark ? '#475569' : '#9ca3af' }}>ROYALTY TODAY</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold" style={{ color: isDark ? 'white' : '#111827' }}>₹45,200</span>
                <span className="text-sm font-bold flex items-center gap-1" style={{ color: LIME_DARK }}>
                  <TrendingUp style={{ width: 13, height: 13 }} />+12%
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right form panel */}
      <div className="w-full lg:w-[48%] flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold text-white"
              style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}>B</div>
            <span className="text-xl font-bold" style={{ color: isDark ? 'white' : '#14532d' }}>Povital</span>
          </div>

          <div className="rounded-2xl p-8 sm:p-10"
            style={{
              background: isDark ? 'rgba(15,23,42,0.94)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.95)',
              boxShadow: isDark ? '0 8px 48px rgba(0,0,0,0.55)' : '0 4px 32px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
            }}>
            <AnimatePresence mode="wait">
              {view === 'login' && (
                <motion.div key="login" variants={slideVariants} initial="initial" animate="animate" exit="exit">
                  <div className="mb-7">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: LIME_DARK }}>Author Portal</p>
                    <h2 className="text-[1.85rem] font-extrabold mb-1.5" style={{ color: isDark ? 'white' : '#111827' }}>Sign in to your studio</h2>
                    <p className="text-sm" style={{ color: isDark ? '#64748b' : '#6b7280' }}>Welcome back. Let's get those words flowing.</p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-5 px-4 py-3 rounded-xl text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                        {error}
                      </motion.div>
                    )}
                    {successMsg && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-5 px-4 py-3 rounded-xl text-sm bg-lime-50 dark:bg-lime-500/10 border border-lime-200 dark:border-lime-500/20"
                        style={{ color: LIME_DARK }}>
                        {successMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <Field label="Email address" icon={<Mail style={{ width: 17, height: 17 }} />}
                      type="email" placeholder="ananya.writes@example.com"
                      value={email} onChange={(v) => { setEmail(v); setError(''); setSuccessMsg(''); }} autoFocus
                    />
                    <Field label="Password" icon={<Lock style={{ width: 17, height: 17 }} />}
                      type={showPwd ? 'text' : 'password'} placeholder="Enter your password"
                      value={password} onChange={(v) => { setPassword(v); setError(''); }}
                      labelRight={
                        <button type="button" onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setView('forgot-email'); setError(''); setSuccessMsg(''); }}
                          className="text-xs font-semibold hover:underline" style={{ color: LIME_DARK }}>
                          Forgot password?
                        </button>
                      }
                      rightEl={
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowPwd(p => !p)}
                          className="shrink-0 transition-colors" style={{ color: isDark ? '#475569' : '#9ca3af' }}>
                          {showPwd ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                        </button>
                      }
                    />

                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <div onClick={() => setKeepSignedIn(p => !p)}
                        className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer"
                        style={{ background: keepSignedIn ? LIME_DARK : 'transparent', borderColor: keepSignedIn ? LIME_DARK : '#d1d5db' }}>
                        {keepSignedIn && (
                          <svg viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10 }}>
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm" style={{ color: isDark ? '#64748b' : '#6b7280' }}>Keep me signed in</span>
                    </label>

                    <button type="submit" disabled={isLoading}
                      className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                      style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, color: 'white', boxShadow: isLoading ? 'none' : `0 4px 22px ${LIME}45`, opacity: isLoading ? 0.72 : 1 }}>
                      {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing In...</> : <><span>Sign In</span><ChevronRight style={{ width: 16, height: 16 }} /></>}
                    </button>
                  </form>

                  <div className="mt-7 pt-6 text-center" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9' }}>
                    <p className="text-sm" style={{ color: isDark ? '#475569' : '#6b7280' }}>
                      New to Povital?{' '}
                      <Link to="/author/signup" className="font-semibold hover:underline" style={{ color: LIME_DARK, textDecoration: 'none' }}>Become an author</Link>
                    </p>
                  </div>
                </motion.div>
              )}

              {view === 'forgot-email' && (
                <motion.div key="forgot-email" variants={slideVariants} initial="initial" animate="animate" exit="exit">
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={goBackToLogin}
                    className="flex items-center gap-1.5 text-xs font-medium mb-7 transition-colors hover:opacity-80"
                    style={{ color: isDark ? '#64748b' : '#6b7280' }}>
                    <ArrowLeft style={{ width: 14, height: 14 }} /> Back to sign in
                  </button>
                  <div className="mb-7">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${LIME}18`, border: `1.5px solid ${LIME}35` }}>
                      <KeyRound style={{ width: 20, height: 20, color: LIME_DARK }} />
                    </div>
                    <h2 className="text-[1.85rem] font-extrabold mb-1.5" style={{ color: isDark ? 'white' : '#111827' }}>Forgot Password?</h2>
                    <p className="text-sm" style={{ color: isDark ? '#64748b' : '#6b7280' }}>Enter your registered email to receive an OTP</p>
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-5 px-4 py-3 rounded-xl text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="space-y-5">
                    <Field label="Email Address" icon={<Mail style={{ width: 17, height: 17 }} />}
                      type="email" placeholder="Enter your registered email"
                      value={resetEmail} onChange={(v) => { setResetEmail(v); setError(''); }} autoFocus
                    />
                    <button type="button" onClick={sendResetOTP} disabled={isLoading}
                      className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                      style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, color: 'white', boxShadow: isLoading ? 'none' : `0 4px 22px ${LIME}45`, opacity: isLoading ? 0.72 : 1 }}>
                      {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending OTP...</> : <><span>Send OTP</span><ChevronRight style={{ width: 16, height: 16 }} /></>}
                    </button>
                  </div>
                </motion.div>
              )}

              {view === 'forgot-otp' && (
                <motion.div key="forgot-otp" variants={slideVariants} initial="initial" animate="animate" exit="exit">
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setView('forgot-email'); setError(''); }}
                    className="flex items-center gap-1.5 text-xs font-medium mb-7 transition-colors hover:opacity-80"
                    style={{ color: isDark ? '#64748b' : '#6b7280' }}>
                    <ArrowLeft style={{ width: 14, height: 14 }} /> Back
                  </button>
                  <div className="mb-7">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${LIME}18`, border: `1.5px solid ${LIME}35` }}>
                      <KeyRound style={{ width: 20, height: 20, color: LIME_DARK }} />
                    </div>
                    <h2 className="text-[1.85rem] font-extrabold mb-1.5" style={{ color: isDark ? 'white' : '#111827' }}>Reset Password</h2>
                    <p className="text-sm" style={{ color: isDark ? '#64748b' : '#6b7280' }}>
                      OTP sent to <span className="font-semibold" style={{ color: isDark ? '#e2e8f0' : '#111827' }}>{resetEmail}</span>
                    </p>
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-5 px-4 py-3 rounded-xl text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? '#cbd5e1' : '#374151' }}>6-Digit OTP</label>
                      <div className="relative">
                        <div className="flex gap-2.5">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex-1 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200"
                              style={{ height: 52, color: isDark ? 'white' : '#111827', background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', border: `2px solid ${otp.length === i ? LIME_DARK : otp.length > i ? `${LIME_DARK}60` : isDark ? 'rgba(255,255,255,0.10)' : '#e2e8f0'}`, boxShadow: otp.length === i ? `0 0 0 3px ${LIME}20` : 'none' }}>
                              {otp[i] || ''}
                            </div>
                          ))}
                        </div>
                        <input type="text" inputMode="numeric" maxLength={6} value={otp}
                          onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                          autoFocus className="absolute inset-0 opacity-0 cursor-text w-full" style={{ zIndex: 10 }} />
                      </div>
                    </div>
                    <Field label="New Password" icon={<Lock style={{ width: 17, height: 17 }} />}
                      type={showNewPwd ? 'text' : 'password'} placeholder="Enter new password"
                      value={newPassword} onChange={(v) => { setNewPassword(v); setError(''); }}
                      rightEl={
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowNewPwd(p => !p)}
                          className="shrink-0 transition-colors" style={{ color: isDark ? '#475569' : '#9ca3af' }}>
                          {showNewPwd ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                        </button>
                      }
                    />
                    <Field label="Confirm Password" icon={<Lock style={{ width: 17, height: 17 }} />}
                      type="password" placeholder="Re-enter new password"
                      value={confirmPassword} onChange={(v) => { setConfirmPassword(v); setError(''); }}
                      error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined}
                    />
                    <button type="submit" disabled={isLoading}
                      className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                      style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, color: 'white', boxShadow: isLoading ? 'none' : `0 4px 22px ${LIME}45`, opacity: isLoading ? 0.72 : 1 }}>
                      {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</> : <><span>Reset Password</span><ChevronRight style={{ width: 16, height: 16 }} /></>}
                    </button>
                    <p className="text-center text-xs" style={{ color: isDark ? '#475569' : '#6b7280' }}>
                      Didn't receive it?{' '}
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={sendResetOTP}
                        disabled={isLoading} className="font-semibold hover:underline" style={{ color: LIME_DARK }}>
                        Resend OTP
                      </button>
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes authRingCW { 0%{transform:translate(-50%,-50%) rotate(0deg)} 100%{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes authRingCCW { 0%{transform:translate(-50%,-50%) rotate(0deg)} 100%{transform:translate(-50%,-50%) rotate(-360deg)} }
      `}</style>
    </div>
  );
};

export default AuthorLoginPage;
