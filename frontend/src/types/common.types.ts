export type UserRole = 'super_admin' | 'sub_admin' | 'author';
export type AccountTier = 'free' | 'basic' | 'pro' | 'enterprise';
export type BookStatus = 'draft' | 'pending' | 'published' | 'rejected';
export type TransactionType = 'royalty_payment' | 'subscription' | 'referral_commission';
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'general' | 'technical' | 'financial' | 'publishing' | 'other';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: any[];
}
