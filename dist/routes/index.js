"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const productRoutes_1 = __importDefault(require("./productRoutes"));
const categoryRoutes_1 = __importDefault(require("./categoryRoutes"));
const orderRoutes_1 = __importDefault(require("./orderRoutes"));
const paymentRoutes_1 = __importDefault(require("./paymentRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/products', productRoutes_1.default);
router.use('/categories', categoryRoutes_1.default);
router.use('/orders', orderRoutes_1.default);
router.use('/payments', paymentRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
// Public settings route for frontend store info & announcement
router.get('/settings', adminController_1.getStoreSettings);
exports.default = router;
