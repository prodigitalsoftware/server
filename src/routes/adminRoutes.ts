import { Router } from 'express';
import {
  getDashboardStats,
  getAdminUsers,
  updateUserStatus,
  getStoreSettings,
  updateStoreSettings,
  uploadImage,
} from '../controllers/adminController';
import {
  getAdminOrders,
  updateOrderStatus,
  refundOrder,
} from '../controllers/orderController';
import { getAdminPayments } from '../controllers/paymentController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Protect all admin routes
router.use(authenticate, authorizeAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/refund', refundOrder);
router.get('/payments', getAdminPayments);
router.get('/settings', getStoreSettings);
router.put('/settings', updateStoreSettings);
router.post('/upload', upload.single('image'), uploadImage);

export default router;

