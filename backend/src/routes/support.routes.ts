import { Router } from 'express';
import { SupportController } from '../controllers/support.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';

const router = Router();

// All support routes require authentication
router.use(verifyToken);

// Author routes
router.post('/tickets', checkRole('author'), SupportController.createTicket);
router.get('/tickets', checkRole('author'), SupportController.getMyTickets);
router.get('/tickets/:ticketId', SupportController.getTicketById);
router.post('/tickets/:ticketId/messages', uploadSingle('attachment'), SupportController.addMessage);
router.put('/tickets/:ticketId/status', SupportController.updateTicketStatus);

// Admin-only routes
router.get('/admin/tickets', checkRole('super_admin', 'sub_admin'), SupportController.searchTickets);
router.get('/admin/tickets/search', checkRole('super_admin', 'sub_admin'), SupportController.searchTickets);
router.get('/admin/tickets/stats', checkRole('super_admin', 'sub_admin'), SupportController.getTicketStats);
router.put('/admin/tickets/:ticketId/assign', checkRole('super_admin', 'sub_admin'), SupportController.assignTicket);
router.put('/admin/tickets/:ticketId/status', checkRole('super_admin', 'sub_admin'), SupportController.updateTicketStatus);

export default router;
