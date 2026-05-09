import { Router } from 'express';
import { CalculatorController } from '../controllers/calculator.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Public — no auth needed
router.get('/public', CalculatorController.getPublicConfig);

// Admin routes — super_admin only
router.use(verifyToken);
router.use(checkRole('super_admin', 'sub_admin'));

router.get('/', CalculatorController.getAdminConfig);
router.put('/', CalculatorController.saveConfig);

export default router;
