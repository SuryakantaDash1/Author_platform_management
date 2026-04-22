import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  BookOpen, Users, Award, Globe, TrendingUp, Building2,
  Star, ShoppingCart, MapPin, Calendar, Plus, X as XIcon,
  ArrowRight, ChevronLeft, ChevronRight, Check, Send, MessageSquare,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Tokens                                                              */
/* ------------------------------------------------------------------ */
const LIME      = '#84CC16';
const LIME_DARK = '#65a30d';
const LIME_BG   = '#f7ffe5';
const LIME_LIGHT = '#ecfccb';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const stats = [
  { value: 10,    suffix: '+', label: 'Years of Experience',       icon: Award      },
  { value: 50,    suffix: '+', label: 'Team Members',               icon: Users      },
  { value: 1200,  suffix: '+', label: 'Happy Authors',              icon: TrendingUp },
  { value: 10000, suffix: '+', label: 'Books Published',            icon: BookOpen   },
  { value: 570,   suffix: '+', label: 'Offline Channels',           icon: Building2  },
  { value: 10,    suffix: '+', label: 'Online Platforms',           icon: Globe      },
];

const marqueeItems = [
  '10+ Years Experience', '1,200+ Happy Authors', '10,000+ Books Published',
  '100% Author Royalty',  '570+ Distribution Channels', '50+ Team Members', '10+ Online Platforms',
];

const placeholderBooks = [
  { id: 1, title: 'The River Wave',    type: 'Fiction', author: 'Ravi Sharma',  price: 299, originalPrice: 499, rating: 4.5, bg: 'linear-gradient(160deg,#0d2137 0%,#1a3a5c 40%,#0e4d6e 70%,#083248 100%)', accent: '#1e90c8' },
  { id: 2, title: 'The Dirty Wife',    type: 'Story',   author: 'Priya Patel',  price: 199, originalPrice: 399, rating: 4.2, bg: 'linear-gradient(160deg,#12082a 0%,#2d1060 40%,#4a1a8a 70%,#1e0845 100%)', accent: '#9b59d0' },
  { id: 3, title: 'The Dirty Wife',    type: 'Fiction', author: 'Amit Verma',   price: 349, originalPrice: 599, rating: 4.8, bg: 'linear-gradient(160deg,#0d2137 0%,#1a3a5c 40%,#0e4d6e 70%,#083248 100%)', accent: '#1e90c8' },
  { id: 4, title: 'The River Wave',    type: 'Story',   author: 'Neha Gupta',   price: 249, originalPrice: 449, rating: 4.5, bg: 'linear-gradient(160deg,#12082a 0%,#2d1060 40%,#4a1a8a 70%,#1e0845 100%)', accent: '#9b59d0' },
  { id: 5, title: 'Mindful Horizons',  type: 'Fiction', author: 'Arjun Das',    price: 199, originalPrice: 349, rating: 4.6, bg: 'linear-gradient(160deg,#0a1f2e 0%,#0e3351 40%,#09546b 70%,#052035 100%)', accent: '#17a3c4' },
  { id: 6, title: 'Soul of India',     type: 'Story',   author: 'Meena Roy',    price: 279, originalPrice: 449, rating: 4.3, bg: 'linear-gradient(160deg,#1a0a30 0%,#3b1570 40%,#5c2299 70%,#250c55 100%)', accent: '#a060e0' },
];

const placeholderAuthors = [
  { id: 1, name: 'Ravi Sharma',  location: 'Mumbai, India',    joinDate: 'Jan 2022', booksPublished: 5, netRoyalty: '1,24,000', color: LIME      },
  { id: 2, name: 'Priya Patel',  location: 'Delhi, India',     joinDate: 'Mar 2021', booksPublished: 8, netRoyalty: '2,56,000', color: LIME_DARK },
  { id: 3, name: 'Amit Verma',   location: 'Bangalore, India', joinDate: 'Jul 2023', booksPublished: 3, netRoyalty: '89,000',   color: '#4ade80' },
  { id: 4, name: 'Neha Gupta',   location: 'Pune, India',      joinDate: 'Nov 2022', booksPublished: 6, netRoyalty: '1,78,000', color: '#16a34a' },
];

const testimonials = [
  { id: 1, name: 'Namitha Mishra', role: 'Author', date: 'July 2024',      quote: 'The interface is user friendly and very efficient. The 100% royalty model is truly author-friendly. Povital transformed my entire publishing journey.',           rating: 5 },
  { id: 2, name: 'Rahul Desai',    role: 'Author', date: 'August 2024',    quote: 'I was struggling to find publishers for years. This platform gave me all the tools I needed to reach readers across India within weeks.',                          rating: 5 },
  { id: 3, name: 'Sneha Patel',    role: 'Author', date: 'September 2024', quote: 'Seeing my book in a local bookstore was a dream come true. Povital made it possible with their incredible distribution network.',                                  rating: 5 },
  { id: 4, name: 'Arjun Mehta',    role: 'Author', date: 'October 2024',   quote: 'From manuscript to final print — the team was supportive throughout. Best decision I made for my writing career.',                                                  rating: 5 },
];

const faqItems = [
  { question: 'How do I enroll as an Author?',          answer: 'You can enroll by visiting our registration page and selecting "I\'m Author". Fill in the details and our team will verify your account within 24 hours.' },
  { question: 'Can I publish multiple book types?',     answer: 'Yes! Povital supports Paperback, Hardcover, and E-Book formats. Manage all three from a single dashboard.' },
  { question: 'What royalty percentage do I receive?',  answer: 'Povital offers 100% author royalty on every sale — no hidden deductions or platform cuts from your earnings.' },
  { question: 'How does the distribution network work?', answer: 'We have 570+ offline channels across India and partner with 10+ leading online platforms. Your book gets listed within 7-10 working days of publication.' },
  { question: 'Is there a trial for new authors?',      answer: 'Yes! New authors get a free onboarding session, guided setup for their first book, and full platform access. Enroll today and start your journey.' },
];

/* ------------------------------------------------------------------ */
/*  AnimatedCounter                                                    */
/* ------------------------------------------------------------------ */
const AnimatedCounter: React.FC<{ target: number; suffix: string }> = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 1800 / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count >= 1000 ? `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k` : count}{suffix}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  StarRating                                                         */
/* ------------------------------------------------------------------ */
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'sm' }) => {
  const sz = size === 'sm' ? 14 : 18;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} style={{ width: sz, height: sz }}
          className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 dark:text-neutral-600'} />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  RevealBlock                                                        */
/* ------------------------------------------------------------------ */
const RevealBlock: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  BookCarousel                                                       */
/* ------------------------------------------------------------------ */
const BookCarousel: React.FC = () => {
  const [start, setStart] = useState(0);
  const total = placeholderBooks.length;
  const prev = useCallback(() => setStart(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setStart(i => (i + 1) % total), [total]);
  const visible = Array.from({ length: 4 }, (_, k) => placeholderBooks[(start + k) % total]);

  return (
    <div className="relative">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {visible.map((book, k) => (
          <motion.div key={`${book.id}-${start}`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: k * 0.06 }}
            className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer border border-neutral-100 dark:border-neutral-700">
            {/* Cover */}
            <div className="relative h-56 flex flex-col justify-between p-4 overflow-hidden" style={{ background: book.bg }}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 110%, ${book.accent}88, transparent)` }} />
              <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${book.accent}, transparent)` }} />
              <span className="relative z-10 self-start text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                {book.type}
              </span>
              <div className="relative z-10">
                <p className="text-[10px] text-white/50 mb-0.5 uppercase tracking-widest font-medium">Author Name</p>
                <h3 className="text-lg font-bold text-white leading-tight drop-shadow">{book.title}</h3>
              </div>
            </div>
            {/* Body */}
            <div className="p-4 bg-white dark:bg-neutral-800 space-y-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">by {book.author}</p>
              <div className="flex items-center gap-2">
                <StarRating rating={book.rating} />
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">{book.rating}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold" style={{ color: LIME_DARK }}>₹{book.price}</span>
                  <span className="text-xs text-neutral-400 line-through">₹{book.originalPrice}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: LIME_LIGHT, color: LIME_DARK }}>
                  {Math.round((1 - book.price / book.originalPrice) * 100)}% off
                </span>
              </div>
              <button
                className="w-full py-2 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-1.5 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, transition: 'opacity 0.25s ease, transform 0.25s ease' }}>
                <ShoppingCart style={{ width: 13, height: 13 }} /> Order Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-7">
        <button onClick={prev}
          className="p-2.5 rounded-full border bg-white dark:bg-neutral-800 hover:bg-lime-50 dark:hover:bg-neutral-700 transition-colors"
          style={{ borderColor: `rgba(132,204,22,0.35)`, color: LIME_DARK }}>
          <ChevronLeft style={{ width: 18, height: 18 }} />
        </button>
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => setStart(i)} className="rounded-full transition-all"
              style={{ width: i === start ? 28 : 10, height: 10, background: i === start ? LIME : 'rgba(132,204,22,0.22)' }} />
          ))}
        </div>
        <button onClick={next}
          className="p-2.5 rounded-full border bg-white dark:bg-neutral-800 hover:bg-lime-50 dark:hover:bg-neutral-700 transition-colors"
          style={{ borderColor: `rgba(132,204,22,0.35)`, color: LIME_DARK }}>
          <ChevronRight style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  TestimonialCarousel                                                */
/* ------------------------------------------------------------------ */
const TestimonialCarousel: React.FC = () => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % testimonials.length), 4500);
    return () => clearInterval(t);
  }, []);
  const t = testimonials[active];

  return (
    <div className="rounded-2xl p-8 bg-white dark:bg-neutral-800 shadow-sm border border-lime-100 dark:border-neutral-700">
      <AnimatePresence mode="wait">
        <motion.div key={active}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-xl font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}>
              {t.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 dark:text-white">{t.name}</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{t.role} · {t.date}</p>
            </div>
          </div>
          <StarRating rating={t.rating} size="md" />
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed italic">"{t.quote}"</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} className="rounded-full transition-all"
            style={{ width: i === active ? 28 : 10, height: 10, background: i === active ? LIME : '#e5e7eb' }} />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  FAQItem                                                            */
/* ------------------------------------------------------------------ */
const FAQItem: React.FC<{ question: string; answer: string; isOpen: boolean; onToggle: () => void; isLast: boolean }> = ({
  question, answer, isOpen, onToggle, isLast,
}) => (
  <div style={{ borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.08)' }}>
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onToggle}
      className="flex items-center justify-between w-full py-5 pr-2 text-left transition-colors"
      style={{ outline: 'none', background: 'transparent' }}
    >
      <span
        className={`text-base font-semibold leading-snug transition-colors ${!isOpen ? 'text-neutral-900 dark:text-white' : ''}`}
        style={isOpen ? { color: LIME_DARK } : {}}>
        {question}
      </span>
      <span
        className="ml-6 shrink-0 flex items-center justify-center transition-all duration-200"
        style={isOpen ? { color: LIME_DARK } : { color: '#9ca3af' }}>
        {isOpen
          ? <XIcon style={{ width: 18, height: 18 }} />
          : <Plus style={{ width: 20, height: 20 }} />}
      </span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <p className="pb-5 pr-8 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ================================================================== */
/*  HERO IMAGE CARD                                                    */
/* ================================================================== */
const HeroImageCard: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setTilt({ x: -ny * 12, y: nx * 12 });
  }, []);

  const handleMouseLeave = useCallback(() => setTilt(null), []);

  return (
    <div style={{ perspective: '1200px' }} className="w-full">
      <motion.div
        ref={ref}
        initial={{ y: 40, rotateY: -20, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          rotateY: tilt?.y ?? 0,
          rotateX: tilt?.x ?? 0,
        }}
        transition={
          tilt
            ? { rotateY: { duration: 0.12, ease: 'linear' }, rotateX: { duration: 0.12, ease: 'linear' } }
            : { y: { duration: 1, delay: 0.4, ease: [0.16,1,0.3,1] }, rotateY: { duration: 1, delay: 0.4 }, opacity: { duration: 0.8, delay: 0.4 } }
        }
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative rounded-3xl overflow-hidden cursor-pointer"
        style={{ aspectRatio: '4/3', boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.05)' }}
      >
        {/* Dark bg */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(145deg, #1a2744 0%, #0f172a 45%, #111827 100%)' }} />
        {/* Lime glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 55% at 55% 30%, rgba(132,204,22,0.1), transparent 70%)' }} />
        {/* Warm glow */}
        <div className="absolute bottom-0 left-0 w-60 h-44 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at bottom left, rgba(251,146,60,0.18), transparent 65%)' }} />

        {/* Illustration */}
        <svg viewBox="0 0 560 420" className="w-full h-full relative z-[1]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dashboard card bottom */}
          <rect x="50" y="295" width="240" height="98" rx="12" fill="rgba(255,255,255,0.055)" stroke="rgba(255,255,255,0.09)" strokeWidth="1"/>
          <rect x="68" y="310" width="60" height="6" rx="3" fill="rgba(255,255,255,0.45)"/>
          <rect x="68" y="322" width="38" height="4" rx="2" fill={LIME} opacity="0.65"/>
          <rect x="68" y="358" width="16" height="22" rx="3" fill={LIME} opacity="0.65"/>
          <rect x="90" y="348" width="16" height="32" rx="3" fill={LIME} opacity="0.8"/>
          <rect x="112" y="338" width="16" height="42" rx="3" fill={LIME} opacity="0.9"/>
          <rect x="134" y="345" width="16" height="35" rx="3" fill={LIME} opacity="0.7"/>
          <rect x="156" y="332" width="16" height="48" rx="3" fill={LIME} opacity="0.85"/>
          <rect x="178" y="350" width="16" height="30" rx="3" fill={LIME} opacity="0.6"/>
          <rect x="200" y="340" width="16" height="40" rx="3" fill={LIME} opacity="0.75"/>
          {/* Open book — left page */}
          <path d="M268 82 Q178 70 98 102 L98 302 Q178 278 268 294 Z" fill="rgba(247,255,229,0.93)"/>
          {/* Open book — right page */}
          <path d="M292 82 Q382 70 462 102 L462 302 Q382 278 292 294 Z" fill="rgba(255,255,255,0.9)"/>
          {/* Spine */}
          <rect x="265" y="78" width="10" height="220" rx="4" fill={LIME}/>
          {/* Left lines */}
          <rect x="116" y="130" width="52" height="7" rx="3.5" fill={LIME} opacity="0.55"/>
          <rect x="116" y="144" width="118" height="4" rx="2" fill="#94a3b8" opacity="0.55"/>
          <rect x="116" y="154" width="102" height="4" rx="2" fill="#94a3b8" opacity="0.5"/>
          <rect x="116" y="164" width="110" height="4" rx="2" fill="#94a3b8" opacity="0.45"/>
          <rect x="116" y="180" width="44" height="6" rx="3" fill={LIME} opacity="0.38"/>
          <rect x="116" y="192" width="106" height="4" rx="2" fill="#94a3b8" opacity="0.5"/>
          <rect x="116" y="202" width="88" height="4" rx="2" fill="#94a3b8" opacity="0.45"/>
          <rect x="116" y="228" width="100" height="4" rx="2" fill="#94a3b8" opacity="0.4"/>
          <rect x="116" y="238" width="82" height="4" rx="2" fill="#94a3b8" opacity="0.35"/>
          {/* Right lines */}
          <rect x="306" y="130" width="52" height="7" rx="3.5" fill={LIME} opacity="0.55"/>
          <rect x="306" y="144" width="122" height="4" rx="2" fill="#94a3b8" opacity="0.55"/>
          <rect x="306" y="154" width="106" height="4" rx="2" fill="#94a3b8" opacity="0.5"/>
          <rect x="306" y="164" width="114" height="4" rx="2" fill="#94a3b8" opacity="0.45"/>
          <rect x="306" y="180" width="44" height="6" rx="3" fill={LIME} opacity="0.38"/>
          <rect x="306" y="192" width="108" height="4" rx="2" fill="#94a3b8" opacity="0.5"/>
          <rect x="306" y="202" width="92" height="4" rx="2" fill="#94a3b8" opacity="0.45"/>
          {/* Bookmark */}
          <rect x="440" y="76" width="12" height="38" rx="3" fill={LIME} opacity="0.8"/>
          <polygon points="440,114 452,114 446,124" fill={LIME} opacity="0.8"/>
          {/* Book shadow */}
          <ellipse cx="280" cy="306" rx="125" ry="9" fill="rgba(0,0,0,0.28)"/>
          {/* Mini books floating */}
          <g transform="translate(48,44) rotate(-14)">
            <rect width="48" height="62" rx="6" fill="#1e3a5f"/>
            <rect x="6" y="12" width="30" height="3" rx="1.5" fill="rgba(255,255,255,0.55)"/>
            <rect x="6" y="19" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.35)"/>
            <rect x="6" y="26" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.35)"/>
          </g>
          <g transform="translate(464,36) rotate(10)">
            <rect width="48" height="62" rx="6" fill="#2d1060"/>
            <rect x="6" y="12" width="30" height="3" rx="1.5" fill="rgba(255,255,255,0.55)"/>
            <rect x="6" y="19" width="22" height="3" rx="1.5" fill="rgba(255,255,255,0.35)"/>
          </g>
          {/* Stat pill top center */}
          <rect x="205" y="28" width="150" height="32" rx="16" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <circle cx="228" cy="44" r="7" fill={LIME} opacity="0.8"/>
          <rect x="240" y="39" width="44" height="4" rx="2" fill="rgba(255,255,255,0.65)"/>
          <rect x="240" y="47" width="32" height="3" rx="1.5" fill="rgba(255,255,255,0.3)"/>
        </svg>

        {/* Dark gradient overlay — transparent → dark at bottom */}
        <div className="absolute inset-0 z-[2] pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(10,8,30,0.7) 100%)' }} />

        {/* Badge — 100% Royalty (top-right) */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-5 right-5 z-10 flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 28px rgba(0,0,0,0.18)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${LIME_DARK}, ${LIME})` }}>
            <Check className="text-white" style={{ width: 15, height: 15 }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] leading-none mb-1" style={{ color: '#94a3b8' }}>100% Royalty</p>
            <p className="text-sm font-extrabold leading-tight" style={{ color: '#0f172a' }}>Author First</p>
          </div>
        </motion.div>

        {/* Badge — 10,000+ Books (bottom-left) */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="absolute bottom-5 left-5 z-10 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 28px rgba(0,0,0,0.18)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: LIME }}>
            <BookOpen className="text-white" style={{ width: 15, height: 15 }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] leading-none mb-1" style={{ color: '#94a3b8' }}>Books Published</p>
            <p className="text-sm font-extrabold leading-tight" style={{ color: '#0f172a' }}>10,000+</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ================================================================== */
/*  HOME PAGE                                                          */
/* ================================================================== */
const HomePage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-neutral-950">

        {/* ── Background layer 1: Lime glow top-right ── */}
        <motion.div
          animate={{ scale: [1, 1.18, 1], x: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute pointer-events-none rounded-full"
          style={{
            top: -200, right: -200,
            width: 800, height: 800,
            background: 'radial-gradient(circle, rgba(132,204,22,0.15), transparent 65%)',
            filter: 'blur(56px)',
          }}
        />

        {/* ── Background layer 2: Lime glow bottom-left ── */}
        <motion.div
          animate={{ scale: [1, 1.22, 1], y: [0, 24, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute pointer-events-none rounded-full"
          style={{
            bottom: -150, left: -150,
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(163,230,53,0.10), transparent 65%)',
            filter: 'blur(48px)',
          }}
        />

        {/* ── Background layer 3: Dot grid ── */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(132,204,22,0.12) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* ── Background layer 4: Workspace image (right 60%) ── */}
        <div className="absolute right-0 top-0 bottom-0 pointer-events-none hidden md:block"
          style={{ width: '60%', background: 'linear-gradient(135deg, rgba(26,39,68,0.07) 0%, rgba(15,23,42,0.11) 50%, rgba(17,24,39,0.07) 100%)' }}
        />

        {/* ── Background layer 5: Gradient fade — blends workspace into white ── */}
        <div className="absolute inset-0 pointer-events-none hidden md:block"
          style={{
            background: 'linear-gradient(to right, white 45%, rgba(255,255,255,0.92) 60%, rgba(255,255,255,0.3) 80%, transparent 100%)',
          }}
        />
        {/* Dark mode gradient fade */}
        <div className="absolute inset-0 pointer-events-none hidden dark:md:block"
          style={{
            background: 'linear-gradient(to right, #09090b 45%, rgba(9,9,11,0.9) 60%, rgba(9,9,11,0.4) 80%, transparent 100%)',
          }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 w-full max-w-[1520px] mx-auto px-4 sm:px-6 md:px-8 xl:px-10 pt-24 pb-20">
          <div className="grid md:grid-cols-[1fr_1.15fr] gap-8 lg:gap-10 items-center">

            {/* LEFT */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 mb-7 px-5 py-2.5 rounded-full text-sm font-semibold"
                style={{
                  background: 'rgba(132,204,22,0.12)',
                  color: '#65A30D',
                  border: '1px solid rgba(132,204,22,0.35)',
                }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#65A30D' }} />
                India's #1 Publishing Platform
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.1, ease: [0.16,1,0.3,1] }}
                className="font-extrabold mb-6"
                style={{ fontSize: 'clamp(3rem, 5.5vw, 82px)', lineHeight: 1.05 }}>
                <span className="block text-slate-900 dark:text-white">Book Publishing</span>
                <span className="block"
                  style={{
                    background: 'linear-gradient(90deg, #65A30D, #84CC16, #A3E635)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                  in your Finger Tips!
                </span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl leading-relaxed mb-8 max-w-xl"
                style={{ color: '#475569' }}>
                Publish, distribute and earn 100% royalty with India's most trusted author platform. Your story reaches millions of readers across all channels.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  to="/author/signup"
                  className="inline-flex items-center justify-center gap-2 px-10 rounded-full font-bold transition-all hover:opacity-90"
                  style={{
                    height: 60,
                    color: 'white',
                    background: 'linear-gradient(135deg, #65A30D, #84CC16)',
                    boxShadow: '0 8px 28px rgba(132,204,22,0.4)',
                    fontSize: '1.05rem',
                    textDecoration: 'none',
                  }}>
                  Start Publishing <ArrowRight style={{ width: 20, height: 20 }} />
                </Link>
                <Link
                  to="/books"
                  className="inline-flex items-center justify-center gap-2 px-10 rounded-full font-semibold transition-all hover:border-lime-300 dark:hover:border-neutral-500"
                  style={{
                    height: 60,
                    color: '#334155',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    fontSize: '1.05rem',
                    textDecoration: 'none',
                  }}>
                  Explore Catalog
                </Link>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {['R','P','A','N'].map((l, i) => (
                    <div key={i}
                      className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: [LIME, LIME_DARK, '#4ade80', '#16a34a'][i] }}>
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="fill-amber-400 text-amber-400" style={{ width: 18, height: 18 }} />
                    ))}
                  </div>
                  <p className="text-base" style={{ color: '#64748b' }}>
                    Trusted by <span className="font-bold text-slate-800 dark:text-white">1,200+ Authors</span>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* RIGHT — HeroImageCard */}
            <div className="hidden md:block">
              <HeroImageCard />
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  MARQUEE                                                     */}
      {/* ============================================================ */}
      <div className="overflow-hidden py-4" style={{ background: `linear-gradient(90deg, ${LIME}, ${LIME_DARK})` }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          className="flex gap-10 whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="text-sm font-bold text-white flex items-center gap-3">
              <Star className="fill-white text-white shrink-0" style={{ width: 13, height: 13 }} /> {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/*  STATS                                                       */}
      {/* ============================================================ */}
      <section id="stats" className="dark:bg-neutral-900" style={{ background: LIME_BG }}>
        <div className="container-custom py-16 lg:py-24">
          <RevealBlock>
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: LIME_DARK }}>Our Impact</p>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white">Numbers That Tell Our Story</h2>
            </div>
          </RevealBlock>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
            {stats.map((s, idx) => (
              <RevealBlock key={idx} delay={idx * 0.07}>
                <div className="text-center px-4 py-8 rounded-2xl bg-white dark:bg-neutral-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(132,204,22,0.15)' }}>
                  <p className="text-3xl lg:text-4xl font-extrabold mb-3 leading-none"
                    style={{ color: idx % 2 === 0 ? LIME_DARK : '#F59E0B' }}>
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-snug font-bold uppercase tracking-[0.14em]">
                    {s.label}
                  </p>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BOOKS                                                       */}
      {/* ============================================================ */}
      <section id="explore" className="py-16 lg:py-20 bg-white dark:bg-neutral-950">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <RevealBlock>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: LIME_DARK }}>Book Catalog</p>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-white">Explore Books by Categories</h2>
              </div>
            </RevealBlock>
            <Link to="/books" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: LIME_DARK }}>
              Explore All <ArrowRight style={{ width: 15, height: 15 }} />
            </Link>
          </div>
          <BookCarousel />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                         */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${LIME} 0%, ${LIME_DARK} 55%, #3f6212 100%)` }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(circle, #d9f99d, transparent)' }} />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #a3e635, transparent)' }} />
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>
        <div className="container-custom py-16 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <RevealBlock>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-100 mb-4">Join Our Community</p>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-5 leading-tight">
                  Have a Book Idea and<br />Willing to be an Author?
                </h2>
                <p className="text-lg text-lime-100 mb-3 leading-relaxed">
                  Join thousands of authors who trust Povital to bring their books to life.
                </p>
                <p className="text-sm text-lime-200/75 mb-9">Join Our Community of 1,200+ Successful Authors</p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/author/signup"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white rounded-xl font-bold hover:bg-lime-50 transition-all hover:-translate-y-0.5 shadow-xl"
                    style={{ color: LIME_DARK }}>
                    Enroll Now <ArrowRight style={{ width: 18, height: 18 }} />
                  </Link>
                  <Link to="/about"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white border-2 border-white/40 hover:bg-white/15 transition-all">
                    Learn More
                  </Link>
                </div>
              </div>
            </RevealBlock>
            <RevealBlock delay={0.15}>
              <div className="space-y-3.5">
                {[
                  { icon: Check,      text: '100% Author Royalty — every single sale'         },
                  { icon: Globe,      text: '570+ Offline distribution channels across India' },
                  { icon: TrendingUp, text: 'Real-time sales & royalty tracking dashboard'    },
                  { icon: BookOpen,   text: 'Paperback, Hardcover, and E-Book all in one'     },
                  { icon: Users,      text: 'Dedicated author support team'                   },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-white/25">
                      <item.icon className="text-white" style={{ width: 18, height: 18 }} />
                    </div>
                    <p className="text-sm font-semibold text-white">{item.text}</p>
                  </div>
                ))}
              </div>
            </RevealBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  AUTHORS                                                     */}
      {/* ============================================================ */}
      <section className="py-16 lg:py-20 dark:bg-neutral-900" style={{ background: LIME_BG }}>
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <RevealBlock>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: LIME_DARK }}>Explore Authors</p>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-white">Connect with Our Greatest Authors</h2>
              </div>
            </RevealBlock>
            <Link to="/authors" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: LIME_DARK }}>
              Explore All Authors <ArrowRight style={{ width: 15, height: 15 }} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {placeholderAuthors.map((author, idx) => (
              <RevealBlock key={author.id} delay={idx * 0.08}>
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1.5 text-center group"
                  style={{ border: `1.5px solid ${LIME_LIGHT}` }}>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-extrabold text-white shadow-lg group-hover:scale-105 transition-transform"
                    style={{ background: `linear-gradient(135deg, ${author.color}cc, ${author.color})` }}>
                    {author.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">{author.name}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1 mt-1">
                    <MapPin style={{ width: 11, height: 11 }} /> {author.location}
                  </p>
                  <div className="mt-4 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                    <p className="flex items-center justify-center gap-1.5">
                      <Calendar style={{ width: 13, height: 13, color: LIME_DARK }} /> Joined {author.joinDate}
                    </p>
                    <p className="flex items-center justify-center gap-1.5">
                      <BookOpen style={{ width: 13, height: 13, color: LIME_DARK }} /> {author.booksPublished} Books Published
                    </p>
                    <p className="flex items-center justify-center gap-1.5">
                      <TrendingUp className="text-green-500" style={{ width: 13, height: 13 }} /> ₹{author.netRoyalty} Net Royalty
                    </p>
                  </div>
                  <button className="mt-5 w-full py-2 text-xs font-bold text-white rounded-lg transition-all hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}>
                    View Profile
                  </button>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TESTIMONIALS                                                */}
      {/* ============================================================ */}
      <section id="testimonials" className="bg-white dark:bg-neutral-950 py-16 lg:py-24">
        <div className="container-custom">
          <RevealBlock>
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: LIME_DARK }}>Testimonials</p>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white mb-3">What Our Authors Say</h2>
              <p className="text-base text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
                Real stories from real authors who transformed their publishing journey with Povital.
              </p>
            </div>
          </RevealBlock>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {testimonials.map((t, idx) => (
              <RevealBlock key={t.id} delay={idx * 0.08}>
                <div className="h-full rounded-2xl p-6 flex flex-col bg-white dark:bg-neutral-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
                  style={{ border: '1px solid rgba(132,204,22,0.18)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-extrabold text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">{t.name}</h4>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">{t.role} · {t.date}</p>
                    </div>
                  </div>
                  <StarRating rating={t.rating} size="sm" />
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed italic flex-1">
                    "{t.quote}"
                  </p>
                </div>
              </RevealBlock>
            ))}
          </div>
          {/* Bottom CTA */}
          <RevealBlock delay={0.2}>
            <div className="text-center">
              <Link to="/author/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ color: 'white', background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, boxShadow: '0 6px 24px rgba(132,204,22,0.35)', textDecoration: 'none' }}>
                <Send style={{ width: 16, height: 16 }} /> Write Your Review
              </Link>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ                                                         */}
      {/* ============================================================ */}
      <section id="faq" className="py-16 lg:py-24 dark:bg-neutral-900" style={{ background: LIME_BG }}>
        <div className="container-custom">
          <div className="grid lg:grid-cols-[5fr_8fr] gap-10 lg:gap-14 items-start">

            {/* Left */}
            <RevealBlock>
              <div className="lg:sticky lg:top-28 pr-0 lg:pr-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: LIME_DARK }}>Help Center</p>
                <h2 className="text-4xl lg:text-[2.75rem] font-extrabold text-neutral-900 dark:text-white mb-5 leading-tight">
                  Frequently Ask<br />Questions
                </h2>
                <p className="text-base text-neutral-600 dark:text-neutral-400 mb-9 leading-relaxed max-w-sm">
                  Ask anything via call, WhatsApp & email. We are committed to delivering the right information on your question.
                </p>
                <Link
                  to="/author/login"
                  className="inline-flex items-center justify-center px-9 py-4 rounded-full font-bold text-base mb-7 transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ color: 'white', background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, boxShadow: `0 8px 24px rgba(132,204,22,0.38)`, textDecoration: 'none' }}>
                  Write a Review
                </Link>
                <div className="flex items-center gap-2.5 mt-1">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="fill-amber-400 text-amber-400" style={{ width: 20, height: 20 }} />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Always our user top priority</p>
                </div>
              </div>
            </RevealBlock>

            {/* Right */}
            <RevealBlock delay={0.1}>
              <div className="rounded-2xl bg-white dark:bg-neutral-800 px-7"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                {faqItems.map((item, idx) => (
                  <FAQItem
                    key={idx}
                    question={item.question}
                    answer={item.answer}
                    isLast={idx === faqItems.length - 1}
                    isOpen={openFAQ === idx}
                    onToggle={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  />
                ))}
              </div>
            </RevealBlock>

          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
