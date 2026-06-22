import React from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Book, Users, MessageSquare, Settings, X,
  DollarSign, CreditCard, Gift, Star, TrendingUp, BarChart3, Calculator,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  module?: string;        // sub_admin needs this permission
  superAdminOnly?: true;  // only super_admin sees it
}

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  userRole?: 'Author' | 'Admin' | 'SuperAdmin';
}

const adminSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'OVERVIEW',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',  path: '/admin/dashboard' },
      { icon: Users,           label: 'Authors',    path: '/admin/authors',    module: 'authors' },
      { icon: Book,            label: 'Books',      path: '/admin/books',      module: 'books' },
      { icon: BarChart3,       label: 'Selling',    path: '/admin/selling',    module: 'selling' },
      { icon: TrendingUp,      label: 'Royalties',  path: '/admin/royalties',  module: 'royalties' },
    ],
  },
  {
    title: 'CONFIGURE',
    items: [
      { icon: DollarSign,    label: 'Pricing Config',    path: '/admin/payment-config',    module: 'payments' },
      { icon: Calculator,    label: 'Calculator Config', path: '/admin/calculator-config', module: 'calculator' },
      { icon: MessageSquare, label: 'Help Center',       path: '/admin/support',           module: 'support' },
      { icon: Star,          label: 'Reviews',           path: '/admin/reviews',           module: 'reviews' },
      { icon: ShieldCheck,   label: 'Sub Admins',        path: '/admin/sub-admins',        superAdminOnly: true },
      { icon: Settings,      label: 'Settings',          path: '/admin/settings' },
    ],
  },
];

const authorItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',     path: '/author/dashboard' },
  { icon: Book,            label: 'My Books',      path: '/author/books' },
  { icon: TrendingUp,      label: 'Royalties',     path: '/author/royalties' },
  { icon: CreditCard,      label: 'Bank Accounts', path: '/author/bank-accounts' },
  { icon: Gift,            label: 'Referrals',     path: '/author/referrals' },
  { icon: MessageSquare,   label: 'Help Desk',     path: '/author/tickets' },
  { icon: Star,            label: 'Reviews',       path: '/author/reviews' },
  { icon: Settings,        label: 'Settings',      path: '/author/settings' },
];

const NavItemComp: React.FC<{ item: NavItem; onClose?: () => void }> = ({ item, onClose }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'text-lime-700 dark:text-lime-400'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`
      }
      style={({ isActive }) =>
        isActive ? { backgroundColor: 'rgba(132,204,22,0.10)' } : undefined
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            style={{ width: 17, height: 17, flexShrink: 0, color: isActive ? LIME_DARK : '#9ca3af' }}
          />
          <span className="flex-1 truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
};

function isItemVisible(item: NavItem, role: string, permissions: string[]): boolean {
  if (item.superAdminOnly) return role === 'super_admin';
  if (!item.module) return true; // always visible (Dashboard, Settings)
  if (role === 'super_admin') return true;
  return permissions.includes(item.module);
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'sub_admin';
  const userRole = user?.role ?? 'author';
  const permissions = user?.permissions ?? [];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          bg-white dark:bg-neutral-900
          border-r border-neutral-200 dark:border-neutral-800
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
            >
              P
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold" style={{ color: LIME_DARK }}>Povital</span>
              {isAdmin && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{
                    color: LIME_DARK,
                    background: 'rgba(132,204,22,0.12)',
                    border: '1px solid rgba(132,204,22,0.25)',
                  }}
                >
                  ADMIN
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
          {isAdmin ? (
            <nav className="flex-1 px-3 py-4 space-y-5">
              {adminSections.map(section => {
                const visibleItems = section.items.filter(item =>
                  isItemVisible(item, userRole, permissions)
                );
                if (visibleItems.length === 0) return null;
                return (
                  <div key={section.title}>
                    <p className="px-3 mb-1.5 text-xs font-semibold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase select-none">
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {visibleItems.map(item => (
                        <NavItemComp key={item.path} item={item} onClose={onClose} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          ) : (
            <nav className="flex-1 px-3 py-4">
              <div className="space-y-0.5">
                {authorItems.map(item => (
                  <NavItemComp key={item.path} item={item} onClose={onClose} />
                ))}
              </div>
            </nav>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
