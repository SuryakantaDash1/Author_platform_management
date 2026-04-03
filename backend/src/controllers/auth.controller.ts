import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.model';
import Author from '../models/Author.model';

export class AuthController {
  // Send OTP for email-based signup or login
  static sendOTP = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { email, type } = req.body;

      if (!email || !type) {
        throw new ApiError(400, 'Email and type are required');
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });

      if (type === 'signup' && existingUser) {
        throw new ApiError(400, 'Email already registered. Please login.');
      }

      if (type === 'login' && !existingUser) {
        throw new ApiError(404, 'Email not registered. Please sign up.');
      }

      // Generate and store OTP
      const otp = await AuthService.storeOTP(email, type);

      // Send OTP email
      await EmailService.sendOTPEmail(
        email,
        otp,
        type
      );

      res.status(200).json({
        success: true,
        message: `OTP sent successfully to ${email}`,
      });
    }
  );

  // Verify OTP and complete signup (DEPRECATED - Use /api/author/auth endpoints instead)
  static verifyOTPSignup = asyncHandler(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      throw new ApiError(
        410,
        'This endpoint is deprecated. Please use /api/author/auth/verify-otp-signup instead.'
      );
    }
  );

  // Verify OTP and login
  static verifyOTPLogin = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { email, otp } = req.body;

      if (!email || !otp) {
        throw new ApiError(400, 'Email and OTP are required');
      }

      // Verify OTP
      const isValid = await AuthService.verifyOTP(email, otp, 'login');
      if (!isValid) {
        throw new ApiError(400, 'Invalid or expired OTP');
      }

      // Get user
      const user = await User.findOne({ email });
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (!user.isActive) {
        throw new ApiError(403, 'Account is deactivated. Please contact support.');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const tokens = AuthService.generateTokens(user);

      // Get author details
      const author = await Author.findOne({ userId: user.userId });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            tier: user.tier,
          },
          author: author
            ? {
                authorId: author.authorId,
                referralCode: author.referralCode,
              }
            : null,
          tokens,
        },
      });
    }
  );

  // Google OAuth callback
  static googleOAuthCallback = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { code } = req.query;

      if (!code) {
        throw new ApiError(400, 'Authorization code is required');
      }

      // OAuth placeholder - implement with passport or oauth library
      const profile = {
        email: 'user@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        profilePicture: 'https://...',
      };

      const user = await AuthService.handleOAuthUser(profile);

      user.lastLogin = new Date();
      await user.save();

      const tokens = AuthService.generateTokens(user);

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`
      );
    }
  );

  // Microsoft OAuth callback
  static microsoftOAuthCallback = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { code } = req.query;

      if (!code) {
        throw new ApiError(400, 'Authorization code is required');
      }

      const profile = {
        email: 'user@outlook.com',
        firstName: 'Jane',
        lastName: 'Smith',
        profilePicture: 'https://...',
      };

      const user = await AuthService.handleOAuthUser(profile);

      user.lastLogin = new Date();
      await user.save();

      const tokens = AuthService.generateTokens(user);

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`
      );
    }
  );

  // Refresh access token
  static refreshToken = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
      }

      // Verify the refresh token and get userId
      const userId = AuthService.verifyRefreshToken(refreshToken);

      // Find the user to get current role/tier/permissions
      const user = await User.findOne({ userId });
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (!user.isActive) {
        throw new ApiError(403, 'Account is deactivated');
      }

      // Generate new tokens
      const tokens = AuthService.generateTokens(user);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    }
  );

  // Logout
  static logout = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    }
  );

  // Get current user profile
  static getCurrentUser = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const user = await User.findOne({ userId }).select('-__v');

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const author = await Author.findOne({ userId: user.userId }).select('-__v');

      res.status(200).json({
        success: true,
        data: {
          user,
          author,
        },
      });
    }
  );

  // Update user profile
  static updateProfile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { firstName, lastName } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const user = await User.findOne({ userId });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    }
  );

  // Change email
  static changeEmail = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { newEmail, otp } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      if (!newEmail || !otp) {
        throw new ApiError(400, 'New email and OTP are required');
      }

      const isValid = await AuthService.verifyOTP(newEmail, otp, 'reset');
      if (!isValid) {
        throw new ApiError(400, 'Invalid or expired OTP');
      }

      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        throw new ApiError(400, 'Email already in use');
      }

      const user = await User.findOne({ userId });
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      user.email = newEmail;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Email updated successfully',
      });
    }
  );

  // Enable 2FA (placeholder)
  static enable2FA = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const user = await User.findOne({ userId });
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Placeholder - implement 2FA with speakeasy
      const result = {
        secret: 'TEMP_SECRET',
        qrCode: 'data:image/png;base64,...',
        backupCodes: ['CODE1', 'CODE2', 'CODE3'],
      };

      res.status(200).json({
        success: true,
        message: '2FA enabled successfully',
        data: result,
      });
    }
  );

  // Verify 2FA (placeholder)
  static verify2FA = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { token } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      if (!token) {
        throw new ApiError(400, 'Token is required');
      }

      const user = await User.findOne({ userId });
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Placeholder validation
      const isValid = token.length === 6;

      if (!isValid) {
        throw new ApiError(400, 'Invalid 2FA token');
      }

      res.status(200).json({
        success: true,
        message: '2FA verified successfully',
      });
    }
  );

  // Disable 2FA (placeholder)
  static disable2FA = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { token } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      if (!token) {
        throw new ApiError(400, 'Token is required');
      }

      const user = await User.findOne({ userId });
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Placeholder validation
      const isValid = token.length === 6;
      if (!isValid) {
        throw new ApiError(400, 'Invalid 2FA token');
      }

      res.status(200).json({
        success: true,
        message: '2FA disabled successfully',
      });
    }
  );
}
