import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthor extends Document {
  userId: string;
  authorId: string;
  profilePicture?: string;
  qualification?: string;
  university?: string;
  address?: {
    pinCode: string;
    city: string;
    district: string;
    state: string;
    country: string;
    housePlot?: string;
    landmark?: string;
  };
  referralCode: string;
  referredBy?: string;
  totalBooks: number;
  totalEarnings: number;
  totalSoldUnits: number;
  isRestricted: boolean;
  restrictionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      ref: 'User',
      index: true,
    },
    authorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    profilePicture: {
      type: String,
    },
    qualification: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
    },
    address: {
      pinCode: String,
      city: String,
      district: String,
      state: String,
      country: String,
      housePlot: String,
      landmark: String,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    referredBy: {
      type: String,
      ref: 'Author',
      index: true,
    },
    totalBooks: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalSoldUnits: {
      type: Number,
      default: 0,
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    restrictionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
AuthorSchema.index({ 'address.state': 1, 'address.district': 1 });

export default mongoose.model<IAuthor>('Author', AuthorSchema);
