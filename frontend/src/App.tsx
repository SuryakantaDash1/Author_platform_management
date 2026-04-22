import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary, SuspenseFallback } from './components/common';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Lazy load layouts
const AuthorLayout = lazy(() => import('./components/layout/AuthorLayout'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const PublicLayout = lazy(() => import('./components/layout/PublicLayout'));

// Lazy load public pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const AdminLoginPage = lazy(() => import('./pages/auth/AdminLoginPage'));
const AuthorLoginPage = lazy(() => import('./pages/auth/AuthorLoginPage'));
const AuthorSignupPage = lazy(() => import('./pages/auth/AuthorSignupPage'));
const FeaturesPage = lazy(() => import('./pages/public/FeaturesPage'));
const PricingPage = lazy(() => import('./pages/public/PricingPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const HelpPage = lazy(() => import('./pages/public/HelpPage'));
const AuthorsPage = lazy(() => import('./pages/public/AuthorsPage'));
const BooksPage = lazy(() => import('./pages/public/BooksPage'));

// Lazy load author pages
const AuthorDashboard = lazy(() => import('./pages/author/Dashboard'));
const AuthorBooks = lazy(() => import('./pages/author/Books'));
const AuthorBankAccounts = lazy(() => import('./pages/author/BankAccounts'));
const AuthorReferrals = lazy(() => import('./pages/author/Referrals'));
const AuthorTickets = lazy(() => import('./pages/author/Tickets'));
const AuthorReviews = lazy(() => import('./pages/author/Reviews'));
const AuthorSettings = lazy(() => import('./pages/author/Settings'));
const AuthorRoyalties = lazy(() => import('./pages/author/Royalties'));

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminAuthors = lazy(() => import('./pages/admin/Authors'));
const AdminBooks = lazy(() => import('./pages/admin/Books'));
const AdminPaymentConfig = lazy(() => import('./pages/admin/PaymentConfig'));
const AdminSupport = lazy(() => import('./pages/admin/Support'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminSelling = lazy(() => import('./pages/admin/Selling'));
const AdminRoyalties = lazy(() => import('./pages/admin/Royalties'));

// 404 Page
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-neutral-900 dark:text-dark-900 mb-4">404</h1>
      <p className="text-lg text-neutral-600 dark:text-dark-600">Page not found</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<SuspenseFallback fullScreen />}>
              <Routes>
                {/* Public Routes (with header/footer) */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Navigate to="/author/login" replace />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/authors" element={<AuthorsPage />} />
                  <Route path="/books" element={<BooksPage />} />
                </Route>

                {/* Auth Routes (standalone — no header/footer) */}
                <Route path="/author/login" element={<AuthorLoginPage />} />
                <Route path="/author/signup" element={<AuthorSignupPage />} />
                <Route path="/author/register" element={<AuthorSignupPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Author Routes */}
                <Route
                  path="/author"
                  element={
                    <ProtectedRoute allowedRoles={['author']}>
                      <AuthorLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/author/dashboard" replace />} />
                  <Route path="dashboard" element={<AuthorDashboard />} />
                  <Route path="books" element={<AuthorBooks />} />
                  <Route path="bank-accounts" element={<AuthorBankAccounts />} />
                  <Route path="referrals" element={<AuthorReferrals />} />
                  <Route path="royalties" element={<AuthorRoyalties />} />
                  <Route path="tickets" element={<AuthorTickets />} />
                  <Route path="reviews" element={<AuthorReviews />} />
                  <Route path="settings" element={<AuthorSettings />} />
                </Route>

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin', 'sub_admin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="authors" element={<AdminAuthors />} />
                  <Route path="books" element={<AdminBooks />} />
                  <Route path="payment-config" element={<AdminPaymentConfig />} />
                  <Route path="selling" element={<AdminSelling />} />
                  <Route path="royalties" element={<AdminRoyalties />} />
                  <Route path="support" element={<AdminSupport />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
