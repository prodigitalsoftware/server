import { Router } from 'express';
import {
  createKHQRPayment,
  checkPaymentStatus,
  simulatePayment,
  getPaymentById,
  getAdminPayments,
} from '../controllers/paymentController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.post('/khqr/create', createKHQRPayment);
router.post('/khqr/check', checkPaymentStatus);
router.post('/khqr/simulate', simulatePayment);
router.get('/:id', getPaymentById);
router.get('/admin/payments', authenticate, authorizeAdmin, getAdminPayments);

export default router;

