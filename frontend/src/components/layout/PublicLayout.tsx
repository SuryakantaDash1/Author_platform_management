import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import Footer from './Footer';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setIsLoginOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLoginOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';

  const navLinks = [
    { label: 'Explore Books', path: '/books' },
    { label: 'Our Impact', path: '/#stats' },
    { label: 'Testimonials', path: '/#testimonials' },
    { label: 'FAQ', path: '/#faq' },
  ];

  const isActive = (path: string) => {
    if (path.startsWith('/#')) return false;
    return location.pathname.startsWith(path);
  };

  const handleHashNav = (e: React.MouseEvent, path: string) => {
    if (path.startsWith('/#') && isHome) {
      e.preventDefault();
      const id = path.replace('/#', '');
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 overflow-x-hidden">
      {/* ── Header ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'shadow-md dark:shadow-neutral-900/60'
            : ''
        } bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold text-white"
                style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}>
                B
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ color: LIME_DARK }}>
                Povital
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleHashNav(e, link.path)}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'font-semibold'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  style={isActive(link.path) ? { color: LIME_DARK } : undefined}
                >
                  {link.label}
                </Link>
              ))}

              {/* Sign In Dropdown */}
              <div className="relative" ref={loginRef}>
                <button
                  onClick={() => setIsLoginOpen(!isLoginOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                  <ChevronDown className={`w-4 h-4 transition-transform ${isLoginOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLoginOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl overflow-hidden py-1 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                    <Link to="/author/login"
                      className="block px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      style={{ ['--tw-bg-opacity' as string]: '1' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f7ffe5')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      Author Login
                    </Link>
                    <Link to="/admin/login"
                      className="block px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = '#f7ffe5')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      Admin Login
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                to="/author/signup"
                className="hidden md:inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:shadow-lg hover:opacity-90"
                style={{
                  color: 'white',
                  background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`,
                  boxShadow: `0 4px 16px rgba(132,204,22,0.35)`,
                  textDecoration: 'none',
                }}
              >
                Enroll Now
              </Link>

              {/* Mobile toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
            <nav className="container-custom py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  onClick={(e) => handleHashNav(e, link.path)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-lime-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
              <Link to="/author/login"
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-lime-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Author Login
              </Link>
              <Link to="/admin/login"
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-lime-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Admin Login
              </Link>
              <div className="pt-3 px-4">
                <Link to="/author/signup"
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-bold"
                  style={{ color: 'white', background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, textDecoration: 'none' }}>
                  Enroll Now
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;
