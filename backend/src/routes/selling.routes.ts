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

router.use(verifyToken);

// ── Author routes ──
router.get('/author/royalties', checkRole('author'), getMyRoyalties);
router.get('/author/royalties/:year/:month', checkRole('author'), getMyRoyaltyMonthDetail);

// ── Admin routes ──
router.use(checkRole('super_admin', 'sub_admin'));

// Selling data
router.post('/admin/selling', submitSellingData);
router.get('/admin/selling', getAllSellingRecords);
router.post('/admin/selling/preview', previewFinancials);
router.get('/admin/selling/:bookId', getSellingHistory);

// Royalty management
router.get('/admin/royalties', getAdminRoyaltyListing);
router.get('/admin/royalties/author/:authorId', getAuthorRoyaltyDetail);
router.get('/admin/royalties/book/:bookId', getBookRoyaltyRecords);
router.post('/admin/royalties/release', uploadSingle('paymentProof'), releaseRoyaltyPayment);

export default router;
