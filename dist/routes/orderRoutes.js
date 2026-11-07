"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Customer routes
router.post('/', auth_1.optionalAuth, orderController_1.createOrder);
router.get('/my-orders', auth_1.authenticate, orderController_1.getMyOrders);
router.get('/:id', auth_1.optionalAuth, orderController_1.getOrderById);
router.get('/:id/download/:productId', orderController_1.downloadDigitalProduct);
// Admin order routes (also aliased under /api/admin/orders)
router.get('/admin/orders', auth_1.authenticate, auth_1.authorizeAdmin, orderController_1.getAdminOrders);
router.put('/admin/orders/:id/status', auth_1.authenticate, auth_1.authorizeAdmin, orderController_1.updateOrderStatus);
router.post('/admin/orders/:id/refund', auth_1.authenticate, auth_1.authorizeAdmin, orderController_1.refundOrder);
exports.default = router;
