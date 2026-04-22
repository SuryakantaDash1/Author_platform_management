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
    <footer className="text-white mt-auto" style={{ background: '#0f172a' }}>
      <div className="container-custom py-14 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #84CC16, #65a30d)' }}>
                <Book className="w-6 h-6 text-white" />
              </div>
              <span className="text-h4 font-bold text-white">Povital</span>
            </Link>
            <p className="text-body-sm max-w-xs leading-relaxed" style={{ color: '#94a3b8' }}>
              Empowering authors with powerful tools to manage, publish, and track their books across multiple platforms.
            </p>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-h5 font-bold text-white mb-5">Important Links</h3>
            <ul className="space-y-3">
              {importantLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-body-sm transition-colors hover:text-white" style={{ color: '#94a3b8' }}>
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
                <Building2 className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#84CC16' }} />
                <p className="text-body-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                  123, MG Road, Connaught Place,<br />
                  New Delhi, India - 110001
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#84CC16' }} />
                <p className="text-body-sm leading-relaxed" style={{ color: '#94a3b8' }}>
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
              <a href="mailto:support@povital.com"
                className="flex items-center gap-3 text-body-sm transition-colors hover:text-white" style={{ color: '#94a3b8' }}>
                <Mail className="w-5 h-5 shrink-0" style={{ color: '#84CC16' }} />
                support@povital.com
              </a>
              <a href="tel:+919876543210"
                className="flex items-center gap-3 text-body-sm transition-colors hover:text-white" style={{ color: '#94a3b8' }}>
                <Phone className="w-5 h-5 shrink-0" style={{ color: '#84CC16' }} />
                +91 98765 43210
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-body-sm transition-colors hover:text-white" style={{ color: '#94a3b8' }}>
                <MessageSquare className="w-5 h-5 shrink-0" style={{ color: '#84CC16' }} />
                +91 98765 43210 (WhatsApp)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container-custom py-5">
          <p className="text-body-xs text-center" style={{ color: '#64748b' }}>
            &copy; {currentYear} Povital Author Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
