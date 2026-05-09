import { Router } from 'express';
import {
  submitSellingData,
  getAllSellingRecords,
  getSellingHistory,
  releaseRoyaltyPayment,
  getAdminRoyaltyListing,
  getAuthorRoyaltyDetail,
  getMyRoyalties,
  getMyRoyaltyMonthDetail,
  getBookRoyaltyRecords,
  previewFinancials,
} from '../controllers/selling.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';

const router = Router();

// ── Author routes ── (auth applied per-route, not globally)
router.get('/author/royalties', verifyToken, checkRole('author'), getMyRoyalties);
router.get('/author/royalties/:year/:month', verifyToken, checkRole('author'), getMyRoyaltyMonthDetail);

// ── Admin routes ──
const adminAuth = [verifyToken, checkRole('super_admin', 'sub_admin')];

router.post('/admin/selling', ...adminAuth, submitSellingData);
router.get('/admin/selling', ...adminAuth, getAllSellingRecords);
router.post('/admin/selling/preview', ...adminAuth, previewFinancials);
router.get('/admin/selling/:bookId', ...adminAuth, getSellingHistory);

router.get('/admin/royalties', ...adminAuth, getAdminRoyaltyListing);
router.get('/admin/royalties/author/:authorId', ...adminAuth, getAuthorRoyaltyDetail);
router.get('/admin/royalties/book/:bookId', ...adminAuth, getBookRoyaltyRecords);
router.post('/admin/royalties/release', ...adminAuth, uploadSingle('paymentProof'), releaseRoyaltyPayment);

export default router;
