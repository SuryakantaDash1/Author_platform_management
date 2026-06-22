import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { BookController } from '../controllers/book.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole, checkPermission } from '../middlewares/role.middleware';

const router = Router();

// All admin routes require auth + admin role
router.use(verifyToken);
router.use(checkRole('super_admin', 'sub_admin'));

// ── Sub-admin management (super_admin only) ──
router.get('/sub-admins', checkRole('super_admin'), AdminController.getAllSubAdmins);
router.post('/sub-admins', checkRole('super_admin'), AdminController.createSubAdmin);
router.put('/sub-admins/:id', checkRole('super_admin'), AdminController.updateSubAdmin);
router.delete('/sub-admins/:id', checkRole('super_admin'), AdminController.deleteSubAdmin);

// ── Author management ──
router.post('/authors', checkPermission('authors'), AdminController.createAuthor);
router.get('/authors', checkPermission('authors'), AdminController.getAllAuthors);
router.get('/authors/:authorId', checkPermission('authors'), AdminController.getAuthorDetails);
router.get('/authors/:authorId/bank-accounts', checkPermission('authors'), AdminController.getAuthorBankAccounts);
router.put('/authors/:authorId/tier', checkPermission('authors'), AdminController.updateAuthorTier);
router.put('/authors/:authorId/restrict', checkPermission('authors'), AdminController.restrictAuthor);

// ── Book management ──
router.post('/books', checkPermission('books'), AdminController.createBookForAuthor);
router.get('/books', checkPermission('books'), AdminController.getAllBooks);
router.get('/books/:bookId', checkPermission('books'), BookController.getBookById);
router.put('/books/:bookId/status', checkPermission('books'), AdminController.updateBookStatus);
router.put('/books/:bookId/approve', checkPermission('books'), AdminController.approveBook);
router.put('/books/:bookId/decline', checkPermission('books'), AdminController.declineBook);
router.put('/books/:bookId/stage', checkPermission('books'), AdminController.updateBookStage);
router.put('/books/:bookId/product-links', checkPermission('books'), AdminController.updateProductLinks);
router.post('/books/:bookId/payment-request', checkPermission('payments'), AdminController.createPaymentRequest);
router.put('/books/:bookId/extend-due-date', checkPermission('payments'), AdminController.extendDueDate);

// ── Support tickets ──
router.get('/tickets', checkPermission('support'), AdminController.getAllTickets);

// ── Platform statistics — accessible to all admins (dashboard) ──
router.get('/stats', AdminController.getPlatformStats);

// ── Pricing configuration ──
router.put('/pricing', checkPermission('payments'), AdminController.updatePricingConfig);

// ── Audit logs ──
router.get('/audit-logs', checkPermission('analytics'), AdminController.getAuditLogs);

export default router;
