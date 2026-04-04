import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { uploadSingle, uploadMultiple } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { bookValidation } from '../validators/book.validator';

const router = Router();

// All book routes require authentication
router.use(verifyToken);

// Public authenticated routes
router.get('/pricing-suggestions', BookController.getPricingSuggestions);

// Author-only routes
router.post('/', checkRole('author'), validate(bookValidation.createBook), BookController.createBook);
router.get('/:bookId', BookController.getBookById);
router.put('/:bookId', checkRole('author'), validate(bookValidation.updateBook), BookController.updateBook);
router.post('/:bookId/cover', checkRole('author', 'super_admin', 'sub_admin'), uploadSingle('coverPage'), BookController.uploadCoverPage);
router.post('/:bookId/files', checkRole('author', 'super_admin', 'sub_admin'), uploadMultiple('bookFiles', 5), BookController.uploadBookFiles);
router.delete('/:bookId/files', checkRole('author', 'super_admin', 'sub_admin'), BookController.deleteBookFile);
router.post('/:bookId/submit', checkRole('author'), BookController.submitForReview);
router.delete('/:bookId', checkRole('author'), BookController.deleteBook);

// Admin-only routes
router.put('/:bookId/sales', checkRole('super_admin', 'sub_admin'), BookController.updateSalesData);

export default router;
