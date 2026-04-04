import { Router } from 'express';
import { PaymentConfigController } from '../controllers/payment-config.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Public route — no auth needed (for author book form to get pricing)
router.get('/public', PaymentConfigController.getPublicConfig);

// Admin routes — require auth + admin role
router.use(verifyToken);
router.use(checkRole('super_admin', 'sub_admin'));

router.get('/', PaymentConfigController.getAllConfigs);
router.post('/', PaymentConfigController.createConfig);

// Book types management
router.get('/book-types', PaymentConfigController.getBookTypes);
router.put('/book-types', PaymentConfigController.updateBookTypes);

router.get('/:id', PaymentConfigController.getConfigById);
router.put('/:id', PaymentConfigController.updateConfig);
router.delete('/:id', PaymentConfigController.deleteConfig);

export default router;
