import mongoose, { Document, Schema } from 'mongoose';

export type ProductType = 'course' | 'software' | 'account' | 'prompt' | 'ebook' | 'service';

export interface IProduct extends Document {
  name: string;
  nameKh?: string;
  slug: string;
  description: string;
  descriptionKh?: string;
  price: number;
  discountPrice?: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  type: ProductType;
  digitalDownloadUrl?: string;
  digitalAccessInfo?: string;
  stock: number;
  featured: boolean;
  status: 'published' | 'draft';
  rating: number;
  numReviews: number;
  specifications: Array<{ key: string; value: string }>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    nameKh: { type: String, default: '', trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    descriptionKh: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    type: {
      type: String,
      enum: ['course', 'software', 'account', 'prompt', 'ebook', 'service'],
      default: 'software',
    },
    digitalDownloadUrl: { type: String, default: '' },
    digitalAccessInfo: { type: String, default: '' },
    stock: { type: Number, default: 999 },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    numReviews: { type: Number, default: 0 },
    specifications: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

