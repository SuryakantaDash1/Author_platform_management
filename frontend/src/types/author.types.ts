export interface Author {
  _id: string;
  userId: string;
  authorId: string;
  profilePicture?: string;
  publishedArticles?: Array<{ bookName: string; isbn?: string; bookPhoto?: string; links?: Array<{ platform: string; url: string }> }>;
  address?: {
    pinCode?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    housePlot?: string;
    landmark?: string;
  };
  referralCode: string;
  referredBy?: string;
  totalBooks: number;
  totalEarnings: number;
  totalSoldUnits: number;
  isRestricted: boolean;
  restrictionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateAuthorProfileRequest {
  publishedArticles?: Array<{ bookName: string; isbn?: string; bookPhoto?: string; links?: Array<{ platform: string; url: string }> }>;
  address?: {
    pinCode?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    housePlot?: string;
    landmark?: string;
  };
}

export interface BankAccount {
  _id: string;
  authorId: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string; // Last 4 digits only
  ifscCode: string;
  branchName: string;
  accountType: 'primary' | 'secondary';
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddBankAccountRequest {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountType?: 'primary' | 'secondary';
}

export interface DashboardStats {
  overview: {
    totalBooks: number;
    publishedBooks: number;
    pendingBooks: number;
    totalEarnings: number;
    pendingPayments: number;
    totalSoldUnits: number;
  };
  recentTransactions: any[];
  topSellingBook: any;
}

export interface SalesAnalytics {
  overview: {
    totalUnits: number;
    totalRevenue: number;
  };
  platformWiseSales: Record<string, {
    sellingUnits: number;
    count: number;
  }>;
  bookTypeDistribution: Array<{
    _id: string;
    count: number;
  }>;
}
