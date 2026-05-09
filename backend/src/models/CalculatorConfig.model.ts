import mongoose, { Schema, Document } from 'mongoose';

export interface IPaperConfig {
  paperName: string;
  paperSize: string;
  pricePerPage: number;
}

export interface ICalculatorConfig extends Document {
  paperConfigs: IPaperConfig[];
  mspPercent: number;
  mrpPercent: number;
  royaltyFromMrpPercent: number;
  offlineExpensesPercent: number;
  onlineExpensesPercent: number;
  ebookRoyaltyPercent: number;
  ebookOnlineExpensesPercent: number;
  magazineRoyaltyOverride: number | null;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaperConfigSchema = new Schema(
  {
    paperName: { type: String, required: true, trim: true },
    paperSize: { type: String, required: true, trim: true },
    pricePerPage: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CalculatorConfigSchema: Schema = new Schema(
  {
    paperConfigs: {
      type: [PaperConfigSchema],
      default: [],
    },
    mspPercent: { type: Number, required: true, min: 0, default: 50 },
    mrpPercent: { type: Number, required: true, min: 0, default: 40 },
    royaltyFromMrpPercent: { type: Number, required: true, min: 0, default: 30 },
    offlineExpensesPercent: { type: Number, required: true, min: 0, default: 15 },
    onlineExpensesPercent: { type: Number, required: true, min: 0, default: 10 },
    ebookRoyaltyPercent: { type: Number, required: true, min: 0, default: 35 },
    ebookOnlineExpensesPercent: { type: Number, required: true, min: 0, default: 10 },
    magazineRoyaltyOverride: { type: Number, default: null },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<ICalculatorConfig>('CalculatorConfig', CalculatorConfigSchema);
