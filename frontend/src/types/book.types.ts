import { BookStatus } from './common.types';

export interface Book {
  _id: string;
  bookId: string;
  authorId: string;
  bookName: string;
  subtitle?: string;
  bookType: 'fiction' | 'non-fiction' | 'poetry' | 'children' | 'academic' | 'other';
  targetAudience?: string;
  coverPage?: string;
  uploadedFiles: string[];
  needFormatting: boolean;
  needCopyright: boolean;
  physicalCopies: number;
  royaltyPercentage: number;
  expectedLaunchDate: Date;
  actualLaunchDate?: Date;
  marketplaces: string[];
  platformWiseSales: Map<string, {
    sellingUnits: number;
    productLink?: string;
    rating?: number;
  }>;
  totalSellingUnits: number;
  totalRevenue: number;
  paymentStatus: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    paymentCompletionPercentage: number;
  };
  status: BookStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookRequest {
  bookName: string;
  subtitle?: string;
  bookType: 'fiction' | 'non-fiction' | 'poetry' | 'children' | 'academic' | 'other';
  targetAudience?: string;
  needFormatting?: boolean;
  needCopyright?: boolean;
  physicalCopies?: number;
  royaltyPercentage: number;
  expectedLaunchDate: Date;
  marketplaces?: string[];
}

export interface UpdateBookRequest {
  bookName?: string;
  subtitle?: string;
  bookType?: 'fiction' | 'non-fiction' | 'poetry' | 'children' | 'academic' | 'other';
  targetAudience?: string;
  needFormatting?: boolean;
  needCopyright?: boolean;
  physicalCopies?: number;
  expectedLaunchDate?: Date;
  marketplaces?: string[];
}

export interface UpdateBookStatusRequest {
  status: BookStatus;
  rejectionReason?: string;
}

export interface UpdateSalesDataRequest {
  platform: string;
  sellingUnits: number;
  productLink?: string;
  rating?: number;
}

export interface PricingSuggestion {
  language: string;
  bookType: string;
  priceRange: {
    min: number;
    max: number;
    suggested: number;
  };
}

export interface Transaction {
  _id: string;
  transactionId: string;
  authorId: string;
  type: 'royalty_payment' | 'subscription' | 'referral_commission';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  relatedBookId?: string;
  paymentMethod?: string;
  paymentDetails?: any;
  failureReason?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  authorId: string;
  subject: string;
  category: 'general' | 'technical' | 'financial' | 'publishing' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  lastResponseAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  ticketId: string;
  senderId: string;
  senderRole: 'author' | 'admin' | 'system';
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketRequest {
  subject: string;
  category: 'general' | 'technical' | 'financial' | 'publishing' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
}

export interface AddMessageRequest {
  message: string;
}
