import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(checkRole('super_admin', 'sub_admin'));

// Author management
router.post('/authors', AdminController.createAuthor);
router.get('/authors', AdminController.getAllAuthors);
router.get('/authors/:authorId', AdminController.getAuthorDetails);
router.put('/authors/:authorId/tier', AdminController.updateAuthorTier);
router.put('/authors/:authorId/restrict', AdminController.restrictAuthor);

// Book management
router.get('/books', AdminController.getAllBooks);
router.put('/books/:bookId/status', AdminController.updateBookStatus);

// Support tickets
router.get('/tickets', AdminController.getAllTickets);

// Platform statistics
router.get('/stats', AdminController.getPlatformStats);

// Pricing configuration
router.put('/pricing', AdminController.updatePricingConfig);

// Audit logs
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
