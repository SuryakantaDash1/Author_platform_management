import { Router } from 'express';
import { UtilityController } from '../controllers/utility.controller';

const router = Router();

// GET /api/utility/pincode/:pin - PIN code lookup
router.get('/pincode/:pin', UtilityController.pincodeLookup);

export default router;
