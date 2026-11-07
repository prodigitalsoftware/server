"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', productController_1.getProducts);
router.get('/:id', productController_1.getProductById);
router.post('/', auth_1.authenticate, auth_1.authorizeAdmin, productController_1.createProduct);
router.put('/:id', auth_1.authenticate, auth_1.authorizeAdmin, productController_1.updateProduct);
router.delete('/:id', auth_1.authenticate, auth_1.authorizeAdmin, productController_1.deleteProduct);
// Reviews
router.get('/:id/reviews', productController_1.getReviews);
router.post('/:id/reviews', auth_1.optionalAuth, productController_1.createReview);
exports.default = router;
