import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { SuspenseFallback } from '../components/common/SuspenseFallback';

// Lazy load pages
const HomePage = lazy(() => import('../pages/public/HomePage'));
const FeaturesPage = lazy(() => import('../pages/public/FeaturesPage'));
const PricingPage = lazy(() => import('../pages/public/PricingPage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));
const HelpPage = lazy(() => import('../pages/public/HelpPage'));

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminAuthors = lazy(() => import('../pages/admin/Authors'));
const AdminBooks = lazy(() => import('../pages/admin/Books'));
const AdminTransactions = lazy(() => import('../pages/admin/Transactions'));
const AdminSupport = lazy(() => import('../pages/admin/Support'));
const AdminAnalytics = lazy(() => import('../pages/admin/Analytics'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));

const AuthorDashboard = lazy(() => import('../pages/author/Dashboard'));
const AuthorBooks = lazy(() => import('../pages/author/Books'));
const AuthorRoyalties = lazy(() => import('../pages/author/Royalties'));
const AuthorBankAccounts = lazy(() => import('../pages/author/BankAccounts'));
const AuthorReferrals = lazy(() => import('../pages/author/Referrals'));
const AuthorTickets = lazy(() => import('../pages/author/Tickets'));
const AuthorDocuments = lazy(() => import('../pages/author/Documents'));
const AuthorAnalytics = lazy(() => import('../pages/author/Analytics'));
const AuthorSettings = lazy(() => import('../pages/author/Settings'));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<SuspenseFallback fullScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          }
        />
        <Route
          path="/features"
          element={
            <PublicRoute>
              <FeaturesPage />
            </PublicRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <PublicRoute>
              <PricingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/about"
          element={
            <PublicRoute>
              <AboutPage />
            </PublicRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicRoute>
              <ContactPage />
            </PublicRoute>
          }
        />
        <Route
          path="/help"
          element={
            <PublicRoute>
              <HelpPage />
            </PublicRoute>
          }
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute restricted>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute restricted>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'sub_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/authors"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'sub_admin']}>
              <AdminAuthors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/books"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'sub_admin']}>
              <AdminBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'sub_admin']}>
              <AdminTransactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'sub_admin']}>
              <AdminSupport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'sub_admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'sub_admin']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* Author Routes */}
        <Route
          path="/author/dashboard"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <AuthorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/books"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <AuthorBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/royalties"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <AuthorRoyalties />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/bank-accounts"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <AuthorBankAccounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/referrals"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <AuthorReferrals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/tickets"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <AuthorTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/documents"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <AuthorDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/analytics"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <AuthorAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/settings"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <AuthorSettings />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
