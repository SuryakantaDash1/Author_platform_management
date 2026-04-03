import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectPath = '/login'
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    const defaultPaths: Record<UserRole, string> = {
      super_admin: '/admin/dashboard',
      sub_admin: '/admin/dashboard',
      author: '/author/dashboard',
    };

    return <Navigate to={defaultPaths[user.role] || '/unauthorized'} replace />;
  }

  // Check if restricted author trying to access forbidden pages
  if (user?.role === 'author' && user?.isRestricted) {
    const restrictedPaths = ['/author/books', '/author/analytics', '/author/earnings'];
    const currentPath = window.location.pathname;

    if (restrictedPaths.some(path => currentPath.startsWith(path))) {
      return <Navigate to="/author/profile" replace />;
    }
  }

  return <>{children}</>;
};
