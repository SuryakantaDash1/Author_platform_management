import crypto from 'crypto';
import env from '../config/env';

/**
 * Generate unique ID with prefix
 */
export const generateUniqueId = (prefix: string, length: number = 6): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const uniquePart = (timestamp + random).slice(-length);
  return `${prefix}${uniquePart}`;
};

/**
 * Generate OTP
 */
export const generateOTP = (): string => {
  const otp = Math.floor(Math.random() * Math.pow(10, env.OTP_LENGTH))
    .toString()
    .padStart(env.OTP_LENGTH, '0');
  return otp;
};

/**
 * Generate referral code
 */
export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < env.REFERRAL_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Encrypt data (for sensitive info like bank account numbers)
 */
export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    env.ENCRYPTION_ALGORITHM,
    Buffer.from(env.ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/**
 * Decrypt data
 */
export const decrypt = (text: string): string => {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');

  const decipher = crypto.createDecipheriv(
    env.ENCRYPTION_ALGORITHM,
    Buffer.from(env.ENCRYPTION_KEY),
    iv
  );

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

/**
 * Mask account number for display
 */
export const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return '****';
  const lastFour = accountNumber.slice(-4);
  const masked = '*'.repeat(accountNumber.length - 4) + lastFour;
  return masked;
};

/**
 * Calculate pagination
 */
export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const calculatePagination = (
  page: number,
  limit: number,
  total: number
): PaginationResult => {
  const currentPage = Math.max(1, page);
  const currentLimit = Math.min(limit, env.MAX_PAGE_SIZE);
  const skip = (currentPage - 1) * currentLimit;
  const totalPages = Math.ceil(total / currentLimit);

  return {
    page: currentPage,
    limit: currentLimit,
    skip,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Calculate royalty
 */
export interface RoyaltyCalculation {
  totalRevenue: number;
  productionCost: number;
  grossMargin: number;
  totalExpenses: number;
  netProfit: number;
  authorRoyalty: number;
  finalRoyalty: number;
}

export const calculateRoyalty = (
  platformWiseSales: any,
  expenses: any,
  royaltyPercentage: number,
  adjustments: { referralDeduction?: number; outstandingDeduction?: number } = {}
): RoyaltyCalculation => {
  let totalRevenue = 0;
  let productionCost = 0;

  // Calculate revenue from all platforms
  for (const platform in platformWiseSales) {
    const { units, sellingPrice, costPerUnit } = platformWiseSales[platform];
    totalRevenue += units * sellingPrice;
    productionCost += units * costPerUnit;
  }

  // Calculate margins
  const grossMargin = totalRevenue - productionCost;

  // Calculate total expenses
  const totalExpenses =
    (expenses.adsCost || 0) +
    (expenses.platformFees || 0) +
    (expenses.returnsExchanges || 0);

  // Calculate net profit
  const netProfit = grossMargin - totalExpenses;

  // Calculate author royalty
  const authorRoyalty = netProfit * (royaltyPercentage / 100);

  // Apply adjustments
  const referralDeduction = adjustments.referralDeduction || 0;
  const outstandingDeduction = adjustments.outstandingDeduction || 0;

  const finalRoyalty = Math.max(0, authorRoyalty - referralDeduction - outstandingDeduction);

  return {
    totalRevenue,
    productionCost,
    grossMargin,
    totalExpenses,
    netProfit,
    authorRoyalty,
    finalRoyalty,
  };
};

/**
 * Validate Indian PIN Code
 */
export const isValidPinCode = (pinCode: string): boolean => {
  const pinCodePattern = /^[1-9][0-9]{5}$/;
  return pinCodePattern.test(pinCode);
};

/**
 * Validate Indian Mobile Number
 */
export const isValidMobileNumber = (mobile: string): boolean => {
  const mobilePattern = /^[6-9]\d{9}$/;
  return mobilePattern.test(mobile);
};

/**
 * Validate IFSC Code
 */
export const isValidIFSC = (ifsc: string): boolean => {
  const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscPattern.test(ifsc);
};

/**
 * Generate password according to rules
 */
export const generatePassword = (firstName: string): string => {
  const nameBase = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const namePart = nameBase.length >= 4
    ? nameBase.slice(0, 4)
    : nameBase + '0'.repeat(4 - nameBase.length);
  const digits = Math.floor(Math.random() * 900 + 100).toString();
  return `${namePart}@${digits}`;
};

/**
 * Sanitize file name
 */
export const sanitizeFileName = (fileName: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = fileName.split('.').pop();
  const baseName = fileName.split('.').slice(0, -1).join('.');

  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  return `${sanitized}-${timestamp}-${randomString}.${extension}`;
};

/**
 * Sleep function for testing
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Get date range for month
 */
export const getMonthDateRange = (month: number, year: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
