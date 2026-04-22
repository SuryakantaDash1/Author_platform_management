import { Router } from 'express';
import {
  getPublicAuthors,
  getPublicAuthorDetail,
  getPublicBooks,
  getPublicBookDetail,
} from '../controllers/public.controller';

const router = Router();

// All public — no auth required
router.get('/authors', getPublicAuthors);
router.get('/authors/:authorId', getPublicAuthorDetail);
router.get('/books', getPublicBooks);
router.get('/books/:bookId', getPublicBookDetail);

export default router;
