import mongoose, { Schema, Document } from 'mongoose';
import { BookStatus, BookType } from '../types';

export interface IBook extends Document {
  bookId: string;
  authorId: string;
  bookName: string;
  subtitle?: string;
  bookType: BookType;
  targetAudience?: string;
  coverPage?: string;
  needFormatting: boolean;
  needCopyright: boolean;
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
  paymentStatus: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    paymentCompletionPercentage: number;
  };
  platformWiseSales: Map<string, {
    sellingUnits: number;
    productLink?: string;
    rating?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

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
    bookType: {
      type: String,
      enum: ['fiction', 'non-fiction', 'poetry', 'children', 'academic', 'other'],
      required: true,
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
      enum: ['draft', 'pending', 'published', 'rejected'],
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
    paymentStatus: {
      totalAmount: {
        type: Number,
        default: 0,
      },
      paidAmount: {
        type: Number,
        default: 0,
      },
      pendingAmount: {
        type: Number,
        default: 0,
      },
      paymentCompletionPercentage: {
        type: Number,
        default: 0,
      },
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
  },
  {
    timestamps: true,
  }
);

// Indexes for searching and filtering
BookSchema.index({ bookName: 'text' });
BookSchema.index({ status: 1, createdAt: -1 });
BookSchema.index({ authorId: 1, status: 1 });

export default mongoose.model<IBook>('Book', BookSchema);
