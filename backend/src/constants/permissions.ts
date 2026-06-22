export const MODULES = [
  'authors',
  'books',
  'selling',
  'royalties',
  'support',
  'reviews',
  'payments',
  'calculator',
  'analytics',
] as const;

export type Module = typeof MODULES[number];

export const MODULE_LABELS: Record<Module, string> = {
  authors:    'Authors Management',
  books:      'Books Management',
  selling:    'Selling Records',
  royalties:  'Royalties & Payments',
  support:    'Help Center / Support',
  reviews:    'Reviews',
  payments:   'Payment Config',
  calculator: 'Calculator Config',
  analytics:  'Analytics & Stats',
};
