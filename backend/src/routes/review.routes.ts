import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Public route - no auth required
router.get('/public', ReviewController.getPublicReviews);

// Author routes - require auth + author role
router.get('/my', verifyToken, checkRole('author'), ReviewController.getMyReview);
router.post('/', verifyToken, checkRole('author'), ReviewController.submitReview);
router.put('/:id', verifyToken, checkRole('author'), ReviewController.updateReview);

// Admin routes - require auth + admin role
router.get('/admin', verifyToken, checkRole('super_admin', 'sub_admin'), ReviewController.adminGetAllReviews);
router.put('/admin/:id', verifyToken, checkRole('super_admin', 'sub_admin'), ReviewController.adminEditReview);
router.delete('/admin/:id', verifyToken, checkRole('super_admin', 'sub_admin'), ReviewController.adminDeleteReview);

export default router;
