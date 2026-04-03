import { Request, Response, NextFunction } from 'express';
import { RoyaltyService } from '../services/royalty.service';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import Transaction from '../models/Transaction.model';
import Author from '../models/Author.model';
import Book from '../models/Book.model';
import BankAccount from '../models/BankAccount.model';

export class FinancialController {
  // Calculate royalty for a book
  static calculateRoyalty = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookId, platformWiseSales, expenses } = req.body;

      if (!bookId || !platformWiseSales || !expenses) {
        throw new ApiError(
          400,
          'Book ID, platform-wise sales, and expenses are required'
        );
      }

      const book = await Book.findOne({ bookId });

      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      // Check if user is authorized (admin or book author)
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      if (req.user?.role === 'author') {
        const author = await Author.findOne({ userId: userId });
        if (!author || book.authorId !== author.authorId) {
          throw new ApiError(403, 'Access denied');
        }
      }

      const royalty = await RoyaltyService.calculateBookRoyalty(
        bookId,
        platformWiseSales,
        expenses
      );

      res.status(200).json({
        success: true,
        data: royalty,
      });
    }
  );

  // Process royalty payment (admin only)
  static processRoyaltyPayment = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { authorId, amount, description, relatedBookId } = req.body;

      if (!authorId || !amount) {
        throw new ApiError(400, 'Author ID and amount are required');
      }

      const author = await Author.findOne({ authorId });

      if (!author) {
        throw new ApiError(404, 'Author not found');
      }

      // Check if author has a verified primary bank account
      const primaryBank = await BankAccount.findOne({
        authorId,
        accountType: 'primary',
        isVerified: true,
        isActive: true,
      });

      if (!primaryBank) {
        throw new ApiError(
          400,
          'Author does not have a verified primary bank account'
        );
      }

      // Generate unique transaction ID
      const transactionCount = await Transaction.countDocuments();
      const transactionId = `TXN${(transactionCount + 1)
        .toString()
        .padStart(8, '0')}`;

      const transaction = await Transaction.create({
        transactionId,
        authorId,
        type: 'royalty_payment',
        amount,
        status: 'pending',
        description:
          description || `Royalty payment for ${relatedBookId || 'books'}`,
        relatedBookId,
        paymentMethod: 'bank_transfer',
        paymentDetails: {
          bankName: primaryBank.bankName,
          accountNumber: primaryBank.accountNumber,
          ifscCode: primaryBank.ifscCode,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Royalty payment initiated',
        data: { transaction },
      });
    }
  );

  // Update transaction status (admin only)
  static updateTransactionStatus = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { transactionId } = req.params;
      const { status, failureReason } = req.body;

      if (!status) {
        throw new ApiError(400, 'Status is required');
      }

      const transaction = await Transaction.findOne({ transactionId });

      if (!transaction) {
        throw new ApiError(404, 'Transaction not found');
      }

      transaction.status = status;

      if (status === 'failed' && failureReason) {
        (transaction as any).failureReason = failureReason;
      }

      if (status === 'completed') {
        (transaction as any).completedAt = new Date();

        // Update author's total earnings
        const author = await Author.findOne({
          authorId: transaction.authorId,
        });
        if (author) {
          author.totalEarnings += transaction.amount;
          await author.save();
        }

        // Update book payment status if related to a book
        if ((transaction as any).relatedBookId) {
          const book = await Book.findOne({
            bookId: (transaction as any).relatedBookId,
          });
          if (book) {
            book.paymentStatus.paidAmount += transaction.amount;
            book.paymentStatus.pendingAmount =
              book.paymentStatus.totalAmount - book.paymentStatus.paidAmount;
            book.paymentStatus.paymentCompletionPercentage =
              book.paymentStatus.totalAmount > 0
                ? (book.paymentStatus.paidAmount /
                    book.paymentStatus.totalAmount) *
                  100
                : 0;
            await book.save();
          }
        }
      }

      await transaction.save();

      res.status(200).json({
        success: true,
        message: `Transaction ${status} successfully`,
        data: { transaction },
      });
    }
  );

  // Get all transactions (admin view)
  static getAllTransactions = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 20,
        type,
        status,
        authorId,
        startDate,
        endDate,
      } = req.query;

      const filter: any = {};

      if (type) filter.type = type;
      if (status) filter.status = status;
      if (authorId) filter.authorId = authorId;

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate as string);
        if (endDate) filter.createdAt.$lte = new Date(endDate as string);
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [transactions, total] = await Promise.all([
        Transaction.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Transaction.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          transactions,
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

  // Get transaction by ID
  static getTransactionById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { transactionId } = req.params;

      const transaction = await Transaction.findOne({ transactionId });

      if (!transaction) {
        throw new ApiError(404, 'Transaction not found');
      }

      // Check authorization
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      if (req.user?.role === 'author') {
        const author = await Author.findOne({ userId: userId });
        if (!author || transaction.authorId !== author.authorId) {
          throw new ApiError(403, 'Access denied');
        }
      }

      res.status(200).json({
        success: true,
        data: { transaction },
      });
    }
  );

  // Process subscription payment
  static processSubscriptionPayment = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { authorId, tier, amount, paymentMethod, paymentDetails } =
        req.body;

      if (!authorId || !tier || !amount || !paymentMethod) {
        throw new ApiError(
          400,
          'Author ID, tier, amount, and payment method are required'
        );
      }

      const author = await Author.findOne({ authorId });

      if (!author) {
        throw new ApiError(404, 'Author not found');
      }

      // Generate unique transaction ID
      const transactionCount = await Transaction.countDocuments();
      const transactionId = `TXN${(transactionCount + 1)
        .toString()
        .padStart(8, '0')}`;

      const transaction = await Transaction.create({
        transactionId,
        authorId,
        type: 'subscription',
        amount,
        status: 'pending',
        description: `Subscription payment for ${tier} tier`,
        paymentMethod,
        paymentDetails,
      });

      res.status(201).json({
        success: true,
        message: 'Subscription payment initiated',
        data: { transaction },
      });
    }
  );

  // Get financial summary for author
  static getAuthorFinancialSummary = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { authorId } = req.params;

      const author = await Author.findOne({ authorId });

      if (!author) {
        throw new ApiError(404, 'Author not found');
      }

      // Check authorization
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      if (req.user?.role === 'author') {
        const userAuthor = await Author.findOne({ userId: userId });
        if (!userAuthor || userAuthor.authorId !== authorId) {
          throw new ApiError(403, 'Access denied');
        }
      }

      const [
        totalEarnings,
        pendingPayments,
        completedPayments,
        books,
        recentTransactions,
      ] = await Promise.all([
        Transaction.aggregate([
          {
            $match: {
              authorId,
              type: 'royalty_payment',
              status: 'completed',
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.aggregate([
          {
            $match: {
              authorId,
              type: 'royalty_payment',
              status: 'pending',
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.find({
          authorId,
          type: 'royalty_payment',
          status: 'completed',
        })
          .sort({ completedAt: -1 })
          .limit(10),
        Book.find({ authorId, status: 'published' }),
        Transaction.find({ authorId })
          .sort({ createdAt: -1 })
          .limit(10),
      ]);

      // Calculate total revenue from books
      const totalRevenue = books.reduce(
        (sum, book) => sum + book.totalRevenue,
        0
      );

      // Calculate pending amounts from books
      const pendingFromBooks = books.reduce(
        (sum, book) => sum + book.paymentStatus.pendingAmount,
        0
      );

      res.status(200).json({
        success: true,
        data: {
          summary: {
            totalEarnings: totalEarnings[0]?.total || 0,
            pendingPayments: pendingPayments[0]?.total || 0,
            totalRevenue,
            pendingFromBooks,
            totalBooks: books.length,
            totalSoldUnits: author.totalSoldUnits,
          },
          recentCompletedPayments: completedPayments,
          recentTransactions,
          books: books.map((book) => ({
            bookId: book.bookId,
            bookName: book.bookName,
            totalRevenue: book.totalRevenue,
            totalSellingUnits: book.totalSellingUnits,
            paymentStatus: book.paymentStatus,
          })),
        },
      });
    }
  );

  // Get platform financial analytics (admin only)
  static getPlatformFinancials = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { startDate, endDate } = req.query;

      const dateFilter: any = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate as string);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate as string);
      }

      const [
        totalRevenue,
        totalPaidToAuthors,
        pendingPayments,
        subscriptionRevenue,
        monthlyRevenue,
      ] = await Promise.all([
        Book.aggregate([
          { $match: { status: 'published', ...dateFilter } },
          { $group: { _id: null, total: { $sum: '$totalRevenue' } } },
        ]),
        Transaction.aggregate([
          {
            $match: {
              type: 'royalty_payment',
              status: 'completed',
              ...dateFilter,
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.aggregate([
          {
            $match: {
              type: 'royalty_payment',
              status: 'pending',
              ...dateFilter,
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.aggregate([
          {
            $match: {
              type: 'subscription',
              status: 'completed',
              ...dateFilter,
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.aggregate([
          {
            $match: {
              status: 'completed',
              ...dateFilter,
            },
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              revenue: { $sum: '$amount' },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
      ]);

      const platformEarnings =
        (totalRevenue[0]?.total || 0) - (totalPaidToAuthors[0]?.total || 0);

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalPaidToAuthors: totalPaidToAuthors[0]?.total || 0,
            pendingPayments: pendingPayments[0]?.total || 0,
            platformEarnings,
            subscriptionRevenue: subscriptionRevenue[0]?.total || 0,
          },
          monthlyRevenue,
        },
      });
    }
  );
}
