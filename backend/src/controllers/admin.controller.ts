import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.model';
import Author from '../models/Author.model';
import Book from '../models/Book.model';
import Transaction from '../models/Transaction.model';
import BankAccount from '../models/BankAccount.model';
import Ticket from '../models/Ticket.model';
import PricingConfig from '../models/PricingConfig.model';
import AuditLog from '../models/AuditLog.model';
export class AdminController {
  // Create author account by admin (with auto-generated password)
  static createAuthor = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { firstName, lastName, email, mobile, referralCode, qualification, university, pinCode, city, district, state, country, housePlot, landmark } = req.body;

      if (!firstName || !lastName || !email) {
        throw new ApiError(400, 'First name, last name, and email are required');
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError(400, 'Email already registered');
      }

      // Generate readable password: first 4 chars of name + @ + 3 random digits
      const nameBase = firstName.toLowerCase().replace(/[^a-z]/g, '');
      const namePart = nameBase.length >= 4
        ? nameBase.slice(0, 4)
        : nameBase + '0'.repeat(4 - nameBase.length); // pad short names with zeros
      const digits = Math.floor(Math.random() * 900 + 100).toString(); // 100-999
      const password = `${namePart}@${digits}`;

      // Create author account
      const result = await AuthService.createAuthor({
        email,
        firstName,
        lastName,
        password,
        referralCode,
      });

      // Update user with mobile if provided
      if (mobile) {
        await User.findOneAndUpdate({ userId: result.user.userId }, { mobile });
      }

      // Update author with additional profile fields
      const authorUpdate: any = {};
      if (qualification) authorUpdate.qualification = qualification;
      if (university) authorUpdate.university = university;
      if (pinCode || city || district || state || country || housePlot || landmark) {
        authorUpdate.address = {
          pinCode: pinCode || '',
          city: city || '',
          district: district || '',
          state: state || '',
          country: country || 'India',
          housePlot: housePlot || '',
          landmark: landmark || '',
        };
      }
      if (Object.keys(authorUpdate).length > 0) {
        await Author.findOneAndUpdate({ authorId: result.author.authorId }, authorUpdate);
      }

      // Send credentials email
      await EmailService.sendAdminCreatedAuthorEmail(
        email,
        firstName,
        result.author.authorId,
        password,
        result.author.referralCode
      );

      // Log audit
      const userId = req.user?.userId;
      if (userId) {
        await AuditLog.create({
          userId: userId,
          action: 'create',
          resource: 'Author',
          resourceId: result.author.authorId,
          details: {
            adminId: userId,
            createdAuthorId: result.author.authorId,
            email,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }

      res.status(201).json({
        success: true,
        message: 'Author account created successfully. Credentials sent to email.',
        data: {
          user: {
            userId: result.user.userId,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            email: result.user.email,
            role: result.user.role,
            tier: result.user.tier,
          },
          author: {
            authorId: result.author.authorId,
            referralCode: result.author.referralCode,
          },
        },
      });
    }
  );

  // Get all authors with filters
  static getAllAuthors = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 20,
        search,
        tier,
        isRestricted,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filter: any = {};

      if (search) {
        const users = await User.find({
          $or: [
            { firstName: new RegExp(search as string, 'i') },
            { lastName: new RegExp(search as string, 'i') },
            { email: new RegExp(search as string, 'i') },
          ],
        }).select('userId');

        filter.userId = { $in: users.map((u) => u.userId) };
      }

      if (tier) {
        const users = await User.find({ tier }).select('userId');
        filter.userId = { $in: users.map((u) => u.userId) };
      }

      if (isRestricted !== undefined) {
        filter.isRestricted = isRestricted === 'true';
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

      const [authors, total] = await Promise.all([
        Author.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Author.countDocuments(filter),
      ]);

      // Manually join user data (userId is a string, not ObjectId)
      const userIds = authors.map((a) => a.userId);
      const users = await User.find({ userId: { $in: userIds } })
        .select('userId firstName lastName email mobile tier isActive')
        .lean();
      const userMap = new Map(users.map((u) => [u.userId, u]));

      const authorsWithUsers = authors.map((author) => ({
        ...author,
        user: userMap.get(author.userId) || null,
      }));

      res.status(200).json({
        success: true,
        data: {
          authors: authorsWithUsers,
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

  // Get author details
  static getAuthorDetails = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { authorId } = req.params;

      const authorDoc = await Author.findOne({ authorId }).lean();

      if (!authorDoc) {
        throw new ApiError(404, 'Author not found');
      }

      // Manually join user data
      const user = await User.findOne({ userId: authorDoc.userId })
        .select('userId firstName lastName email mobile tier isActive lastLogin')
        .lean();

      const [books, bankAccounts, transactions] = await Promise.all([
        Book.find({ authorId }).sort({ createdAt: -1 }),
        BankAccount.find({ authorId }),
        Transaction.find({ authorId }).sort({ createdAt: -1 }).limit(10),
      ]);

      res.status(200).json({
        success: true,
        data: {
          author: { ...authorDoc, user },
          books,
          bankAccounts,
          recentTransactions: transactions,
        },
      });
    }
  );

  // Update author tier
  static updateAuthorTier = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { authorId } = req.params;
      const { tier } = req.body;

      if (!tier) {
        throw new ApiError(400, 'Tier is required');
      }

      const author = await Author.findOne({ authorId });
      if (!author) {
        throw new ApiError(404, 'Author not found');
      }

      const user = await User.findOne({ userId: author.userId });
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const oldTier = user.tier;
      user.tier = tier;
      await user.save();

      // Log audit
      const userId = req.user?.userId;
      if (userId) {
        await AuditLog.create({
          userId: userId,
          action: 'update',
          resource: 'Author',
          resourceId: authorId,
          details: {
            adminId: userId,
            oldTier,
            newTier: tier,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }

      res.status(200).json({
        success: true,
        message: 'Author tier updated successfully',
        data: { user },
      });
    }
  );

  // Restrict/Unrestrict author
  static restrictAuthor = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { authorId } = req.params;
      const { isRestricted, restrictionReason } = req.body;

      const author = await Author.findOne({ authorId });
      if (!author) {
        throw new ApiError(404, 'Author not found');
      }

      author.isRestricted = isRestricted;
      author.restrictionReason = isRestricted ? restrictionReason : undefined;
      await author.save();

      // Log audit
      const userId = req.user?.userId;
      if (userId) {
        await AuditLog.create({
          userId: userId,
          action: isRestricted ? 'restrict' : 'activate',
          resource: 'Author',
          resourceId: authorId,
          details: {
            adminId: userId,
            reason: restrictionReason,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }

      res.status(200).json({
        success: true,
        message: `Author ${isRestricted ? 'restricted' : 'unrestricted'} successfully`,
        data: { author },
      });
    }
  );

  // Approve/Reject book
  static updateBookStatus = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookId } = req.params;
      const { status, rejectionReason } = req.body;

      if (!status) {
        throw new ApiError(400, 'Status is required');
      }

      const book = await Book.findOne({ bookId });
      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      const oldStatus = book.status;
      book.status = status;

      if (status === 'rejected' && rejectionReason) {
        book.rejectionReason = rejectionReason;
      }

      if (status === 'published' && !book.actualLaunchDate) {
        book.actualLaunchDate = new Date();
      }

      await book.save();

      // Update author's total books if published
      if (status === 'published' && oldStatus !== 'published') {
        const author = await Author.findOne({ authorId: book.authorId });
        if (author) {
          author.totalBooks += 1;
          await author.save();
        }
      }

      // Log audit
      const userId = req.user?.userId;
      if (userId) {
        await AuditLog.create({
          userId: userId,
          action: 'UPDATE_BOOK_STATUS',
          resource: 'Book',
          resourceId: bookId,
          details: {
            adminId: userId,
            oldStatus,
            newStatus: status,
            rejectionReason,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }

      res.status(200).json({
        success: true,
        message: `Book ${status} successfully`,
        data: { book },
      });
    }
  );

  // Get all books with filters
  static getAllBooks = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        bookType,
        authorId,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filter: any = {};

      if (search) {
        filter.bookName = new RegExp(search as string, 'i');
      }

      if (status) {
        filter.status = status;
      }

      if (bookType) {
        filter.bookType = bookType;
      }

      if (authorId) {
        filter.authorId = authorId;
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

      const [books, total] = await Promise.all([
        Book.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
        Book.countDocuments(filter),
      ]);

      // Join author + user data
      const authorIds = [...new Set(books.map(b => b.authorId))];
      const authors = await Author.find({ authorId: { $in: authorIds } }).lean();
      const userIds = authors.map(a => a.userId);
      const users = await User.find({ userId: { $in: userIds } })
        .select('userId firstName lastName email')
        .lean();
      const userMap = new Map(users.map(u => [u.userId, u]));
      const authorMap = new Map(authors.map(a => [a.authorId, { ...a, user: userMap.get(a.userId) || null }]));

      const booksWithAuthors = books.map(book => ({
        ...book,
        author: authorMap.get(book.authorId) || null,
        authorName: (() => {
          const a = authorMap.get(book.authorId);
          const u = a ? userMap.get(a.userId) : null;
          return u ? `${u.firstName} ${u.lastName}`.trim() : book.authorId;
        })(),
      }));

      res.status(200).json({
        success: true,
        data: {
          books: booksWithAuthors,
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

  // Get all support tickets
  static getAllTickets = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        category,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filter: any = {};

      if (status) {
        filter.status = status;
      }

      if (priority) {
        filter.priority = priority;
      }

      if (category) {
        filter.category = category;
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

      const [tickets, total] = await Promise.all([
        Ticket.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
        Ticket.countDocuments(filter),
      ]);

      // Enrich tickets with author names
      const authorIds = [...new Set(tickets.map((t) => t.authorId))];
      const authors = await Author.find({ authorId: { $in: authorIds } }).lean();
      const authorUserIds = authors.map((a) => a.userId);
      const users = await User.find({ userId: { $in: authorUserIds } })
        .select('userId firstName lastName')
        .lean();
      const userMap = new Map(users.map((u) => [u.userId, u]));
      const authorMap = new Map(
        authors.map((a) => {
          const u = userMap.get(a.userId);
          return [a.authorId, u ? `${u.firstName} ${u.lastName}` : 'Unknown'];
        })
      );

      const ticketsWithAuthors = tickets.map((t) => ({
        ...t,
        authorName: authorMap.get(t.authorId) || 'Unknown Author',
      }));

      res.status(200).json({
        success: true,
        data: {
          tickets: ticketsWithAuthors,
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

  // Get platform statistics
  static getPlatformStats = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const [
        totalAuthors,
        totalBooks,
        totalRevenue,
        totalTransactions,
        activeTickets,
      ] = await Promise.all([
        Author.countDocuments(),
        Book.countDocuments({ status: 'published' }),
        Transaction.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.countDocuments(),
        Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      ]);

      // Tier distribution
      const tierDistribution = await User.aggregate([
        { $match: { role: 'author' } },
        { $group: { _id: '$tier', count: { $sum: 1 } } },
      ]);

      // Monthly revenue
      const monthlyRevenue = await Transaction.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) },
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
      ]);

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalAuthors,
            totalBooks,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalTransactions,
            activeTickets,
          },
          tierDistribution,
          monthlyRevenue,
        },
      });
    }
  );

  // Manage pricing configuration
  static updatePricingConfig = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { language, bookType, priceRange } = req.body;

      if (!language || !bookType || !priceRange) {
        throw new ApiError(400, 'Language, book type, and price range are required');
      }

      let config = await PricingConfig.findOne({ language, bookType });

      if (config) {
        (config as any).priceRange = priceRange;
        await config.save();
      } else {
        config = await PricingConfig.create({
          language,
          bookType,
          priceRange,
        });
      }

      // Log audit
      const userId = req.user?.userId;
      if (userId) {
        await AuditLog.create({
          userId: userId,
          action: 'UPDATE_PRICING',
          resource: 'PricingConfig',
          resourceId: config._id.toString(),
          details: {
            adminId: userId,
            language,
            bookType,
            priceRange,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }

      res.status(200).json({
        success: true,
        message: 'Pricing configuration updated successfully',
        data: { config },
      });
    }
  );

  // Get audit logs
  static getAuditLogs = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 50,
        action,
        resource,
        userId,
        startDate,
        endDate,
      } = req.query;

      const filter: any = {};

      if (action) filter.action = action;
      if (resource) filter.resource = resource;
      if (userId) filter.userId = userId;

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate as string);
        if (endDate) filter.createdAt.$lte = new Date(endDate as string);
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [logs, total] = await Promise.all([
        AuditLog.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        AuditLog.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          logs,
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

  // Admin creates book for author
  static createBookForAuthor = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        authorId, bookName, subtitle, language, bookType, targetAudience,
        needFormatting, needCopyright, needDesigning, physicalCopies,
        royaltyPercentage, expectedLaunchDate, marketplaces, paymentPlan,
      } = req.body;

      if (!authorId || !bookName || !bookType || !expectedLaunchDate) {
        throw new ApiError(400, 'Author ID, book name, type, and launch date are required');
      }

      const author = await Author.findOne({ authorId });
      if (!author) throw new ApiError(404, 'Author not found');

      const user = await User.findOne({ userId: author.userId });
      if (!user) throw new ApiError(404, 'User not found');

      // Fetch pricing config
      const bookLang = language || 'English';
      const pricingConfig = await PricingConfig.findOne({ language: bookLang, isActive: true });

      let priceBreakdown;
      if (pricingConfig) {
        const calc = (p: { main: number; discount: number }) => ({
          original: p.main,
          discounted: Math.round(p.main - (p.main * p.discount / 100)),
        });
        const publishing = calc(pricingConfig.publishingPrice);
        const coverDesign = calc(pricingConfig.coverDesignPrice);
        const formatting = needFormatting ? calc(pricingConfig.formattingPrice) : { original: 0, discounted: 0 };
        const copyright = needCopyright ? calc(pricingConfig.copyrightPrice) : { original: 0, discounted: 0 };
        const distribution = calc(pricingConfig.distributionPrice);
        const freeCopies = 2;
        const extraCopies = Math.max(0, (physicalCopies || 2) - freeCopies);
        const physicalCopiesPrice = {
          original: extraCopies * pricingConfig.perBookCopyPrice.main,
          discounted: Math.round(extraCopies * (pricingConfig.perBookCopyPrice.main - (pricingConfig.perBookCopyPrice.main * pricingConfig.perBookCopyPrice.discount / 100))),
          quantity: physicalCopies || 2,
        };
        const netAmount = publishing.discounted + coverDesign.discounted + formatting.discounted +
          copyright.discounted + distribution.discounted + physicalCopiesPrice.discounted;
        const totalOriginal = publishing.original + coverDesign.original + formatting.original +
          copyright.original + distribution.original + physicalCopiesPrice.original;
        priceBreakdown = {
          publishing, coverDesign, formatting, copyright, distribution,
          physicalCopies: physicalCopiesPrice,
          netAmount, totalDiscount: totalOriginal - netAmount, referralDiscount: 0,
          finalAmount: netAmount,
        };
      }

      const bookCount = await Book.countDocuments();
      const bookId = `BK${(bookCount + 1).toString().padStart(5, '0')}`;
      const finalAmount = priceBreakdown?.finalAmount || 0;

      const book = await Book.create({
        bookId, authorId,
        bookName, subtitle,
        language: bookLang, bookType, targetAudience,
        needFormatting: needFormatting || false,
        needCopyright: needCopyright || false,
        needDesigning: needDesigning || false,
        physicalCopies: physicalCopies || 2,
        royaltyPercentage: royaltyPercentage || 70,
        expectedLaunchDate,
        marketplaces: marketplaces || [],
        priceBreakdown: priceBreakdown || {},
        paymentPlan: paymentPlan || 'full',
        paymentStatus: {
          totalAmount: finalAmount,
          paidAmount: 0,
          pendingAmount: finalAmount,
          paymentCompletionPercentage: 0,
          installments: finalAmount > 0 ? [{ amount: finalAmount, status: 'pending' }] : [],
        },
        status: 'payment_pending',
        createdBy: req.user?.userId,
      });

      // Update author total books
      author.totalBooks = (author.totalBooks || 0) + 1;
      await author.save();

      // Send email to author about new book
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        await EmailService.sendPaymentRequestEmail(
          user.email!,
          user.firstName,
          bookName,
          finalAmount,
          `${frontendUrl}/author/books`
        );
      } catch { /* non-critical */ }

      res.status(201).json({
        success: true,
        message: 'Book created for author successfully',
        data: { book },
      });
    }
  );
}
