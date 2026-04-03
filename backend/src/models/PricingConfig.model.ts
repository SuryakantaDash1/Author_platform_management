import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingConfig extends Document {
  language: string;
  publishingPrice: {
    main: number;
    discount: number;
  };
  coverDesignPrice: {
    main: number;
    discount: number;
  };
  distributionPrice: {
    main: number;
    discount: number;
  };
  copyrightPrice: {
    main: number;
    discount: number;
  };
  formattingPrice: {
    main: number;
    discount: number;
  };
  perBookCopyPrice: {
    main: number;
    discount: number;
  };
  installmentOptions: number[];
  benefits: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PricingConfigSchema: Schema = new Schema(
  {
    language: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    publishingPrice: {
      main: { type: Number, required: true },
      discount: { type: Number, default: 0 },
    },
    coverDesignPrice: {
      main: { type: Number, required: true },
      discount: { type: Number, default: 0 },
    },
    distributionPrice: {
      main: { type: Number, required: true },
      discount: { type: Number, default: 0 },
    },
    copyrightPrice: {
      main: { type: Number, required: true },
      discount: { type: Number, default: 0 },
    },
    formattingPrice: {
      main: { type: Number, required: true },
      discount: { type: Number, default: 0 },
    },
    perBookCopyPrice: {
      main: { type: Number, required: true },
      discount: { type: Number, default: 0 },
    },
    installmentOptions: [{
      type: Number,
      min: 1,
      max: 4,
    }],
    benefits: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
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

export default mongoose.model<IPricingConfig>('PricingConfig', PricingConfigSchema);
