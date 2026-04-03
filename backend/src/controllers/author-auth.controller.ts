import { Request, Response } from 'express';
import User from '../models/User.model';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { validateAuthorPassword } from '../utils/password.util';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @desc    Send OTP to email for author signup
 * @route   POST /api/author/auth/send-signup-otp
 * @access  Public
 */
export const sendSignupOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'An account with this email already exists');
  }

  // Generate and store OTP
  const otp = await AuthService.storeOTP(email, 'signup');

  // Send OTP email
  await EmailService.sendOTPEmail(email, otp, 'signup');

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully to your email',
  });
});

/**
 * @desc    Verify OTP and complete author registration with password
 * @route   POST /api/author/auth/verify-otp-signup
 * @access  Public
 */
export const verifyOTPAndRegister = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, firstName, lastName, mobile, password, referralCode } = req.body;

  // Validate author password
  const passwordValidation = validateAuthorPassword(password);
  if (!passwordValidation.valid) {
    const errors = passwordValidation.errors;
    let errorMessage = 'Password does not meet requirements: ';

    if (errors.insufficientNumbers) {
      errorMessage += 'must include at least 3 numbers; ';
    }
    if (errors.tooShort) {
      errorMessage += 'must be at least 4 characters; ';
    }

    throw new ApiError(400, errorMessage.trim());
  }

  // Verify OTP
  const isOTPValid = await AuthService.verifyOTP(email, otp, 'signup');
  if (!isOTPValid) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  // Check if user already exists (in case they verified OTP multiple times)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'An account with this email already exists');
  }

  // Create author account with password
  const { user } = await AuthService.createAuthor({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email,
    password,
    referralCode: referralCode?.trim(),
  });

  // Update mobile and last login
  if (mobile) {
    user.mobile = mobile;
  }
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const tokens = AuthService.generateTokens(user);

  // Send welcome email
  await EmailService.sendWelcomeEmail(email, user.getFullName());

  // Return user data
  const userData = {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    tier: user.tier,
    isActive: user.isActive,
    isRestricted: user.isRestricted,
  };

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      user: userData,
      tokens,
    },
  });
});

/**
 * @desc    Author login with email and password
 * @route   POST /api/author/auth/login
 * @access  Public
 */
export const authorLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find author user (include password for comparison)
  const user = await User.findOne({
    email,
    role: 'author',
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
    isRestricted: user.isRestricted,
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
 * @desc    Send OTP to email for forgot password (author)
 * @route   POST /api/author/auth/send-login-otp
 * @access  Public
 */
export const sendLoginOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Find author user
  const user = await User.findOne({ email, role: 'author' });

  if (!user) {
    // Don't reveal if user exists or not
    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, an OTP has been sent.',
    });
    return;
  }

  // Generate and store OTP
  const otp = await AuthService.storeOTP(email, 'reset');

  // Send OTP email for password reset
  await EmailService.sendOTPEmail(email, otp, 'reset');

  res.status(200).json({
    success: true,
    message: 'If an account exists with this email, an OTP has been sent.',
  });
});

/**
 * @desc    Verify OTP and reset author password
 * @route   POST /api/author/auth/verify-login-otp
 * @access  Public
 */
export const verifyLoginOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  // Find author user
  const user = await User.findOne({ email, role: 'author' }).select('+password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Validate new password
  const passwordValidation = validateAuthorPassword(newPassword);
  if (!passwordValidation.valid) {
    const errors = passwordValidation.errors;
    let errorMessage = 'Password does not meet requirements: ';

    if (errors.insufficientNumbers) {
      errorMessage += 'must include at least 3 numbers; ';
    }
    if (errors.tooShort) {
      errorMessage += 'must be at least 4 characters; ';
    }

    throw new ApiError(400, errorMessage.trim());
  }

  // Verify OTP
  const isOTPValid = await AuthService.verifyOTP(email, otp, 'reset');
  if (!isOTPValid) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  // Update password
  user.password = newPassword; // Will be hashed by pre-save hook
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. You can now login with your new password.',
  });
});
