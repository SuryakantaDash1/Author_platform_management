import { Router } from 'express';
import {
  getPublicAuthors,
  getPublicAuthorDetail,
  getPublicBooks,
  getPublicBookDetail,
} from '../controllers/public.controller';
import { CalculatorController } from '../controllers/calculator.controller';

const router = Router();

// All public — no auth required
router.get('/authors', getPublicAuthors);
router.get('/authors/:authorId', getPublicAuthorDetail);
router.get('/books', getPublicBooks);
router.get('/books/:bookId', getPublicBookDetail);
router.get('/calculator-config', CalculatorController.getPublicConfig);

export default router;
