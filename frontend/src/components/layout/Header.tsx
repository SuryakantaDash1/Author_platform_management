import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings, Book } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import Button from '../common/Button';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/api/interceptors';
import { API_ENDPOINTS } from '@/api/endpoints';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenuButton = true }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const isAuthor = user?.role === 'author';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'sub_admin';

  // Fetch author profile picture
  useEffect(() => {
    if (!isAuthenticated || !isAuthor) return;
    const fetchProfileImage = async () => {
      try {
        const res = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_PROFILE);
        if (res.data?.success) {
          setProfileImage(res.data.data.author?.profilePicture || null);
        }
      } catch {
        // Non-critical — silently ignore
      }
    };
    fetchProfileImage();

    // Listen for profile updates
    const handler = () => fetchProfileImage();
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, [isAuthenticated, isAuthor]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Role-based routes
  const profileRoute = isAuthor ? '/author/dashboard' : isAdmin ? '/admin/dashboard' : '/';
  const settingsRoute = isAuthor ? '/author/settings' : isAdmin ? '/admin/settings' : '/settings';

  // Mock notifications
  const notifications = [
    { id: 1, message: 'New royalty payment received', time: '5 min ago', read: false },
    { id: 2, message: 'Book "My Novel" is now published', time: '1 hour ago', read: false },
    { id: 3, message: 'Profile updated successfully', time: '2 hours ago', read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-sticky bg-white dark:bg-dark-100 border-b border-neutral-200 dark:border-dark-300 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-dark-600 dark:hover:text-dark-900 dark:hover:bg-dark-200 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

            {!isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/login')} className="hidden sm:block">
                  Admin
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/author/signup')}>
                  I'm Author
                </Button>
              </>
            ) : (
              <>
                {/* User Profile */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-200 transition-colors"
                    aria-label="User menu"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-dark-300"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-body-sm">
                          {user?.firstName?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="hidden md:block text-left">
                      <p className="text-body-sm font-medium text-neutral-900 dark:text-dark-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-body-xs text-neutral-500 dark:text-dark-500 capitalize">
                        {user?.role?.replace('_', ' ')}
                      </p>
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-100 rounded-xl shadow-lg border border-neutral-200 dark:border-dark-300 overflow-hidden">
                      <div className="p-4 border-b border-neutral-200 dark:border-dark-300">
                        <p className="text-body font-medium text-neutral-900 dark:text-dark-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-body-sm text-neutral-500 dark:text-dark-500">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          to={profileRoute}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-body-sm text-neutral-700 dark:text-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-200 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link
                          to={settingsRoute}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-body-sm text-neutral-700 dark:text-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-200 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </div>
                      <div className="p-2 border-t border-neutral-200 dark:border-dark-300">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-body-sm text-error-DEFAULT hover:bg-error-light/10 dark:hover:bg-error-dark/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
