import { format, formatDistance, formatRelative } from 'date-fns';

export const formatDate = (date: Date | string, pattern: string = 'MMM dd, yyyy'): string => {
  if (!date) return '';
  return format(new Date(date), pattern);
};

export const formatDateTime = (
  date: Date | string,
  pattern: string = 'MMM dd, yyyy hh:mm a'
): string => {
  if (!date) return '';
  return format(new Date(date), pattern);
};

export const formatRelativeDate = (date: Date | string): string => {
  if (!date) return '';
  return formatRelative(new Date(date), new Date());
};

export const formatDistanceDate = (date: Date | string): string => {
  if (!date) return '';
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatCompactNumber = (num: number): string => {
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)} K`;
  return num.toString();
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const formatPhoneNumber = (phone: string): string => {
  // Format Indian phone numbers as +91 XXXXX XXXXX
  if (phone.length === 10) {
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  return phone;
};

export const formatAccountNumber = (accountNumber: string): string => {
  // Show only last 4 digits
  if (accountNumber.length <= 4) return accountNumber;
  return `XXXX${accountNumber.slice(-4)}`;
};

export const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatBookType = (type: string): string => {
  const typeMap: Record<string, string> = {
    fiction: 'Fiction',
    'non-fiction': 'Non-Fiction',
    poetry: 'Poetry',
    children: "Children's",
    academic: 'Academic',
    other: 'Other',
  };
  return typeMap[type] || type;
};

export const formatUserRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    super_admin: 'Super Admin',
    sub_admin: 'Sub Admin',
    author: 'Author',
  };
  return roleMap[role] || role;
};

export const formatTier = (tier: string): string => {
  const tierMap: Record<string, string> = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };
  return tierMap[tier] || tier;
};

export const formatTransactionType = (type: string): string => {
  const typeMap: Record<string, string> = {
    royalty_payment: 'Royalty Payment',
    subscription: 'Subscription',
    referral_commission: 'Referral Commission',
  };
  return typeMap[type] || type;
};

export const formatTicketCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    general: 'General Inquiry',
    technical: 'Technical Issue',
    financial: 'Financial/Payments',
    publishing: 'Publishing',
    other: 'Other',
  };
  return categoryMap[category] || category;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};
