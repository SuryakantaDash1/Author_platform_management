import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Razorpay webhook - no auth, Razorpay calls this directly
router.post('/webhook', PaymentController.webhook);

// Author-protected routes
router.use(verifyToken);
router.use(checkRole('author'));

router.post('/create-order', PaymentController.createOrder);
router.post('/verify', PaymentController.verifyPayment);
router.get('/pending-requests', PaymentController.getPendingPaymentRequests);

export default router;
