import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Mail, Phone, MessageSquare, Building2 } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const importantLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Author Login', path: '/author/login' },
    { label: 'Master Login', path: '/admin/login' },
    { label: 'Book Listing', path: '/books' },
  ];

  return (
    <footer className="bg-indigo-950 dark:bg-dark-50 text-white mt-auto">
      <div className="container-custom py-14 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-white" />
              </div>
              <span className="text-h4 font-bold text-white">
                POVITAL
              </span>
            </Link>
            <p className="text-body-sm text-indigo-300 max-w-xs leading-relaxed">
              Empowering authors with powerful tools to manage, publish, and track their books across multiple platforms.
            </p>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-h5 font-bold text-white mb-5">Important Links</h3>
            <ul className="space-y-3">
              {importantLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-body-sm text-indigo-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Offices */}
          <div>
            <h3 className="text-h5 font-bold text-white mb-5">Offices</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0" />
                <p className="text-body-sm text-indigo-300 leading-relaxed">
                  123, MG Road, Connaught Place,<br />
                  New Delhi, India - 110001
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0" />
                <p className="text-body-sm text-indigo-300 leading-relaxed">
                  45, Sector 62, Noida,<br />
                  Uttar Pradesh, India - 201301
                </p>
              </div>
            </div>
          </div>

          {/* Get in Touch */}
          <div>
            <h3 className="text-h5 font-bold text-white mb-5">Get in Touch</h3>
            <div className="space-y-3">
              <a
                href="mailto:support@povital.com"
                className="flex items-center gap-3 text-body-sm text-indigo-300 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5 shrink-0" />
                support@povital.com
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-3 text-body-sm text-indigo-300 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5 shrink-0" />
                +91 98765 43210
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-body-sm text-indigo-300 hover:text-white transition-colors"
              >
                <MessageSquare className="w-5 h-5 shrink-0" />
                +91 98765 43210 (WhatsApp)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-indigo-800 dark:border-dark-300">
        <div className="container-custom py-5">
          <p className="text-body-xs text-indigo-400 text-center">
            &copy; {currentYear} POVITAL Author Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
