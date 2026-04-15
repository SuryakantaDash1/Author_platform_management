import mongoose, { Schema, Document } from 'mongoose';
import { BookStatus, BookType, PaymentPlan } from '../types';

export interface IBook extends Document {
  bookId: string;
  authorId: string;
  bookName: string;
  subtitle?: string;
  language: string;
  bookType: BookType;
  targetAudience?: string;
  coverPage?: string;
  needFormatting: boolean;
  needCopyright: boolean;
  needDesigning: boolean;
  physicalCopies: number;
  royaltyPercentage: number;
  expectedLaunchDate: Date;
  actualLaunchDate?: Date;
  uploadedFiles: string[];
  marketplaces: string[];
  status: BookStatus;
  rejectionReason?: string;
  totalSellingUnits: number;
  totalRevenue: number;
  priceBreakdown: {
    publishing: { original: number; discounted: number };
    coverDesign: { original: number; discounted: number };
    formatting: { original: number; discounted: number };
    copyright: { original: number; discounted: number };
    distribution: { original: number; discounted: number };
    physicalCopies: { original: number; discounted: number; quantity: number };
    netAmount: number;
    totalDiscount: number;
    referralDiscount: number;
    finalAmount: number;
  };
  paymentPlan: PaymentPlan;
  paymentStatus: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    paymentCompletionPercentage: number;
    dueDate?: Date;
    installments: {
      amount: number;
      status: string;
      paidAt?: Date;
    }[];
  };
  platformWiseSales: Map<string, {
    sellingUnits: number;
    productLink?: string;
    rating?: number;
  }>;
  statusHistory: {
    status: string;
    changedBy: string;
    changedAt: Date;
    note?: string;
  }[];
  paymentRequests: {
    amount: number;
    serviceType: string;
    description: string;
    status: string;
    createdAt: Date;
  }[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const priceBreakdownItem = {
  original: { type: Number, default: 0 },
  discounted: { type: Number, default: 0 },
};

const BookSchema: Schema = new Schema(
  {
    bookId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
      ref: 'Author',
      index: true,
    },
    bookName: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      trim: true,
      default: 'English',
    },
    bookType: {
      type: String,
      required: true,
      trim: true,
    },
    targetAudience: {
      type: String,
      trim: true,
    },
    coverPage: {
      type: String,
    },
    needFormatting: {
      type: Boolean,
      default: false,
    },
    needCopyright: {
      type: Boolean,
      default: false,
    },
    needDesigning: {
      type: Boolean,
      default: false,
    },
    physicalCopies: {
      type: Number,
      default: 2,
      min: 2,
    },
    royaltyPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    expectedLaunchDate: {
      type: Date,
      required: true,
    },
    actualLaunchDate: {
      type: Date,
    },
    uploadedFiles: [{
      type: String,
    }],
    marketplaces: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ['draft', 'pending', 'payment_pending', 'in_progress', 'formatting', 'designing', 'printing', 'published', 'rejected'],
      default: 'draft',
    },
    rejectionReason: {
      type: String,
    },
    totalSellingUnits: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    priceBreakdown: {
      publishing: priceBreakdownItem,
      coverDesign: priceBreakdownItem,
      formatting: priceBreakdownItem,
      copyright: priceBreakdownItem,
      distribution: priceBreakdownItem,
      physicalCopies: {
        original: { type: Number, default: 0 },
        discounted: { type: Number, default: 0 },
        quantity: { type: Number, default: 2 },
      },
      netAmount: { type: Number, default: 0 },
      totalDiscount: { type: Number, default: 0 },
      referralDiscount: { type: Number, default: 0 },
      finalAmount: { type: Number, default: 0 },
    },
    paymentPlan: {
      type: String,
      enum: ['full', '2_installments', '3_installments', '4_installments', 'pay_later'],
      default: 'full',
    },
    paymentStatus: {
      totalAmount: { type: Number, default: 0 },
      paidAmount: { type: Number, default: 0 },
      pendingAmount: { type: Number, default: 0 },
      paymentCompletionPercentage: { type: Number, default: 0 },
      dueDate: { type: Date },
      installments: [{
        amount: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
        paidAt: { type: Date },
      }],
    },
    platformWiseSales: {
      type: Map,
      of: new Schema({
        sellingUnits: { type: Number, default: 0 },
        productLink: { type: String },
        rating: { type: Number, min: 0, max: 5 },
      }, { _id: false }),
      default: new Map(),
    },
    statusHistory: [{
      status: { type: String, required: true },
      changedBy: { type: String, required: true },
      changedAt: { type: Date, default: Date.now },
      note: { type: String },
    }],
    paymentRequests: [{
      amount: { type: Number, required: true },
      serviceType: { type: String, required: true },
      description: { type: String, required: true },
      status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
      createdAt: { type: Date, default: Date.now },
    }],
    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        // Convert platformWiseSales Map to plain object so it serializes correctly
        if (ret.platformWiseSales instanceof Map) {
          const obj: Record<string, unknown> = {};
          (ret.platformWiseSales as Map<string, unknown>).forEach((v, k) => { obj[k] = v; });
          ret.platformWiseSales = obj as any;
        }
        return ret;
      },
    },
  }
);

BookSchema.index({ bookName: 'text' });
BookSchema.index({ status: 1, createdAt: -1 });
BookSchema.index({ authorId: 1, status: 1 });

export default mongoose.model<IBook>('Book', BookSchema);
