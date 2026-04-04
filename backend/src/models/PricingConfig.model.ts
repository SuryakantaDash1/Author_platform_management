import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingConfig extends Document {
  language: string;
  languagePrice: { main: number; discount: number };
  publishingPrice: { main: number; discount: number };
  coverDesignPrice: { main: number; discount: number };
  distributionPrice: { main: number; discount: number };
  copyrightPrice: { main: number; discount: number };
  formattingPrice: { main: number; discount: number };
  perBookCopyPrice: { main: number; discount: number };
  installmentOptions: {
    label: string;
    splits: number[];
  }[];
  referralConfig: {
    firstBookBonus: number;
    perReferralBonus: number;
  };
  platforms: string[];
  benefits: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const priceField = {
  main: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
};

const PricingConfigSchema: Schema = new Schema(
  {
    language: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    languagePrice: priceField,
    publishingPrice: priceField,
    coverDesignPrice: priceField,
    distributionPrice: priceField,
    copyrightPrice: priceField,
    formattingPrice: priceField,
    perBookCopyPrice: priceField,
    installmentOptions: [{
      label: { type: String, required: true },
      splits: [{ type: Number, required: true }],
    }],
    referralConfig: {
      firstBookBonus: { type: Number, default: 0, min: 0 },
      perReferralBonus: { type: Number, default: 0, min: 0 },
    },
    platforms: [{
      type: String,
      trim: true,
    }],
    benefits: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPricingConfig>('PricingConfig', PricingConfigSchema);
