import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Book,
  Users,
  MessageSquare,
  Settings,
  HelpCircle,
  X,
  DollarSign,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  userRole?: 'Author' | 'Admin' | 'SuperAdmin';
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  userRole = 'Author'
}) => {
  // Author menu items (Phase 2: Dashboard + Books + Support)
  const authorMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/author/dashboard' },
    { icon: Book, label: 'My Books', path: '/author/books' },
    { icon: MessageSquare, label: 'Help Desk', path: '/author/tickets' },
  ];

  // Admin menu items (Phase 2: Dashboard + Authors + Books + Pricing + Support + Settings)
  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Authors', path: '/admin/authors' },
    { icon: Book, label: 'Books', path: '/admin/books' },
    { icon: DollarSign, label: 'Pricing Config', path: '/admin/payment-config' },
    { icon: MessageSquare, label: 'Help Center', path: '/admin/support' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const menuItems = userRole === 'Author' ? authorMenuItems : adminMenuItems;

  const bottomMenuItems = [
    { icon: Settings, label: 'Settings', path: `/${userRole.toLowerCase()}/settings` },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white dark:bg-dark-100 border-r border-neutral-200 dark:border-dark-300 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-dark-300 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <Book className="w-5 h-5 text-white" />
            </div>
            <span className="text-h5 font-bold text-neutral-900 dark:text-dark-900">
              POVITAL
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-dark-600 dark:hover:text-dark-900 dark:hover:bg-dark-200 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
          {/* Main Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-neutral-700 dark:text-dark-700 hover:bg-neutral-100 dark:hover:bg-dark-200'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom Navigation */}
          <nav className="p-4 space-y-1 border-t border-neutral-200 dark:border-dark-300">
            {bottomMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-neutral-700 dark:text-dark-700 hover:bg-neutral-100 dark:hover:bg-dark-200'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
