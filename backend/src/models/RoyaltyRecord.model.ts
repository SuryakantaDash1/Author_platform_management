import mongoose, { Schema, Document } from 'mongoose';

export interface IRoyaltyRecord extends Document {
  royaltyRecordId: string;
  authorId: string;
  bookId: string;
  sellingRecordId: string;  // links to the SellingRecord that generated this royalty
  month: number;  // 1–12
  year: number;
  // Amounts from SellingRecord calculation
  authorRoyalty: number;      // before deductions
  referralDeduction: number;
  outstandingDeduction: number;
  finalRoyalty: number;       // what admin actually pays
  // Payment details
  status: 'pending' | 'paid';
  bankAccountId?: string;
  paymentProof?: string;      // file path / URL
  paymentMode?: string;       // NEFT, UPI, etc.
  transactionReference?: string;
  paymentDate?: Date;
  paidBy?: string;            // admin userId
  // Transaction link
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoyaltyRecordSchema: Schema = new Schema(
  {
    royaltyRecordId: {
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
      required: true,
      ref: 'Book',
    },
    sellingRecordId: {
      type: String,
      required: true,
      ref: 'SellingRecord',
    },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    // Financials
    authorRoyalty: { type: Number, default: 0 },
    referralDeduction: { type: Number, default: 0 },
    outstandingDeduction: { type: Number, default: 0 },
    finalRoyalty: { type: Number, default: 0 },
    // Payment
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    bankAccountId: { type: String },
    paymentProof: { type: String },
    paymentMode: { type: String },
    transactionReference: { type: String },
    paymentDate: { type: Date },
    paidBy: { type: String },
    transactionId: { type: String },
  },
  {
    timestamps: true,
  }
);

RoyaltyRecordSchema.index({ authorId: 1, year: -1, month: -1 });
RoyaltyRecordSchema.index({ bookId: 1, year: -1 });
RoyaltyRecordSchema.index({ status: 1 });

export default mongoose.model<IRoyaltyRecord>('RoyaltyRecord', RoyaltyRecordSchema);
