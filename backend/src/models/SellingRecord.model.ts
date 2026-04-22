import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSale {
  platform: string;
  sellingUnits: number;
  sellingPricePerUnit: number;
  totalRevenue: number; // sellingUnits * sellingPricePerUnit — computed by backend
}

export interface ISellingRecord extends Document {
  sellingRecordId: string;
  bookId: string;
  authorId: string;
  month: number;  // 1–12
  year: number;
  platformSales: IPlatformSale[];
  // Expense inputs (admin-provided)
  costPerBook: number;
  adsCostPerUnit: number;
  platformFees: number;
  returnsExchangeAmount: number;
  outstandingAmount: number;
  // Calculated fields (backend-only)
  totalSellingUnits: number;
  totalRevenue: number;
  productionCost: number;
  grossMargin: number;
  adsCost: number;
  netProfit: number;
  authorRoyalty: number;
  royaltyPercentage: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformSaleSchema = new Schema(
  {
    platform: { type: String, required: true },
    sellingUnits: { type: Number, required: true, min: 0, default: 0 },
    sellingPricePerUnit: { type: Number, required: true, min: 0, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { _id: false }
);

const SellingRecordSchema: Schema = new Schema(
  {
    sellingRecordId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bookId: {
      type: String,
      required: true,
      ref: 'Book',
      index: true,
    },
    authorId: {
      type: String,
      required: true,
      ref: 'Author',
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    platformSales: [PlatformSaleSchema],
    // Expense inputs
    costPerBook: { type: Number, default: 0 },
    adsCostPerUnit: { type: Number, default: 0 },
    platformFees: { type: Number, default: 0 },
    returnsExchangeAmount: { type: Number, default: 0 },
    outstandingAmount: { type: Number, default: 0 },
    // Calculated
    totalSellingUnits: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    productionCost: { type: Number, default: 0 },
    grossMargin: { type: Number, default: 0 },
    adsCost: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    authorRoyalty: { type: Number, default: 0 },
    royaltyPercentage: { type: Number, default: 70 },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

SellingRecordSchema.index({ bookId: 1, year: -1, month: -1 });
SellingRecordSchema.index({ authorId: 1, year: -1, month: -1 });

export default mongoose.model<ISellingRecord>('SellingRecord', SellingRecordSchema);
