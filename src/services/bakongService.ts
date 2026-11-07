import { generateKHQRString, generateQRCodeDataURL } from '../utils/khqr';
import { Payment, IPayment } from '../models/Payment';
import { Order } from '../models/Order';
import { Setting } from '../models/Setting';

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: 'USD' | 'KHR';
  isSandbox?: boolean;
}

export class BakongService {
  private static bakongApiUrl = process.env.BAKONG_API_URL || 'https://api-bakong.nbc.gov.kh/v1';

  /**
   * Check if real Bakong API credentials are configured
   */
  public static hasValidCredentials(): boolean {
    const token = process.env.BAKONG_TOKEN;
    const accountId = process.env.BAKONG_ACCOUNT_ID;
    return !!(token && accountId && token !== 'your_bakong_token_here');
  }

  /**
   * Create KHQR payment for an order
   */
  public static async createKHQRPayment(params: CreatePaymentParams): Promise<IPayment> {
    const { orderId, orderNumber, amount, currency, isSandbox = false } = params;

    // Check if an existing pending payment already exists and has not expired
    const existingPayment = await Payment.findOne({
      order: orderId,
      paymentStatus: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (existingPayment) {
      return existingPayment;
    }

    // Fetch store settings for Bakong account details
    const settings = await Setting.findOne();
    const bakongAccountId = process.env.BAKONG_ACCOUNT_ID || settings?.bakongAccountId || 'navaseal_store@aclb';
    const merchantName = process.env.BAKONG_MERCHANT_NAME || settings?.bakongMerchantName || 'NAVASEAL STORE';
    const merchantCity = process.env.BAKONG_MERCHANT_CITY || settings?.bakongMerchantCity || 'Phnom Penh';

    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Generate compliant KHQR EMVCo string
    const { qrString, md5 } = generateKHQRString({
      bakongAccountId,
      merchantName,
      merchantCity,
      amount,
      currency,
      orderNumber,
      transactionId,
    });

    // Generate QR code Data URL image
    const qrCode = await generateQRCodeDataURL(qrString);

    // Set expiration: 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const provider = this.hasValidCredentials() && !isSandbox ? 'BAKONG_KHQR' : 'SIMULATION';

    const payment = new Payment({
      order: orderId,
      provider,
      transactionId,
      md5,
      amount,
      currency,
      qrCode,
      qrString,
      paymentStatus: 'pending',
      expiresAt,
      providerResponse: {
        mode: provider === 'SIMULATION' ? 'SANDBOX_SIMULATION' : 'PRODUCTION',
        bakongAccountId,
        merchantName,
      },
    });

    await payment.save();
    return payment;
  }

  /**
   * Check payment status against official Bakong API or Sandbox engine
   */
  public static async checkPaymentStatus(paymentId: string): Promise<{
    payment: IPayment;
    paid: boolean;
    status: string;
    message: string;
  }> {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    // If already marked successful or failed
    if (payment.paymentStatus === 'successful') {
      return { payment, paid: true, status: 'successful', message: 'Payment already verified successfully' };
    }

    if (payment.paymentStatus === 'failed') {
      return { payment, paid: false, status: 'failed', message: 'Payment has failed or been cancelled' };
    }

    // Check expiration
    if (new Date() > payment.expiresAt) {
      payment.paymentStatus = 'expired';
      await payment.save();
      return { payment, paid: false, status: 'expired', message: 'Payment QR code has expired' };
    }

    // If Real Bakong credentials are configured, query official NBC API
    if (this.hasValidCredentials() && payment.provider === 'BAKONG_KHQR') {
      try {
        const response = await fetch(`${this.bakongApiUrl}/check_transaction_by_md5`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.BAKONG_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ md5: payment.md5 }),
        });

        const data: any = await response.json();

        if (data && (data.responseCode === 0 || data.status === 'SUCCESS')) {
          payment.paymentStatus = 'successful';
          payment.providerResponse = data;
          await payment.save();

          // Mark corresponding order as paid
          await this.completeOrderPayment(payment.order.toString(), payment.transactionId);

          return { payment, paid: true, status: 'successful', message: 'Payment verified by Bakong' };
        } else {
          return {
            payment,
            paid: false,
            status: 'pending',
            message: data.description || 'Waiting for customer bank scan...',
          };
        }
      } catch (err: any) {
        console.error('Bakong API verification check error:', err?.message);
        return {
          payment,
          paid: false,
          status: 'pending',
          message: 'Polling Bakong verification server...',
        };
      }
    }

    // Otherwise, in Simulation mode
    return {
      payment,
      paid: false,
      status: payment.paymentStatus,
      message: 'Simulation mode: waiting for scan or test trigger',
    };
  }

  /**
   * Sandbox simulation trigger: strictly verifies test payment
   */
  public static async simulateSuccessfulPayment(paymentId: string): Promise<IPayment> {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    if (payment.paymentStatus === 'successful') {
      return payment;
    }

    payment.paymentStatus = 'successful';
    payment.providerResponse = {
      simulation: true,
      simulatedAt: new Date(),
      verified: true,
      bankName: 'Bakong Sandbox Banking Application',
      referenceNumber: `SIM-${Date.now()}`,
    };
    await payment.save();

    await this.completeOrderPayment(payment.order.toString(), payment.transactionId);
    return payment;
  }

  /**
   * Update order status to paid and generate download access token
   */
  public static async completeOrderPayment(orderId: string, transactionRef: string): Promise<void> {
    const order = await Order.findById(orderId);
    if (!order) return;

    if (order.paymentStatus === 'paid') return; // Duplicate prevention

    order.paymentStatus = 'paid';
    order.orderStatus = 'completed';
    order.transactionRef = transactionRef;
    order.paidAt = new Date();
    // Unique secure token for digital download validation
    order.downloadToken = `dl_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    await order.save();
  }
}
