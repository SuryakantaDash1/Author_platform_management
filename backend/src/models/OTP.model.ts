import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  type: 'signup' | 'login' | 'reset';
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const OTPSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['signup', 'login', 'reset'],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - auto-delete after expiry
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for email + type
OTPSchema.index({ email: 1, type: 1 });

export default mongoose.model<IOTP>('OTP', OTPSchema);
