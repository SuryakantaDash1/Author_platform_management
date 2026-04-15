import mongoose, { Schema, Document } from 'mongoose';
import { TransactionStatus, PaymentMethod } from '../types';

export interface ITransaction extends Document {
  transactionId: string;
  authorId: string;
  bookId?: string;
  type: 'book_payment' | 'royalty_payment' | 'referral_earning' | 'adjustment' | 'refund';
  amount: number;
  description: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  bankAccountId?: string;
  paymentProof?: string;
  paymentDate?: Date;
  metadata?: any;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    transactionId: {
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
    bookId: {
      type: String,
      ref: 'Book',
    },
    type: {
      type: String,
      enum: ['book_payment', 'royalty_payment', 'referral_earning', 'adjustment', 'refund'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'other'],
    },
    bankAccountId: {
      type: String,
      ref: 'BankAccount',
    },
    paymentProof: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    createdBy: {
      type: String,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TransactionSchema.index({ authorId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
