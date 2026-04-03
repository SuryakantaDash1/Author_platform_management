import { Router } from 'express';
import {
  adminLogin,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/admin-auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  adminLoginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/admin-auth.validator';

const router = Router();

/**
 * @route   POST /api/admin/auth/login
 * @desc    Admin (Super Admin / Sub Admin) Login
 * @access  Public
 */
router.post('/login', validate(adminLoginSchema), adminLogin);

/**
 * @route   POST /api/admin/auth/change-password
 * @desc    Change Admin Password (when logged in)
 * @access  Private (Admin only)
 */
router.post('/change-password', verifyToken, validate(changePasswordSchema), changePassword);

/**
 * @route   POST /api/admin/auth/forgot-password
 * @desc    Request password reset link via email
 * @access  Public
 */
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

/**
 * @route   POST /api/admin/auth/reset-password
 * @desc    Reset password using token from email
 * @access  Public
 */
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;
