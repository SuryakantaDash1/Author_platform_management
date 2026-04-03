import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  referrerId: string;
  referredAuthorId: string;
  referralCode: string;
  earningPercentage: number;
  totalEarnings: number;
  availableBalance: number;
  utilizedBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema: Schema = new Schema(
  {
    referrerId: {
      type: String,
      required: true,
      ref: 'Author',
      index: true,
    },
    referredAuthorId: {
      type: String,
      required: true,
      ref: 'Author',
      unique: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    earningPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    availableBalance: {
      type: Number,
      default: 0,
    },
    utilizedBalance: {
      type: Number,
      default: 0,
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

// Indexes
ReferralSchema.index({ referrerId: 1, isActive: 1 });

export default mongoose.model<IReferral>('Referral', ReferralSchema);
