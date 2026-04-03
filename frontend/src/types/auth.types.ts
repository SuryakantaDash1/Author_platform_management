import { UserRole, AccountTier } from './common.types';

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobile?: string;
  role: UserRole;
  tier: AccountTier;
  isActive: boolean;
  permissions?: string[];
  twoFactorEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  author?: {
    authorId: string;
    referralCode: string;
  };
  tokens: AuthTokens;
}

export interface SendOTPRequest {
  email: string;
  type: 'signup' | 'login' | 'reset';
}

export interface VerifyOTPSignupRequest {
  email: string;
  otp: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
}

export interface VerifyOTPLoginRequest {
  email: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
  otp: string;
}

export interface Enable2FAResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface Verify2FARequest {
  token: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
