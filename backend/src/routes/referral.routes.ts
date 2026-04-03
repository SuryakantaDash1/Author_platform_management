import { Router } from 'express';
import { ReferralController } from '../controllers/referral.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Public route for validating referral codes during signup
router.get('/validate/:referralCode', ReferralController.validateReferralCode);

// Protected routes
router.use(verifyToken);

// Author routes
router.get('/my-referrals', checkRole('author'), ReferralController.getReferralDetails);

// Admin-only routes
router.use(checkRole('super_admin', 'sub_admin'));

router.get('/', ReferralController.getAllReferrals);
router.get('/stats', ReferralController.getReferralStats);
router.post('/:referralId/process', ReferralController.processReferralCommission);
router.put('/:referralId/commission', ReferralController.updateCommission);

export default router;
