import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { authValidation } from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/send-otp', validate(authValidation.sendOTP), AuthController.sendOTP);
router.post('/verify-otp-signup', validate(authValidation.verifyOTPSignup), AuthController.verifyOTPSignup);
router.post('/verify-otp-login', validate(authValidation.verifyOTPLogin), AuthController.verifyOTPLogin);
router.post('/refresh-token', validate(authValidation.refreshToken), AuthController.refreshToken);

// OAuth routes
router.get('/google', (_req, res) => {
  // Redirect to Google OAuth consent page
  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=profile email`
  );
});

router.get('/google/callback', AuthController.googleOAuthCallback);

router.get('/microsoft', (_req, res) => {
  // Redirect to Microsoft OAuth consent page
  res.redirect(
    `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.MICROSOFT_CLIENT_ID}&redirect_uri=${process.env.MICROSOFT_CALLBACK_URL}&response_type=code&scope=openid profile email`
  );
});

router.get('/microsoft/callback', AuthController.microsoftOAuthCallback);

// Protected routes (require authentication)
router.use(verifyToken);

router.get('/me', AuthController.getCurrentUser);
router.put('/profile', validate(authValidation.updateProfile), AuthController.updateProfile);
router.post('/change-email', validate(authValidation.changeEmail), AuthController.changeEmail);
router.post('/logout', AuthController.logout);

// 2FA routes
router.post('/2fa/enable', AuthController.enable2FA);
router.post('/2fa/verify', validate(authValidation.verify2FA), AuthController.verify2FA);
router.post('/2fa/disable', validate(authValidation.verify2FA), AuthController.disable2FA);

export default router;
