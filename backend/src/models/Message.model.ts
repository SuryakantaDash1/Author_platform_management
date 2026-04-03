import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  ticketId: string;
  senderId: string;
  senderRole: 'author' | 'admin' | 'system';
  message: string;
  attachments: string[];
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    ticketId: {
      type: String,
      required: true,
      ref: 'Ticket',
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      ref: 'User',
    },
    senderRole: {
      type: String,
      enum: ['author', 'admin', 'system'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [{
      type: String,
    }],
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching messages by ticket
MessageSchema.index({ ticketId: 1, createdAt: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
