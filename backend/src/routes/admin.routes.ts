import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { BookController } from '../controllers/book.controller';
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
router.post('/books', AdminController.createBookForAuthor);
router.get('/books', AdminController.getAllBooks);
router.get('/books/:bookId', BookController.getBookById);
router.put('/books/:bookId/status', AdminController.updateBookStatus);
router.put('/books/:bookId/approve', AdminController.approveBook);
router.put('/books/:bookId/decline', AdminController.declineBook);
router.put('/books/:bookId/stage', AdminController.updateBookStage);
router.put('/books/:bookId/product-links', AdminController.updateProductLinks);
router.post('/books/:bookId/payment-request', AdminController.createPaymentRequest);
router.put('/books/:bookId/extend-due-date', AdminController.extendDueDate);

// Support tickets
router.get('/tickets', AdminController.getAllTickets);

// Platform statistics
router.get('/stats', AdminController.getPlatformStats);

// Pricing configuration
router.put('/pricing', AdminController.updatePricingConfig);

// Audit logs
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
