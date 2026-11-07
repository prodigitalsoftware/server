"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminPayments = exports.getPaymentById = exports.simulatePayment = exports.checkPaymentStatus = exports.createKHQRPayment = void 0;
const bakongService_1 = require("../services/bakongService");
const Payment_1 = require("../models/Payment");
const Order_1 = require("../models/Order");
const createKHQRPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order_1.Order.findById(orderId);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        if (order.paymentStatus === 'paid') {
            res.status(400).json({ success: false, message: 'This order has already been paid.' });
            return;
        }
        const payment = await bakongService_1.BakongService.createKHQRPayment({
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            amount: order.total,
            currency: order.currency,
        });
        res.status(201).json({
            success: true,
            payment: {
                id: payment._id,
                orderId: payment.order,
                transactionId: payment.transactionId,
                amount: payment.amount,
                currency: payment.currency,
                qrCode: payment.qrCode,
                qrString: payment.qrString,
                paymentStatus: payment.paymentStatus,
                expiresAt: payment.expiresAt,
                provider: payment.provider,
                isSandbox: payment.provider === 'SIMULATION',
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to generate KHQR payment', error: error.message });
    }
};
exports.createKHQRPayment = createKHQRPayment;
const checkPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.body;
        if (!paymentId) {
            res.status(400).json({ success: false, message: 'Payment ID is required' });
            return;
        }
        const result = await bakongService_1.BakongService.checkPaymentStatus(paymentId);
        res.json({
            success: true,
            paid: result.paid,
            status: result.status,
            message: result.message,
            payment: {
                id: result.payment._id,
                transactionId: result.payment.transactionId,
                paymentStatus: result.payment.paymentStatus,
                expiresAt: result.payment.expiresAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to check payment status', error: error.message });
    }
};
exports.checkPaymentStatus = checkPaymentStatus;
/**
 * Sandbox simulation endpoint for testing
 */
const simulatePayment = async (req, res) => {
    try {
        const { paymentId } = req.body;
        if (!paymentId) {
            res.status(400).json({ success: false, message: 'Payment ID is required' });
            return;
        }
        const payment = await bakongService_1.BakongService.simulateSuccessfulPayment(paymentId);
        res.json({
            success: true,
            message: 'Simulation successful: payment marked as verified by mock banking app',
            payment,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to simulate payment', error: error.message });
    }
};
exports.simulatePayment = simulatePayment;
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment_1.Payment.findById(id).populate('order');
        if (!payment) {
            res.status(404).json({ success: false, message: 'Payment not found' });
            return;
        }
        res.json({ success: true, payment });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get payment', error: error.message });
    }
};
exports.getPaymentById = getPaymentById;
const getAdminPayments = async (req, res) => {
    try {
        const { status, page = '1', limit = '15' } = req.query;
        const query = {};
        if (status && status !== 'all') {
            query.paymentStatus = status;
        }
        const pageNum = Math.max(1, parseInt(String(page), 10));
        const limitNum = Math.max(1, parseInt(String(limit), 10));
        const skip = (pageNum - 1) * limitNum;
        const [payments, total] = await Promise.all([
            Payment_1.Payment.find(query).populate('order').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
            Payment_1.Payment.countDocuments(query),
        ]);
        res.json({
            success: true,
            payments,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch admin payments', error: error.message });
    }
};
exports.getAdminPayments = getAdminPayments;
