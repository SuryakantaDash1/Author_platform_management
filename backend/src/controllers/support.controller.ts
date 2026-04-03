import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import Ticket from '../models/Ticket.model';
import Message from '../models/Message.model';
import Author from '../models/Author.model';

export class SupportController {
  // Create a new support ticket
  static createTicket = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { title, category, priority, description, discussionDay, discussionTimeSlot1, discussionTimeSlot2 } = req.body;

      if (!title || !category || !description) {
        throw new ApiError(
          400,
          'Title, category, and description are required'
        );
      }

      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });

      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      // Generate unique ticket ID
      const ticketCount = await Ticket.countDocuments();
      const ticketId = `TKT${(ticketCount + 1).toString().padStart(6, '0')}`;

      const ticket = await Ticket.create({
        ticketId,
        authorId: author.authorId,
        title,
        category,
        priority: priority || 'medium',
        description,
        discussionDay,
        discussionTimeSlot1,
        discussionTimeSlot2,
        status: 'pending',
      });

      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully',
        data: { ticket },
      });
    }
  );

  // Get all tickets for author
  static getMyTickets = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        status,
        category,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });

      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      const filter: any = { authorId: author.authorId };

      if (status) {
        filter.status = status;
      }

      if (category) {
        filter.category = category;
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

      const [tickets, total] = await Promise.all([
        Ticket.find(filter).sort(sort).skip(skip).limit(Number(limit)),
        Ticket.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          tickets,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    }
  );

  // Get ticket by ID with messages
  static getTicketById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { ticketId } = req.params;

      const ticket = await Ticket.findOne({ ticketId });

      if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
      }

      // Check authorization
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      if (req.user?.role === 'author') {
        const author = await Author.findOne({ userId: userId });
        if (!author || ticket.authorId !== author.authorId) {
          throw new ApiError(403, 'Access denied');
        }
      }

      const messages = await Message.find({ ticketId }).sort({ createdAt: 1 });

      res.status(200).json({
        success: true,
        data: {
          ticket,
          messages,
        },
      });
    }
  );

  // Add message to ticket
  static addMessage = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { ticketId } = req.params;
      const { message } = req.body;

      if (!message) {
        throw new ApiError(400, 'Message is required');
      }

      const ticket = await Ticket.findOne({ ticketId });

      if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
      }

      // Check authorization
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      let senderRole: 'author' | 'admin' | 'system' = 'author';
      let senderId: string;

      if (req.user?.role === 'author') {
        const author = await Author.findOne({ userId: userId });
        if (!author || ticket.authorId !== author.authorId) {
          throw new ApiError(403, 'Access denied');
        }
        senderId = author.authorId;
        senderRole = 'author';
      } else {
        senderId = userId;
        senderRole = 'admin';
      }

      // Check if ticket is closed
      if (ticket.status === 'closed') {
        throw new ApiError(400, 'Cannot add message to a closed ticket');
      }

      // Create message
      const newMessage = await Message.create({
        ticketId,
        senderId,
        senderRole,
        message,
      });

      // Update ticket's last response time and status
      (ticket as any).lastResponseAt = new Date();
      if (ticket.status === 'pending' && senderRole === 'admin') {
        ticket.status = 'in_progress';
      }
      await ticket.save();

      res.status(201).json({
        success: true,
        message: 'Message added successfully',
        data: { message: newMessage },
      });
    }
  );

  // Update ticket status (admin or author can close)
  static updateTicketStatus = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { ticketId } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new ApiError(400, 'Status is required');
      }

      const ticket = await Ticket.findOne({ ticketId });

      if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
      }

      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      // Check authorization
      if (req.user?.role === 'author') {
        const author = await Author.findOne({ userId: userId });
        if (!author || ticket.authorId !== author.authorId) {
          throw new ApiError(403, 'Access denied');
        }

        // Authors can only close their own tickets
        if (status !== 'closed') {
          throw new ApiError(403, 'Authors can only close tickets');
        }
      }

      const oldStatus = ticket.status;
      ticket.status = status;

      if (status === 'resolved' || status === 'closed') {
        ticket.resolvedAt = new Date();
      }

      await ticket.save();

      // Create system message for status change
      await Message.create({
        ticketId,
        senderId: userId,
        senderRole: 'system',
        message: `Ticket status changed from ${oldStatus} to ${status}`,
      });

      res.status(200).json({
        success: true,
        message: `Ticket ${status} successfully`,
        data: { ticket },
      });
    }
  );

  // Assign ticket to admin (admin only)
  static assignTicket = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { ticketId } = req.params;
      const { assignedTo } = req.body;

      const ticket = await Ticket.findOne({ ticketId });

      if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
      }

      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      ticket.assignedTo = assignedTo || undefined;
      ticket.status = assignedTo ? 'in_progress' : 'pending';
      await ticket.save();

      // Create system message
      await Message.create({
        ticketId,
        senderId: userId,
        senderRole: 'system',
        message: assignedTo
          ? `Ticket assigned to ${assignedTo}`
          : 'Ticket unassigned',
      });

      res.status(200).json({
        success: true,
        message: 'Ticket assignment updated',
        data: { ticket },
      });
    }
  );

  // Get ticket statistics (admin only)
  static getTicketStats = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        categoryDistribution,
        priorityDistribution,
      ] = await Promise.all([
        Ticket.countDocuments(),
        Ticket.countDocuments({ status: 'pending' }),
        Ticket.countDocuments({ status: 'in_progress' }),
        Ticket.countDocuments({ status: 'resolved' }),
        Ticket.countDocuments({ status: 'closed' }),
        Ticket.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
        ]),
        Ticket.aggregate([
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
      ]);

      // Calculate average resolution time
      const resolvedTicketsWithTime = await Ticket.find({
        status: { $in: ['resolved', 'closed'] },
        resolvedAt: { $exists: true },
      }).select('createdAt resolvedAt');

      let avgResolutionTime = 0;
      if (resolvedTicketsWithTime.length > 0) {
        const totalTime = resolvedTicketsWithTime.reduce((sum, ticket) => {
          const resolutionTime =
            ticket.resolvedAt!.getTime() - ticket.createdAt.getTime();
          return sum + resolutionTime;
        }, 0);
        avgResolutionTime = totalTime / resolvedTicketsWithTime.length;
      }

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalTickets,
            openTickets,
            inProgressTickets,
            resolvedTickets,
            closedTickets,
            avgResolutionTimeHours: avgResolutionTime / (1000 * 60 * 60),
          },
          categoryDistribution,
          priorityDistribution,
        },
      });
    }
  );

  // Search tickets (admin only)
  static searchTickets = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        category,
        priority,
        assignedTo,
        authorId,
      } = req.query;

      const filter: any = {};

      if (search) {
        filter.$or = [
          { title: new RegExp(search as string, 'i') },
          { description: new RegExp(search as string, 'i') },
          { ticketId: new RegExp(search as string, 'i') },
        ];
      }

      if (status) filter.status = status;
      if (category) filter.category = category;
      if (priority) filter.priority = priority;
      if (assignedTo) filter.assignedTo = assignedTo;
      if (authorId) filter.authorId = authorId;

      const skip = (Number(page) - 1) * Number(limit);

      const [tickets, total] = await Promise.all([
        Ticket.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Ticket.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          tickets,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    }
  );
}
