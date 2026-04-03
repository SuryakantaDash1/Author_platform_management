import { Request, Response } from 'express';
import User from '../models/User.model';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @desc    Admin Login (Super Admin / Sub Admin)
 * @route   POST /api/admin/auth/login
 * @access  Public
 */
export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find admin user (include password for comparison)
  const user = await User.findOne({
    email,
    role: { $in: ['super_admin', 'sub_admin'] },
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const tokens = AuthService.generateTokens(user);

  // Return user data (without password)
  const userData = {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    tier: user.tier,
    isActive: user.isActive,
    permissions: user.permissions,
  };

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userData,
      tokens,
    },
  });
});

/**
 * @desc    Change Admin Password (when logged in)
 * @route   POST /api/admin/auth/change-password
 * @access  Private (Admin only)
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = (req as any).user.userId; // From auth middleware

  // Find user with password
  const user = await User.findOne({ userId }).select('+password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Update password
  user.password = newPassword; // Will be hashed by pre-save hook
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * @desc    Request password reset link via email
 * @route   POST /api/admin/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Find admin user
  const user = await User.findOne({
    email,
    role: { $in: ['super_admin', 'sub_admin'] },
  });

  if (!user) {
    // Don't reveal if user exists or not
    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
    return;
  }

  // Generate password reset token
  const resetToken = await AuthService.storePasswordResetToken(email);

  // Send reset email
  const resetLink = `${process.env.FRONTEND_URL}/admin/reset-password?token=${resetToken}`;
  await EmailService.sendAdminPasswordResetEmail(user.email!, user.getFullName(), resetLink);

  res.status(200).json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been sent.',
  });
});

/**
 * @desc    Reset password using token from email
 * @route   POST /api/admin/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  // Verify token and get email
  const email = await AuthService.verifyPasswordResetToken(token);

  if (!email) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  // Find admin user
  const user = await User.findOne({
    email,
    role: { $in: ['super_admin', 'sub_admin'] },
  }).select('+password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Update password
  user.password = newPassword; // Will be hashed by pre-save hook
  await user.save();

  // Delete the reset token
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  await require('../models/OTP.model').default.deleteOne({ otp: hashedToken, type: 'reset' });

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. You can now login with your new password.',
  });
});
