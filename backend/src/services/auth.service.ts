import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import Author from '../models/Author.model';
import OTP from '../models/OTP.model';
import Referral from '../models/Referral.model';
import { Tokens, JWTPayload } from '../types';
import { generateUniqueId, generateReferralCode } from '../utils/helpers';

export class AuthService {
  // Generate OTP
  static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Store OTP in database
  static async storeOTP(email: string, type: 'signup' | 'login' | 'reset'): Promise<string> {
    // Delete existing OTPs for this email and type
    await OTP.deleteMany({ email, type });

    // Generate new OTP
    const otp = this.generateOTP();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // Store in database (expires in 10 minutes)
    await OTP.create({
      email,
      otp: hashedOTP,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return otp;
  }

  // Verify OTP
  static async verifyOTP(
    email: string,
    otp: string,
    type: 'signup' | 'login' | 'reset'
  ): Promise<boolean> {
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const otpRecord = await OTP.findOne({
      email,
      type,
      otp: hashedOTP,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      // Check if OTP exists but wrong
      const existingOTP = await OTP.findOne({ email, type, expiresAt: { $gt: new Date() } });
      if (existingOTP) {
        existingOTP.attempts += 1;
        await existingOTP.save();

        if (existingOTP.attempts >= 3) {
          await OTP.deleteOne({ _id: existingOTP._id });
          throw new Error('Maximum OTP attempts exceeded');
        }
      }
      return false;
    }

    // OTP is valid, delete it
    await OTP.deleteOne({ _id: otpRecord._id });
    return true;
  }

  // Generate JWT tokens
  static generateTokens(user: any): Tokens {
    const payload: JWTPayload = {
      userId: user.userId,
      role: user.role,
      tier: user.tier,
      permissions: user.permissions,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '24h' as any,
    });

    const refreshToken = jwt.sign({ userId: user.userId }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d' as any,
    });

    return { accessToken, refreshToken };
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): string {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
      return decoded.userId;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Generate password reset token
  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Store password reset token
  static async storePasswordResetToken(email: string): Promise<string> {
    const token = this.generatePasswordResetToken();
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Store hashed token in OTP collection with type 'reset'
    await OTP.deleteMany({ email, type: 'reset' });
    await OTP.create({
      email,
      otp: hashedToken,
      type: 'reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    return token; // Return unhashed token to send via email
  }

  // Verify password reset token
  static async verifyPasswordResetToken(token: string): Promise<string | null> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const otpRecord = await OTP.findOne({
      otp: hashedToken,
      type: 'reset',
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return null;
    }

    return otpRecord.email;
  }

  // Create new user and author
  static async createAuthor(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    referralCode?: string;
  }) {
    // Generate IDs
    const userId = generateUniqueId('USR');
    const authorId = generateUniqueId('AUT');
    const newReferralCode = generateReferralCode();

    // Create user with password
    const user = await User.create({
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password, // Will be hashed by pre-save hook
      role: 'author',
      tier: 'free',
      isActive: true,
    });

    // Create author profile
    let referredBy: string | undefined;
    let referrerAuthorId: string | undefined;
    let usedReferralCode: string | undefined;

    if (data.referralCode) {
      const referrer = await Author.findOne({ referralCode: data.referralCode.toUpperCase() });
      if (referrer) {
        referredBy = referrer.authorId;
        referrerAuthorId = referrer.authorId;
        usedReferralCode = data.referralCode.toUpperCase();
      }
    }

    const author = await Author.create({
      userId,
      authorId,
      referralCode: newReferralCode,
      referredBy,
    });

    // Create Referral record so the referrer can see this in their referrals list
    if (referrerAuthorId && usedReferralCode) {
      await Referral.create({
        referrerId: referrerAuthorId,
        referredAuthorId: authorId,
        referralCode: usedReferralCode,
        earningPercentage: 0, // Admin sets the actual percentage later
        totalEarnings: 0,
        availableBalance: 0,
        utilizedBalance: 0,
        isActive: true,
      });
    }

    return { user, author };
  }

  // OAuth user creation/login
  static async handleOAuthUser(profile: {
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }) {
    // Check if user exists
    let user = await User.findOne({ email: profile.email });

    if (!user) {
      // Create new user via OAuth (no password required)
      const userId = generateUniqueId('USR');
      const authorId = generateUniqueId('AUT');
      const referralCode = generateReferralCode();

      // Create user without password (OAuth authentication)
      user = await User.create({
        userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        role: 'author',
        tier: 'free',
        isActive: true,
      });

      // Create author profile
      await Author.create({
        userId,
        authorId,
        referralCode,
        profilePicture: profile.profilePicture,
      });
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    return user;
  }
}
