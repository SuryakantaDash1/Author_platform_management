/**
 * Route Configuration
 *
 * Centralized route paths for the application.
 * This ensures consistency and makes route management easier.
 */

export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FEATURES: '/features',
  PRICING: '/pricing',
  ABOUT: '/about',
  CONTACT: '/contact',
  HELP: '/help',

  // Author Routes
  AUTHOR: {
    ROOT: '/author',
    DASHBOARD: '/author/dashboard',
    BOOKS: '/author/books',
    BOOKS_ADD: '/author/books/add',
    BOOKS_EDIT: '/author/books/edit/:id',
    BOOKS_VIEW: '/author/books/:id',
    ROYALTIES: '/author/royalties',
    ANALYTICS: '/author/analytics',
    BANK_ACCOUNTS: '/author/bank-accounts',
    BANK_ACCOUNTS_ADD: '/author/bank-accounts/add',
    TICKETS: '/author/tickets',
    TICKETS_VIEW: '/author/tickets/:id',
    REFERRALS: '/author/referrals',
    DOCUMENTS: '/author/documents',
    SETTINGS: '/author/settings',
    PROFILE: '/author/profile',
  },

  // Admin Routes
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    AUTHORS: '/admin/authors',
    AUTHORS_VIEW: '/admin/authors/:id',
    AUTHORS_ADD: '/admin/authors/add',
    BOOKS: '/admin/books',
    BOOKS_VIEW: '/admin/books/:id',
    TRANSACTIONS: '/admin/transactions',
    ANALYTICS: '/admin/analytics',
    SUPPORT: '/admin/support',
    SUPPORT_VIEW: '/admin/support/:id',
    SETTINGS: '/admin/settings',
    PRICING_CONFIG: '/admin/pricing-config',
  },

  // Error Routes
  NOT_FOUND: '*',
} as const;

/**
 * Helper function to build dynamic routes
 */
export const buildRoute = (route: string, params: Record<string, string | number>): string => {
  let builtRoute = route;
  Object.entries(params).forEach(([key, value]) => {
    builtRoute = builtRoute.replace(`:${key}`, String(value));
  });
  return builtRoute;
};

/**
 * Example usage:
 * buildRoute(ROUTES.AUTHOR.BOOKS_EDIT, { id: 123 }) => '/author/books/edit/123'
 */
