export type UserRole = 'super_admin' | 'sub_admin' | 'author';
export type AccountTier = 'free' | 'basic' | 'pro' | 'enterprise';
export type BookStatus = 'draft' | 'pending' | 'published' | 'rejected';
export type BookType = 'fiction' | 'non-fiction' | 'poetry' | 'children' | 'academic' | 'other';
export type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type PaymentMethod = 'bank_transfer' | 'upi' | 'other';
export type AccountType = 'primary' | 'secondary';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobile?: string;
  role: UserRole;
  tier: AccountTier;
  isActive: boolean;
  permissions?: string[];
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  role: UserRole;
  tier: AccountTier;
  permissions?: string[];
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
