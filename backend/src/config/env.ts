import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;

  // Database
  MONGODB_URI: string;
  MONGODB_URI_PROD: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRE: string;

  // Client URLs
  CLIENT_URL: string;
  ADMIN_CLIENT_URL: string;
  AUTHOR_CLIENT_URL: string;

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;

  // Email
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM: string;

  // SMS
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;

  // OTP
  OTP_EXPIRE_MINUTES: number;
  OTP_LENGTH: number;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // File Upload
  MAX_FILE_SIZE: number;
  MAX_FILES_PER_UPLOAD: number;

  // Pagination
  DEFAULT_PAGE_SIZE: number;
  MAX_PAGE_SIZE: number;

  // Encryption
  ENCRYPTION_KEY: string;
  ENCRYPTION_ALGORITHM: string;

  // Logging
  LOG_LEVEL: string;
  LOG_FILE_PATH: string;

  // Referral
  REFERRAL_EARNING_AMOUNT: number;
  REFERRAL_CODE_LENGTH: number;

  // ID Prefixes
  AUTHOR_ID_PREFIX: string;
  BOOK_ID_PREFIX: string;
  TICKET_ID_PREFIX: string;
  TRANSACTION_ID_PREFIX: string;

  // PIN Code API
  PINCODE_API_URL: string;
}

const env: EnvConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_VERSION: process.env.API_VERSION || 'v1',

  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/povital_author_platform',
  MONGODB_URI_PROD: process.env.MONGODB_URI_PROD || '',

  JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret_for_dev_only_min_32_chars',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_min_32_chars',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  ADMIN_CLIENT_URL: process.env.ADMIN_CLIENT_URL || 'http://localhost:3000/admin',
  AUTHOR_CLIENT_URL: process.env.AUTHOR_CLIENT_URL || 'http://localhost:3000/author',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'POVITAL <noreply@povital.com>',

  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',

  OTP_EXPIRE_MINUTES: parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10),
  OTP_LENGTH: parseInt(process.env.OTP_LENGTH || '6', 10),

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '20971520', 10), // 20MB
  MAX_FILES_PER_UPLOAD: parseInt(process.env.MAX_FILES_PER_UPLOAD || '10', 10),

  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),

  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'fallback_32_char_key_for_dev_only',
  ENCRYPTION_ALGORITHM: process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc',

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs',

  REFERRAL_EARNING_AMOUNT: parseInt(process.env.REFERRAL_EARNING_AMOUNT || '500', 10),
  REFERRAL_CODE_LENGTH: parseInt(process.env.REFERRAL_CODE_LENGTH || '8', 10),

  AUTHOR_ID_PREFIX: process.env.AUTHOR_ID_PREFIX || 'AUT',
  BOOK_ID_PREFIX: process.env.BOOK_ID_PREFIX || 'BK',
  TICKET_ID_PREFIX: process.env.TICKET_ID_PREFIX || 'TKT',
  TRANSACTION_ID_PREFIX: process.env.TRANSACTION_ID_PREFIX || 'TXN',

  PINCODE_API_URL: process.env.PINCODE_API_URL || 'https://api.postalpincode.in/pincode',
};

// Validation for production
if (env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGODB_URI_PROD',
    'CLOUDINARY_CLOUD_NAME',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`❌ Missing required environment variable: ${envVar}`);
    }
  }
}

export default env;
