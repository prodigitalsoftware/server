import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, customerDetails, currency = 'USD', paymentMethod = 'KHQR' } = req.body;

    if (!items || !items.length) {
      res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
      return;
    }

    if (!customerDetails || !customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      res.status(400).json({ success: false, message: 'Customer name, email, and phone are required' });
      return;
    }

    // Verify products and calculate price securely from database
    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
        return;
      }

      if (product.status !== 'published') {
        res.status(400).json({ success: false, message: `Product ${product.name} is no longer available` });
        return;
      }

      const unitPrice = product.discountPrice !== undefined && product.discountPrice !== null && product.discountPrice > 0
        ? product.discountPrice
        : product.price;

      const quantity = Math.max(1, parseInt(item.quantity || '1', 10));
      subtotal += unitPrice * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        nameKh: product.nameKh,
        price: unitPrice,
        quantity,
        image: product.images?.[0] || '',
        digitalDownloadUrl: product.digitalDownloadUrl,
        digitalAccessInfo: product.digitalAccessInfo,
        type: product.type,
      });
    }

    const discount = 0;
    const total = parseFloat((subtotal - discount).toFixed(2));

    const orderNumber = `NV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = new Order({
      orderNumber,
      user: req.user?._id || undefined,
      customerDetails,
      items: orderItems,
      subtotal,
      discount,
      total,
      currency,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch user orders', error: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).lean();
    } else {
      order = await Order.findOne({ orderNumber: id }).lean();
    }

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Mask sensitive digital product URLs if paymentStatus !== 'paid'
    if (order.paymentStatus !== 'paid') {
      order.items = order.items.map((item: any) => ({
        ...item,
        digitalDownloadUrl: undefined,
        digitalAccessInfo: undefined,
      }));
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve order', error: error.message });
  }
};

/**
 * Secure Digital Product Download route
 * Strictly requires verified paid order!
 */
export const downloadDigitalProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, productId } = req.params;
    const { token } = req.query;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Crucial security check: Must be paid!
    if (order.paymentStatus !== 'paid') {
      res.status(403).json({
        success: false,
        message: 'Access Denied: Product download is only available after payment has been verified.',
      });
      return;
    }

    // Optional token validation
    if (token && order.downloadToken && token !== order.downloadToken) {
      res.status(403).json({ success: false, message: 'Invalid download security token' });
      return;
    }

    const item = order.items.find((i) => i.product.toString() === productId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Product not found in this order' });
      return;
    }

    const product = await Product.findById(productId);
    const downloadUrl = product?.digitalDownloadUrl || item.digitalDownloadUrl;
    const accessInfo = product?.digitalAccessInfo || item.digitalAccessInfo;

    res.json({
      success: true,
      productName: item.name,
      downloadUrl: downloadUrl || 'https://drive.google.com/drive/folders/sample-digital-delivery',
      accessInfo: accessInfo || 'Standard digital license key and setup credentials unlocked.',
      orderNumber: order.orderNumber,
      deliveredAt: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to process download', error: error.message });
  }
};

export const getAdminOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentStatus, orderStatus, search, page = '1', limit = '15' } = req.query;

    const query: any = {};
    if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;
    if (orderStatus && orderStatus !== 'all') query.orderStatus = orderStatus;

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customerDetails.name': searchRegex },
        { 'customerDetails.email': searchRegex },
        { 'customerDetails.phone': searchRegex },
        { transactionRef: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve orders', error: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const update: any = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) {
      update.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid') {
        update.paidAt = new Date();
        update.downloadToken = `dl_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      }
    }

    const order = await Order.findByIdAndUpdate(id, update, { new: true });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update order', error: error.message });
  }
};

export const refundOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    order.paymentStatus = 'refunded';
    order.orderStatus = 'cancelled';
    await order.save();

    res.json({ success: true, message: 'Order refunded successfully', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to refund order', error: error.message });
  }
};

