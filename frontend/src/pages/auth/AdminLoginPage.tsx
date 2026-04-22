import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ChevronRight, BookOpen, TrendingUp, Users, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../../api/axios.config';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';

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

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter both email and password'); return; }
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/admin/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.tokens);
        if (res.data.data.user.role === 'super_admin' || res.data.data.user.role === 'sub_admin') navigate('/admin/dashboard');
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setIsLoading(false); }
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: isDark ? '#07101f' : '#ffffff' }}>
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(132,204,22,0.07)' : 'rgba(101,163,13,0.06)'} 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
        {/* Right-side glow blob */}
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
              <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: isDark ? '#86efac' : '#4d7c0f' }}>Admin Control Panel</span>
            </div>
            <h1 className="font-extrabold mb-5" style={{ fontSize: '2.9rem', lineHeight: 1.1, color: isDark ? 'white' : '#14532d' }}>
              Manage with<br /><span style={{ color: LIME_DARK }}>Full Control</span>
            </h1>
            <p className="text-base leading-relaxed mb-12 max-w-[320px]" style={{ color: isDark ? '#94a3b8' : '#4b5563' }}>
              Access the complete dashboard to oversee authors, books, royalties, and platform analytics.
            </p>

            <div className="space-y-3 mb-14">
              {[
                { icon: Users, text: 'Manage all authors & user accounts' },
                { icon: BookOpen, text: 'Oversee book listings & approvals' },
                { icon: TrendingUp, text: 'Track royalties & platform revenue' },
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
              <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: isDark ? '#475569' : '#9ca3af' }}>PLATFORM AUTHORS</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold" style={{ color: isDark ? 'white' : '#111827' }}>10,000+</span>
                <span className="text-sm font-bold flex items-center gap-1" style={{ color: LIME_DARK }}>
                  <TrendingUp style={{ width: 13, height: 13 }} />Growing
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
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: LIME_DARK }}>Admin Portal</p>
              <h2 className="text-[1.9rem] font-extrabold mb-1.5" style={{ color: isDark ? 'white' : '#111827' }}>Sign in to dashboard</h2>
              <p className="text-sm" style={{ color: isDark ? '#64748b' : '#6b7280' }}>Restricted to authorized personnel only</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-6 px-4 py-3 rounded-xl text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-5">
              <Field label="Email / User ID" icon={<Mail style={{ width: 17, height: 17 }} />}
                type="email" placeholder="admin@povital.com"
                value={email} onChange={(v) => { setEmail(v); setError(''); }} autoFocus
              />
              <Field label="Password" icon={<Lock style={{ width: 17, height: 17 }} />}
                type={showPwd ? 'text' : 'password'} placeholder="Enter your password"
                value={password} onChange={(v) => { setPassword(v); setError(''); }}
                rightEl={
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowPwd(p => !p)}
                    className="shrink-0 transition-colors" style={{ color: isDark ? '#475569' : '#9ca3af' }}>
                    {showPwd ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                }
              />
              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, color: 'white', boxShadow: isLoading ? 'none' : `0 4px 22px ${LIME}45`, opacity: isLoading ? 0.72 : 1 }}>
                {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing In...</> : <><span>Sign In</span><ChevronRight style={{ width: 16, height: 16 }} /></>}
              </button>
            </form>

            <div className="mt-7 pt-6 text-center" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9' }}>
              <p className="text-sm" style={{ color: isDark ? '#475569' : '#6b7280' }}>
                Author?{' '}
                <Link to="/author/login" className="font-semibold hover:underline" style={{ color: LIME_DARK, textDecoration: 'none' }}>Sign in here</Link>
              </p>
            </div>
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

export default AdminLoginPage;
