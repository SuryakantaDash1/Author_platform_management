import { Router } from 'express';
import {
  sendSignupOTP,
  checkOTP,
  verifyOTPAndRegister,
  authorLogin,
  sendLoginOTP,
  verifyLoginOTP,
} from '../controllers/author-auth.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  sendSignupOTPSchema,
  verifyOTPAndRegisterSchema,
  authorLoginSchema,
  sendLoginOTPSchema,
  verifyLoginOTPSchema,
} from '../validators/author-auth.validator';

const router = Router();

/**
 * @route   POST /api/author/auth/send-signup-otp
 * @desc    Send OTP to email for author signup
 * @access  Public
 */
router.post('/send-signup-otp', validate(sendSignupOTPSchema), sendSignupOTP);

/**
 * @route   POST /api/author/auth/check-otp
 * @desc    Check OTP validity without consuming it
 * @access  Public
 */
router.post('/check-otp', checkOTP);

/**
 * @route   POST /api/author/auth/verify-otp-signup
 * @desc    Verify OTP and complete author registration with password
 * @access  Public
 */
router.post('/verify-otp-signup', validate(verifyOTPAndRegisterSchema), verifyOTPAndRegister);

/**
 * @route   POST /api/author/auth/login
 * @desc    Author login with email and password
 * @access  Public
 */
router.post('/login', validate(authorLoginSchema), authorLogin);

/**
 * @route   POST /api/author/auth/send-login-otp
 * @desc    Send OTP to email for forgot password (author)
 * @access  Public
 */
router.post('/send-login-otp', validate(sendLoginOTPSchema), sendLoginOTP);

/**
 * @route   POST /api/author/auth/verify-login-otp
 * @desc    Verify OTP and reset author password
 * @access  Public
 */
router.post('/verify-login-otp', validate(verifyLoginOTPSchema), verifyLoginOTP);

export default router;
