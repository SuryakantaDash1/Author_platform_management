import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import { Book } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import Button from '../common/Button';

const PublicLayout: React.FC = () => {
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

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/features"
                className="text-body-sm font-medium text-neutral-700 dark:text-dark-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="text-body-sm font-medium text-neutral-700 dark:text-dark-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="text-body-sm font-medium text-neutral-700 dark:text-dark-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-body-sm font-medium text-neutral-700 dark:text-dark-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/admin/login">
                <Button variant="ghost" size="sm">
                  Admin
                </Button>
              </Link>
              <Link to="/author/signup">
                <Button variant="primary" size="sm">
                  I'm Author
                </Button>
              </Link>
            </div>
          </div>
        </div>
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
