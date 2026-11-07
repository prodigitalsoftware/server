import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  provider: 'BAKONG_KHQR' | 'SIMULATION';
  transactionId: string;
  md5?: string;
  amount: number;
  currency: 'USD' | 'KHR';
  qrCode: string; // base64 data URL
  qrString: string; // EMVCo KHQR raw string
  paymentStatus: 'pending' | 'successful' | 'failed' | 'expired';
  providerResponse?: any;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    provider: { type: String, enum: ['BAKONG_KHQR', 'SIMULATION'], default: 'BAKONG_KHQR' },
    transactionId: { type: String, required: true, unique: true },
    md5: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['USD', 'KHR'], default: 'USD' },
    qrCode: { type: String, required: true },
    qrString: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'expired'],
      default: 'pending',
    },
    providerResponse: { type: Schema.Types.Mixed },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

