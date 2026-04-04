import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Book, ChevronDown, Menu, X } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import Button from '../common/Button';
import Footer from './Footer';

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setIsLoginOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLoginOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Authors', path: '/authors' },
    { label: 'Books', path: '/books' },
    { label: 'About Us', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-light-primary dark:bg-bg-dark-primary">
      {/* Public Header */}
      <header className="sticky top-0 z-sticky bg-white/80 dark:bg-dark-100/80 backdrop-blur-md border-b border-neutral-200 dark:border-dark-300">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <span className="text-h5 font-bold text-neutral-900 dark:text-dark-900">
                POVITAL
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-body-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-neutral-700 dark:text-dark-700 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Login Dropdown */}
              <div className="relative" ref={loginRef}>
                <button
                  onClick={() => setIsLoginOpen(!isLoginOpen)}
                  className="flex items-center gap-1 text-body-sm font-medium text-neutral-700 dark:text-dark-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Login
                  <ChevronDown className={`w-4 h-4 transition-transform ${isLoginOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLoginOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-100 rounded-xl shadow-lg border border-neutral-200 dark:border-dark-300 overflow-hidden py-1">
                    <Link
                      to="/author/login"
                      className="block px-4 py-2.5 text-body-sm text-neutral-700 dark:text-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-200 transition-colors"
                    >
                      Author Login
                    </Link>
                    <Link
                      to="/admin/login"
                      className="block px-4 py-2.5 text-body-sm text-neutral-700 dark:text-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-200 transition-colors"
                    >
                      Admin Login
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/admin/login" className="hidden md:block">
                <Button variant="ghost" size="sm">
                  Admin
                </Button>
              </Link>
              <Link to="/author/signup" className="hidden md:block">
                <Button variant="primary" size="sm">
                  I'm Author
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-dark-600 dark:hover:text-dark-900 dark:hover:bg-dark-200 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-dark-300 bg-white dark:bg-dark-100">
            <nav className="container-custom py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2.5 rounded-lg text-body-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-neutral-700 dark:text-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/author/login"
                className="block px-4 py-2.5 rounded-lg text-body-sm font-medium text-neutral-700 dark:text-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-200 transition-colors"
              >
                Author Login
              </Link>
              <Link
                to="/admin/login"
                className="block px-4 py-2.5 rounded-lg text-body-sm font-medium text-neutral-700 dark:text-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-200 transition-colors"
              >
                Admin Login
              </Link>
              <div className="pt-3 px-4">
                <Link to="/author/signup">
                  <Button variant="primary" size="sm" fullWidth>
                    I'm Author
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
