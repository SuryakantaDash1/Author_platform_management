import { Router } from 'express';
import { FinancialController } from '../controllers/financial.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// All financial routes require authentication
router.use(verifyToken);

// Author routes
router.post('/royalty/calculate', FinancialController.calculateRoyalty);
router.get('/transactions/:transactionId', FinancialController.getTransactionById);
router.get('/summary/:authorId', FinancialController.getAuthorFinancialSummary);

// Admin-only routes
router.use(checkRole('super_admin', 'sub_admin'));

router.post('/royalty/process', FinancialController.processRoyaltyPayment);
router.put('/transactions/:transactionId/status', FinancialController.updateTransactionStatus);
router.get('/transactions', FinancialController.getAllTransactions);
router.post('/subscription/process', FinancialController.processSubscriptionPayment);
router.get('/platform/analytics', FinancialController.getPlatformFinancials);

export default router;
