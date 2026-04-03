import mongoose, { Schema, Document } from 'mongoose';
import { AccountType } from '../types';

export interface IBankAccount extends Document {
  authorId: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  accountNumberEncrypted: string;
  ifscCode: string;
  branchName: string;
  accountType: AccountType;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema: Schema = new Schema(
  {
    authorId: {
      type: String,
      required: true,
      ref: 'Author',
      index: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    accountNumberEncrypted: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    branchName: {
      type: String,
      required: true,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ['primary', 'secondary'],
      default: 'secondary',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one primary account per author
BankAccountSchema.index({ authorId: 1, accountType: 1 });

export default mongoose.model<IBankAccount>('BankAccount', BankAccountSchema);
