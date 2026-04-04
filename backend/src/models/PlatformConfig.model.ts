import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformConfig extends Document {
  key: string;
  values: string[];
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformConfigSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    values: [{
      type: String,
      trim: true,
    }],
    updatedBy: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPlatformConfig>('PlatformConfig', PlatformConfigSchema);
