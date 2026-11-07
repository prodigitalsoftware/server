import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  nameKh?: string;
  price: number;
  quantity: number;
  image?: string;
  digitalDownloadUrl?: string;
  digitalAccessInfo?: string;
  type?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    telegram?: string;
    note?: string;
  };
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: 'USD' | 'KHR';
  paymentMethod: 'KHQR' | 'SIMULATION';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'completed' | 'cancelled';
  transactionRef?: string;
  downloadToken?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    nameKh: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String },
    digitalDownloadUrl: { type: String },
    digitalAccessInfo: { type: String },
    type: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      telegram: { type: String, default: '' },
      note: { type: String, default: '' },
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, enum: ['USD', 'KHR'], default: 'USD' },
    paymentMethod: { type: String, enum: ['KHQR', 'SIMULATION'], default: 'KHQR' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    transactionRef: { type: String },
    downloadToken: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

