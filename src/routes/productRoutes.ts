import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
  getReviews,
} from '../controllers/productController';
import { authenticate, authorizeAdmin, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, authorizeAdmin, createProduct);
router.put('/:id', authenticate, authorizeAdmin, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

// Reviews
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', optionalAuth, createReview);

export default router;

