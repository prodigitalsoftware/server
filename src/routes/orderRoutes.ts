import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  downloadDigitalProduct,
  getAdminOrders,
  updateOrderStatus,
  refundOrder,
} from '../controllers/orderController';
import { authenticate, authorizeAdmin, optionalAuth } from '../middleware/auth';

const router = Router();

// Customer routes
router.post('/', optionalAuth, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);
router.get('/:id/download/:productId', downloadDigitalProduct);

// Admin order routes (also aliased under /api/admin/orders)
router.get('/admin/orders', authenticate, authorizeAdmin, getAdminOrders);
router.put('/admin/orders/:id/status', authenticate, authorizeAdmin, updateOrderStatus);
router.post('/admin/orders/:id/refund', authenticate, authorizeAdmin, refundOrder);

export default router;

