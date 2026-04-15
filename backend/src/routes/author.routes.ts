import { Router } from 'express';
import { AuthorController } from '../controllers/author.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { authorValidation } from '../validators/author.validator';

const router = Router();

// All author routes require authentication and author role
router.use(verifyToken);
router.use(checkRole('author'));

// Profile management
router.get('/profile', AuthorController.getProfile);
router.put('/profile', validate(authorValidation.updateProfile), AuthorController.updateProfile);
router.post('/profile/picture', uploadSingle('profilePicture'), AuthorController.uploadProfilePicture);

// Dashboard
router.get('/dashboard', AuthorController.getDashboard);

// Books
router.get('/books', AuthorController.getMyBooks);

// Transactions
router.get('/transactions', AuthorController.getTransactions);

// Bank accounts
router.post('/bank-accounts', validate(authorValidation.addBankAccount), AuthorController.addBankAccount);
router.get('/bank-accounts', AuthorController.getBankAccounts);
router.put('/bank-accounts/:accountId', AuthorController.editBankAccount);
router.delete('/bank-accounts/:accountId', AuthorController.deleteBankAccount);

// Referrals
router.get('/referrals', AuthorController.getReferrals);
router.post('/referral/apply', AuthorController.applyReferralBalance);

// Analytics
router.get('/analytics/sales', AuthorController.getSalesAnalytics);

export default router;
