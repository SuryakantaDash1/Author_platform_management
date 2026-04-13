import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import Author from '../models/Author.model';
import User from '../models/User.model';
import Book from '../models/Book.model';
import Transaction from '../models/Transaction.model';
import BankAccount from '../models/BankAccount.model';
import Referral from '../models/Referral.model';
import crypto from 'crypto';

export class AuthorController {
  // Get author profile
  static getProfile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const user = await User.findOne({ userId: userId });
      const author = await Author.findOne({ userId: userId });

      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      res.status(200).json({
        success: true,
        data: {
          user,
          author,
        },
      });
    }
  );

  // Update author profile
  static updateProfile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        publishedArticles,
        address,
      } = req.body;

      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });

      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      if (publishedArticles !== undefined) author.publishedArticles = publishedArticles;
      if (address) {
        author.address = {
          ...author.address,
          ...address,
        };
      }

      await author.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { author },
      });
    }
  );

  // Upload profile picture
  static uploadProfilePicture = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      if (!req.file) {
        throw new ApiError(400, 'Profile picture is required');
      }

      // Upload to Cloudinary
      const url = await UploadService.uploadToCloudinary(
        req.file.path,
        'povital/profiles'
      );

      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });

      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      // Delete old profile picture from Cloudinary if exists
      if (author.profilePicture) {
        const publicId = UploadService.getPublicIdFromUrl(author.profilePicture);
        await UploadService.deleteFromCloudinary(publicId);
      }

      author.profilePicture = url;
      await author.save();

      res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: { profilePicture: url },
      });
    }
  );

  // Get author dashboard statistics
  static getDashboard = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });

      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      const [
        totalBooks,
        publishedBooks,
        pendingBooks,
        totalEarnings,
        pendingPayments,
        recentTransactions,
        topSellingBook,
      ] = await Promise.all([
        Book.countDocuments({ authorId: author.authorId }),
        Book.countDocuments({ authorId: author.authorId, status: 'published' }),
        Book.countDocuments({ authorId: author.authorId, status: 'pending' }),
        Transaction.aggregate([
          {
            $match: {
              authorId: author.authorId,
              status: 'completed',
              type: 'royalty_payment',
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.aggregate([
          {
            $match: {
              authorId: author.authorId,
              status: 'pending',
              type: 'royalty_payment',
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.find({ authorId: author.authorId })
          .sort({ createdAt: -1 })
          .limit(5),
        Book.findOne({ authorId: author.authorId, status: 'published' }).sort({
          totalSellingUnits: -1,
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalBooks,
            publishedBooks,
            pendingBooks,
            totalEarnings: totalEarnings[0]?.total || 0,
            pendingPayments: pendingPayments[0]?.total || 0,
            totalSoldUnits: author.totalSoldUnits,
          },
          recentTransactions,
          topSellingBook,
        },
      });
    }
  );

  // Get all books by author
  static getMyBooks = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        status,
        search,
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

      if (search) {
        filter.bookName = new RegExp(search as string, 'i');
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

      const [books, total] = await Promise.all([
        Book.find(filter).sort(sort).skip(skip).limit(Number(limit)),
        Book.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          books,
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

  // Get transactions
  static getTransactions = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 20,
        type,
        status,
        startDate,
        endDate,
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

      if (type) {
        filter.type = type;
      }

      if (status) {
        filter.status = status;
      }

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

  // Add bank account
  static addBankAccount = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        bankName,
        accountHolderName,
        accountNumber,
        ifscCode,
        branchName,
        accountType,
      } = req.body;

      if (
        !bankName ||
        !accountHolderName ||
        !accountNumber ||
        !ifscCode ||
        !branchName
      ) {
        throw new ApiError(400, 'All bank details are required');
      }

      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });

      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      // Check if setting as primary and another primary exists
      if (accountType === 'primary') {
        const existingPrimary = await BankAccount.findOne({
          authorId: author.authorId,
          accountType: 'primary',
        });

        if (existingPrimary) {
          existingPrimary.accountType = 'secondary';
          await existingPrimary.save();
        }
      }

      // Encrypt account number for security
      const cipher = crypto.createCipher(
        'aes-256-cbc',
        process.env.ENCRYPTION_KEY!
      );
      let encryptedAccountNumber = cipher.update(accountNumber, 'utf8', 'hex');
      encryptedAccountNumber += cipher.final('hex');

      const bankAccount = await BankAccount.create({
        authorId: author.authorId,
        bankName,
        accountHolderName,
        accountNumber: accountNumber.slice(-4), // Store only last 4 digits
        accountNumberEncrypted: encryptedAccountNumber,
        ifscCode: ifscCode.toUpperCase(),
        branchName,
        accountType: accountType || 'secondary',
      });

      res.status(201).json({
        success: true,
        message: 'Bank account added successfully',
        data: { bankAccount },
      });
    }
  );

  // Get all bank accounts
  static getBankAccounts = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });

      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      const bankAccounts = await BankAccount.find({
        authorId: author.authorId,
        isActive: true,
      });

      res.status(200).json({
        success: true,
        data: { bankAccounts },
      });
    }
  );

  // Delete bank account
  static deleteBankAccount = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { accountId } = req.params;

      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });

      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      const bankAccount = await BankAccount.findOne({
        _id: accountId,
        authorId: author.authorId,
      });

      if (!bankAccount) {
        throw new ApiError(404, 'Bank account not found');
      }

      bankAccount.isActive = false;
      await bankAccount.save();

      res.status(200).json({
        success: true,
        message: 'Bank account deleted successfully',
      });
    }
  );

  // Get referrals
  static getReferrals = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });

      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      const [referrals, totalEarnings] = await Promise.all([
        Referral.find({ referrerId: author.authorId }).sort({ createdAt: -1 }),
        Referral.aggregate([
          { $match: { referrerId: author.authorId, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
        ]),
      ]);

      res.status(200).json({
        success: true,
        data: {
          referralCode: author.referralCode,
          totalReferrals: referrals.length,
          totalEarnings: totalEarnings[0]?.total || 0,
          referrals,
        },
      });
    }
  );

  // Get sales analytics
  static getSalesAnalytics = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { startDate, endDate } = req.query;

      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });

      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);

      // Monthly sales
      const monthlySales = await Book.aggregate([
        { $match: { authorId: author.authorId, status: 'published' } },
        {
          $group: {
            _id: null,
            totalUnits: { $sum: '$totalSellingUnits' },
            totalRevenue: { $sum: '$totalRevenue' },
          },
        },
      ]);

      // Platform-wise sales
      const books = await Book.find({
        authorId: author.authorId,
        status: 'published',
      });

      const platformWiseSales: any = {};
      books.forEach((book) => {
        book.platformWiseSales.forEach((value, key) => {
          if (!platformWiseSales[key]) {
            platformWiseSales[key] = {
              sellingUnits: 0,
              count: 0,
            };
          }
          platformWiseSales[key].sellingUnits += value.sellingUnits;
          platformWiseSales[key].count += 1;
        });
      });

      // Book type distribution
      const bookTypeDistribution = await Book.aggregate([
        { $match: { authorId: author.authorId, status: 'published' } },
        { $group: { _id: '$bookType', count: { $sum: 1 } } },
      ]);

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalUnits: monthlySales[0]?.totalUnits || 0,
            totalRevenue: monthlySales[0]?.totalRevenue || 0,
          },
          platformWiseSales,
          bookTypeDistribution,
        },
      });
    }
  );
}
