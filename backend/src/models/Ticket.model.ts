import mongoose, { Schema, Document } from 'mongoose';
import { TicketStatus } from '../types';

export interface ITicket extends Document {
  ticketId: string;
  authorId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  discussionDay?: string;
  discussionTimeSlot1?: string;
  discussionTimeSlot2?: string;
  attachments: string[];
  assignedTo?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
  {
    ticketId: {
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    discussionDay: {
      type: String,
      trim: true,
    },
    discussionTimeSlot1: {
      type: String,
      trim: true,
    },
    discussionTimeSlot2: {
      type: String,
      trim: true,
    },
    attachments: [{
      type: String,
    }],
    assignedTo: {
      type: String,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TicketSchema.index({ status: 1, createdAt: -1 });
TicketSchema.index({ authorId: 1, status: 1 });
TicketSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<ITicket>('Ticket', TicketSchema);
