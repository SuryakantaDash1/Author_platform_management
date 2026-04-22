import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Phone, User, Gift, ChevronRight, Eye, EyeOff, ArrowLeft, Check, TrendingUp, Star } from 'lucide-react';
import axiosInstance from '../../api/axios.config';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';

type Step = 'form' | 'otp' | 'password';
interface Step1Errors { firstName?: string; mobile?: string; email?: string; }
interface Step3Errors { password?: string; confirmPassword?: string; }

interface FieldProps {
  label: React.ReactNode;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  rightEl?: React.ReactNode;
  error?: string;
  prefix?: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const Field: React.FC<FieldProps> = ({ label, icon, type, placeholder, value, onChange, autoFocus, rightEl, error, prefix, inputRef }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{label}</label>
    <div className={`group flex items-center border rounded-xl bg-white dark:bg-slate-800/60 transition-colors duration-200 focus-within:ring-2 focus-within:ring-lime-500/25 focus-within:border-lime-500 dark:focus-within:border-lime-500 ${prefix ? 'overflow-hidden' : ''} ${error ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-slate-700'}`}>
      {prefix}
      <div className="flex items-center gap-2.5 flex-1 px-3.5 py-3">
        {icon}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          ref={inputRef}
          className="flex-1 min-w-0 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
        />
        {rightEl}
      </div>
    </div>
    {error && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>}
  </div>
);

const stepVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.22 } },
};

const AuthorSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();

  const [step, setStep] = useState<Step>('form');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const [step3Errors, setStep3Errors] = useState<Step3Errors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errors: Step1Errors = {};
    if (!firstName.trim()) errors.firstName = 'First name is required';
    else if (firstName.trim().length < 2) errors.firstName = 'At least 2 characters';
    if (!mobile) errors.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(mobile)) errors.mobile = 'Must be 10 digits';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
    if (Object.keys(errors).length > 0) { setStep1Errors(errors); return; }
    if (!agreed) { setError('Please agree to the Terms and Privacy Policy'); return; }
    setStep1Errors({});
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/author/auth/send-signup-otp', { email });
      if (res.data.success) setStep('otp');
      else setError(res.data.message || 'Failed to send OTP');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError('Please enter the complete 6-digit OTP'); return; }
    setError('');
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/author/auth/check-otp', { email, otp });
      if (res.data.success) setStep('password');
      else setError(res.data.message || 'Invalid OTP');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);
    try { await axiosInstance.post('/author/auth/send-signup-otp', { email }); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed to resend OTP'); }
    finally { setIsLoading(false); }
  };

  const handleRegister = async () => {
    setError('');
    const errors: Step3Errors = {};
    if (!password) errors.password = 'Password is required';
    else if (password.length < 4) errors.password = 'At least 4 characters';
    else if ((password.match(/\d/g) || []).length < 3) errors.password = 'Must include at least 3 numbers';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) { setStep3Errors(errors); return; }
    setStep3Errors({});
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/author/auth/verify-otp-signup', {
        email, otp, firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        mobile: mobile.trim(), password,
        referralCode: referralCode.trim() || undefined,
      });
      if (res.data.success) { login(res.data.data.user, res.data.data.tokens); navigate('/author/dashboard'); }
      else setError(res.data.message || 'Registration failed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pwdChecks = [
    { ok: password.length >= 4, label: 'Minimum 4 characters' },
    { ok: (password.match(/\d/g) || []).length >= 3, label: 'At least 3 numbers' },
    { ok: !!password && !!confirmPassword && password === confirmPassword, label: 'Passwords match' },
  ];

  const isDark = theme === 'dark';
  const firstNameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (step === 'form') setTimeout(() => firstNameRef.current?.focus(), 80); }, [step]);

  const stepKeys: Step[] = ['form', 'otp', 'password'];
  const stepLabels = ['Details', 'Verify', 'Password'];

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

          <div className="my-auto py-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: LIME_DARK }} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: isDark ? '#86efac' : '#4d7c0f' }}>India's #1 Publishing Platform</span>
            </div>
            <h1 className="font-extrabold mb-5" style={{ fontSize: '2.9rem', lineHeight: 1.08, color: isDark ? 'white' : '#14532d' }}>
              Become a <span style={{ color: LIME_DARK }}>published</span><br />
              author in <em style={{ color: LIME_DARK, fontStyle: 'italic' }}>days</em>,<br />
              not years.
            </h1>
            <p className="text-base leading-relaxed mb-10 max-w-[320px]" style={{ color: isDark ? '#94a3b8' : '#4b5563' }}>
              Join 10,000+ professional authors earning royalties up to ₹1 lakh every month. Free to start. Always 100% royalty.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-12">
              {['Free ISBN & cover design', 'Print + eBook + Audio', 'Pay-out every 30 days', 'Dedicated success manager'].map((feat) => (
                <div key={feat} className="flex items-start gap-2 text-sm" style={{ color: isDark ? '#cbd5e1' : '#374151' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${LIME}25`, border: `1.5px solid ${LIME_DARK}` }}>
                    <Check style={{ width: 10, height: 10, color: LIME_DARK }} />
                  </div>
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="rounded-2xl p-5" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'}`, backdropFilter: 'blur(12px)' }}>
              <div className="text-3xl font-serif leading-none mb-3" style={{ color: `${LIME_DARK}60` }}>"</div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: isDark ? '#94a3b8' : '#4b5563' }}>
                I made more in my first 3 months on Povital than 2 years with my previous publisher.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white"
                    style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}>AR</div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: isDark ? 'white' : '#111827' }}>Arjun Raghav</p>
                    <p className="text-[11px]" style={{ color: isDark ? '#64748b' : '#6b7280' }}>Author, "The River Wave"</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} style={{ width: 12, height: 12, fill: '#f59e0b', color: '#f59e0b' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right form panel */}
      <div className="w-full lg:w-[48%] flex items-center justify-center px-5 py-10 relative z-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[430px] my-auto"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
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

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {stepLabels.map((label, i) => {
                const currentIdx = stepKeys.indexOf(step);
                const isDone = i < currentIdx;
                const isActive = i === currentIdx;
                return (
                  <React.Fragment key={label}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                        style={{
                          background: isDone ? LIME_DARK : isActive ? `${LIME}25` : isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                          border: `2px solid ${isDone || isActive ? LIME_DARK : isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                          color: isDone ? 'white' : isActive ? LIME_DARK : '#94a3b8',
                        }}>
                        {isDone ? <Check style={{ width: 11, height: 11 }} /> : i + 1}
                      </div>
                      <span className="text-xs font-medium hidden sm:block" style={{ color: isActive ? LIME_DARK : isDone ? `${LIME_DARK}90` : '#94a3b8' }}>
                        {label}
                      </span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div className="flex-1 h-px transition-all duration-500"
                        style={{ background: i < currentIdx ? LIME_DARK : isDark ? 'rgba(255,255,255,0.10)' : '#e2e8f0' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {/* ── STEP 1: FORM ── */}
              {step === 'form' && (
                <motion.div key="form" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: LIME_DARK }}>Author Sign Up</p>
                    <h2 className="text-[1.7rem] font-extrabold mb-1" style={{ color: isDark ? 'white' : '#111827' }}>Create your author account</h2>
                    <p className="text-sm" style={{ color: isDark ? '#64748b' : '#6b7280' }}>Takes 60 seconds. No card required.</p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-5 px-4 py-3 rounded-xl text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="First name *"
                        icon={
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'rgba(132,204,22,0.10)', border: '1px solid rgba(132,204,22,0.30)' }}>
                            <User style={{ width: 14, height: 14, color: '#65a30d', display: 'block' }} />
                          </span>
                        }
                        type="text" placeholder="First name" value={firstName}
                        inputRef={firstNameRef}
                        onChange={(v) => { setFirstName(v); if (step1Errors.firstName) setStep1Errors(p => ({ ...p, firstName: undefined })); }}
                        error={step1Errors.firstName}
                      />
                      <Field
                        label="Last name"
                        icon={
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'rgba(132,204,22,0.10)', border: '1px solid rgba(132,204,22,0.30)' }}>
                            <User style={{ width: 14, height: 14, color: '#65a30d', display: 'block' }} />
                          </span>
                        }
                        type="text" placeholder="Optional" value={lastName} onChange={setLastName}
                      />
                    </div>

                    <Field label="Mobile number *" icon={<Phone style={{ width: 16, height: 16, color: '#6b7280', flexShrink: 0 }} />}
                      type="tel" placeholder="10-digit mobile number" value={mobile}
                      onChange={(v) => { setMobile(v.replace(/\D/g, '').slice(0, 10)); if (step1Errors.mobile) setStep1Errors(p => ({ ...p, mobile: undefined })); }}
                      error={step1Errors.mobile}
                      prefix={
                        <span className="px-3 py-3 text-sm font-semibold border-r shrink-0 select-none"
                          style={{ color: isDark ? '#94a3b8' : '#374151', borderColor: isDark ? 'rgba(255,255,255,0.10)' : '#e5e7eb', background: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb' }}>
                          +91
                        </span>
                      }
                    />

                    <Field label="Email address *" icon={<Mail style={{ width: 16, height: 16, color: '#6b7280', flexShrink: 0 }} />}
                      type="email" placeholder="you@example.com" value={email}
                      onChange={(v) => { setEmail(v); if (step1Errors.email) setStep1Errors(p => ({ ...p, email: undefined })); }}
                      error={step1Errors.email}
                    />

                    <Field
                      label={<span>Referral code <span className="text-xs font-normal normal-case tracking-normal" style={{ color: '#9ca3af' }}>OPTIONAL</span></span>}
                      icon={<Gift style={{ width: 16, height: 16, color: '#6b7280', flexShrink: 0 }} />}
                      type="text" placeholder="Have a referral code?" value={referralCode} onChange={setReferralCode}
                    />

                    <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                      <div
                        onClick={() => setAgreed(p => !p)}
                        className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 cursor-pointer"
                        style={{ background: agreed ? LIME_DARK : 'transparent', borderColor: agreed ? LIME_DARK : '#d1d5db' }}>
                        {agreed && <svg viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10 }}><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <span className="text-sm leading-snug" style={{ color: isDark ? '#94a3b8' : '#4b5563' }}>
                        I agree to the{' '}
                        <span className="font-semibold cursor-pointer hover:underline" style={{ color: LIME_DARK }}>Terms</span>
                        {' '}and{' '}
                        <span className="font-semibold cursor-pointer hover:underline" style={{ color: LIME_DARK }}>Privacy Policy</span>.
                      </span>
                    </label>

                    <button type="submit" disabled={isLoading}
                      className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:opacity-90 mt-1"
                      style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, color: 'white', boxShadow: isLoading ? 'none' : `0 4px 22px ${LIME}45`, opacity: isLoading ? 0.72 : 1 }}>
                      {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending OTP...</> : <><span>Create author account</span><ChevronRight style={{ width: 16, height: 16 }} /></>}
                    </button>
                  </form>

                  <div className="mt-6 pt-5 text-center" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f0fdf4' }}>
                    <p className="text-sm" style={{ color: isDark ? '#475569' : '#6b7280' }}>
                      Already have an account?{' '}
                      <Link to="/author/login" className="font-semibold hover:underline" style={{ color: LIME_DARK, textDecoration: 'none' }}>Sign in here</Link>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: OTP ── */}
              {step === 'otp' && (
                <motion.div key="otp" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <button type="button" onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setStep('form'); setOtp(''); setError(''); }}
                    className="flex items-center gap-1.5 text-xs font-medium mb-7 transition-colors hover:opacity-80"
                    style={{ color: isDark ? '#64748b' : '#6b7280' }}>
                    <ArrowLeft style={{ width: 14, height: 14 }} /> Back
                  </button>

                  <div className="mb-7">
                    <h2 className="text-[1.7rem] font-extrabold mb-1.5" style={{ color: isDark ? 'white' : '#111827' }}>Verify your email</h2>
                    <p className="text-sm" style={{ color: isDark ? '#64748b' : '#6b7280' }}>
                      OTP sent to <span className="font-semibold" style={{ color: isDark ? '#e2e8f0' : '#111827' }}>{email}</span>
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

                  <div className="mb-7">
                    <label className="block text-sm font-medium mb-3" style={{ color: isDark ? '#cbd5e1' : '#374151' }}>Enter 6-digit OTP</label>
                    <div className="relative">
                      <div className="flex gap-2.5">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="flex-1 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200"
                            style={{
                              height: 54,
                              color: isDark ? 'white' : '#111827',
                              background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                              border: `2px solid ${otp.length === i ? LIME_DARK : otp.length > i ? `${LIME_DARK}60` : isDark ? 'rgba(255,255,255,0.10)' : '#e2e8f0'}`,
                              boxShadow: otp.length === i ? `0 0 0 3px ${LIME}20` : 'none',
                            }}>
                            {otp[i] || ''}
                          </div>
                        ))}
                      </div>
                      <input type="text" inputMode="numeric" maxLength={6} value={otp}
                        onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                        autoFocus className="absolute inset-0 opacity-0 cursor-text w-full" style={{ zIndex: 10 }} />
                    </div>
                  </div>

                  <button type="button" onClick={handleVerifyOTP} disabled={isLoading || otp.length < 6}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
                    style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, color: 'white', boxShadow: (isLoading || otp.length < 6) ? 'none' : `0 4px 22px ${LIME}45`, opacity: (isLoading || otp.length < 6) ? 0.52 : 1 }}>
                    {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</> : <><span>Verify OTP</span><ChevronRight style={{ width: 16, height: 16 }} /></>}
                  </button>

                  <p className="text-center text-xs mt-5" style={{ color: isDark ? '#475569' : '#6b7280' }}>
                    Didn't receive it?{' '}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={handleResendOTP} disabled={isLoading}
                      className="font-semibold hover:underline" style={{ color: LIME_DARK }}>Resend OTP</button>
                  </p>
                </motion.div>
              )}

              {/* ── STEP 3: PASSWORD ── */}
              {step === 'password' && (
                <motion.div key="password" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <div className="mb-7">
                    <h2 className="text-[1.7rem] font-extrabold mb-1.5" style={{ color: isDark ? 'white' : '#111827' }}>Set your password</h2>
                    <p className="text-sm" style={{ color: isDark ? '#64748b' : '#6b7280' }}>Create a secure password for your account</p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-5 px-4 py-3 rounded-xl text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4 mb-5">
                    <Field label="Password" icon={<Lock style={{ width: 16, height: 16, color: '#6b7280', flexShrink: 0 }} />}
                      type={showPwd ? 'text' : 'password'} placeholder="Enter your password" value={password} autoFocus
                      onChange={(v) => { setPassword(v); if (step3Errors.password) setStep3Errors(p => ({ ...p, password: undefined })); }}
                      error={step3Errors.password}
                      rightEl={
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowPwd(p => !p)}
                          className="shrink-0 transition-colors" style={{ color: isDark ? '#475569' : '#9ca3af' }}>
                          {showPwd ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                        </button>
                      }
                    />
                    <Field label="Confirm password" icon={<Lock style={{ width: 16, height: 16, color: '#6b7280', flexShrink: 0 }} />}
                      type="password" placeholder="Re-enter your password" value={confirmPassword}
                      onChange={(v) => { setConfirmPassword(v); if (step3Errors.confirmPassword) setStep3Errors(p => ({ ...p, confirmPassword: undefined })); }}
                      error={step3Errors.confirmPassword}
                    />
                  </div>

                  <div className="rounded-xl px-4 py-3.5 mb-6 space-y-2.5" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#f0fdf4', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #dcfce7' }}>
                    {pwdChecks.map(({ ok, label }) => (
                      <div key={label} className="flex items-center gap-2.5 text-xs transition-colors duration-200">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                          style={{ background: ok ? LIME_DARK : 'transparent', border: `1.5px solid ${ok ? LIME_DARK : '#cbd5e1'}` }}>
                          {ok && <Check style={{ width: 9, height: 9, color: 'white' }} />}
                        </div>
                        <span style={{ color: ok ? LIME_DARK : '#94a3b8' }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={handleRegister} disabled={isLoading}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, color: 'white', boxShadow: isLoading ? 'none' : `0 4px 22px ${LIME}45`, opacity: isLoading ? 0.72 : 1 }}>
                    {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Account...</> : <><span>Create Account</span><ChevronRight style={{ width: 16, height: 16 }} /></>}
                  </button>
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

export default AuthorSignupPage;
