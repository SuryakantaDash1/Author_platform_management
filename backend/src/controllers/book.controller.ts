import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import Book from '../models/Book.model';
import Author from '../models/Author.model';
import PricingConfig from '../models/PricingConfig.model';

export class BookController {
  // Helper: Check if user is admin
  static isAdmin(req: Request): boolean {
    return req.user?.role === 'super_admin' || req.user?.role === 'sub_admin';
  }

  // Helper: Calculate price breakdown from config and selected services
  static calculatePriceBreakdown(
    config: any,
    options: {
      needFormatting: boolean;
      needCopyright: boolean;
      needDesigning: boolean;
      physicalCopies: number;
      hasCover: boolean;
      referralDiscount?: number;
    }
  ) {
    const calc = (p: { main: number; discount: number }) => ({
      original: p.main,
      discounted: Math.round(p.main - (p.main * p.discount / 100)),
    });

    const publishing = calc(config.publishingPrice);
    const coverDesign = options.hasCover ? calc(config.coverDesignPrice) : { original: 0, discounted: 0 };
    const formatting = options.needFormatting ? calc(config.formattingPrice) : { original: 0, discounted: 0 };
    const copyright = options.needCopyright ? calc(config.copyrightPrice) : { original: 0, discounted: 0 };
    const distribution = calc(config.distributionPrice);

    const freeCopies = 2;
    const extraCopies = Math.max(0, options.physicalCopies - freeCopies);
    const physicalCopiesPrice = {
      original: extraCopies * config.perBookCopyPrice.main,
      discounted: Math.round(extraCopies * (config.perBookCopyPrice.main - (config.perBookCopyPrice.main * config.perBookCopyPrice.discount / 100))),
      quantity: options.physicalCopies,
    };

    const netAmount = publishing.discounted + coverDesign.discounted + formatting.discounted +
      copyright.discounted + distribution.discounted + physicalCopiesPrice.discounted;
    const totalOriginal = publishing.original + coverDesign.original + formatting.original +
      copyright.original + distribution.original + physicalCopiesPrice.original;
    const totalDiscount = totalOriginal - netAmount;
    const referralDiscount = options.referralDiscount || 0;
    const finalAmount = Math.max(0, netAmount - referralDiscount);

    return {
      publishing, coverDesign, formatting, copyright, distribution,
      physicalCopies: physicalCopiesPrice,
      netAmount, totalDiscount, referralDiscount, finalAmount,
    };
  }

  // Create a new book (author)
  static createBook = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        bookName, subtitle, language, bookType, targetAudience,
        needFormatting, needCopyright, needDesigning, physicalCopies,
        royaltyPercentage, expectedLaunchDate, marketplaces,
        paymentPlan, hasCover,
      } = req.body;

      if (!bookName || !bookType || !expectedLaunchDate) {
        throw new ApiError(400, 'Book name, type, and expected launch date are required');
      }

      const userId = req.user?.userId;
      if (!userId) throw new ApiError(401, 'Unauthorized');

      const author = await Author.findOne({ userId });
      if (!author) throw new ApiError(404, 'Author profile not found');
      if (author.isRestricted) {
        throw new ApiError(403, `Account restricted: ${author.restrictionReason || 'Contact support'}`);
      }

      // Fetch pricing config for selected language
      const bookLang = language || 'English';
      const pricingConfig = await PricingConfig.findOne({ language: bookLang, isActive: true });

      let priceBreakdown;
      if (pricingConfig) {
        priceBreakdown = BookController.calculatePriceBreakdown(pricingConfig, {
          needFormatting: needFormatting || false,
          needCopyright: needCopyright || false,
          needDesigning: needDesigning || false,
          physicalCopies: physicalCopies || 2,
          hasCover: hasCover !== false,
        });
      }

      // Generate unique book ID
      const bookCount = await Book.countDocuments();
      const bookId = `BK${(bookCount + 1).toString().padStart(5, '0')}`;

      const finalAmount = priceBreakdown?.finalAmount || 0;
      const plan = paymentPlan || 'full';

      // Build installments based on payment plan
      let installments: { amount: number; status: string }[] = [];
      if (finalAmount > 0) {
        switch (plan) {
          case '2_installments':
            installments = [
              { amount: Math.ceil(finalAmount * 0.5), status: 'pending' },
              { amount: Math.floor(finalAmount * 0.5), status: 'pending' },
            ];
            break;
          case '3_installments':
            installments = [
              { amount: Math.ceil(finalAmount * 0.25), status: 'pending' },
              { amount: Math.ceil(finalAmount * 0.50), status: 'pending' },
              { amount: Math.floor(finalAmount * 0.25), status: 'pending' },
            ];
            break;
          case '4_installments':
            installments = [
              { amount: Math.ceil(finalAmount * 0.25), status: 'pending' },
              { amount: Math.ceil(finalAmount * 0.50), status: 'pending' },
              { amount: Math.floor(finalAmount * 0.25), status: 'pending' },
              { amount: 0, status: 'pending' },
            ];
            break;
          case 'pay_later':
            installments = [{ amount: finalAmount, status: 'pending' }];
            break;
          default: // full
            installments = [{ amount: finalAmount, status: 'pending' }];
        }
      }

      const dueDate = plan === 'pay_later'
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : undefined;

      const book = await Book.create({
        bookId,
        authorId: author.authorId,
        bookName, subtitle,
        language: bookLang,
        bookType, targetAudience,
        needFormatting: needFormatting || false,
        needCopyright: needCopyright || false,
        needDesigning: needDesigning || false,
        physicalCopies: physicalCopies || 2,
        royaltyPercentage: royaltyPercentage || 70,
        expectedLaunchDate,
        marketplaces: marketplaces || [],
        priceBreakdown: priceBreakdown || {},
        paymentPlan: plan,
        paymentStatus: {
          totalAmount: finalAmount,
          paidAmount: 0,
          pendingAmount: finalAmount,
          paymentCompletionPercentage: 0,
          dueDate,
          installments,
        },
        status: finalAmount > 0 ? 'payment_pending' : 'pending',
      });

      // Update author's total books
      author.totalBooks = (author.totalBooks || 0) + 1;
      await author.save();

      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: { book },
      });
    }
  );

  // Get book by ID
  static getBookById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookId } = req.params;

      const book = await Book.findOne({ bookId });

      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      // Check if user has access (author or admin)
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

      res.status(200).json({
        success: true,
        data: { book },
      });
    }
  );

  // Update book details
  static updateBook = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookId } = req.params;
      const updates = req.body;

      const book = await Book.findOne({ bookId });

      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      // Check if user is the author
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });
      if (!author || book.authorId !== author.authorId) {
        throw new ApiError(403, 'Access denied');
      }

      // Only allow updates if book is in draft or rejected status
      if (!['draft', 'rejected'].includes(book.status)) {
        throw new ApiError(
          400,
          'Cannot update book. Only draft or rejected books can be edited.'
        );
      }

      // Update allowed fields
      const allowedUpdates = [
        'bookName', 'subtitle', 'language', 'bookType', 'targetAudience',
        'needFormatting', 'needCopyright', 'needDesigning',
        'physicalCopies', 'expectedLaunchDate', 'marketplaces',
      ];

      allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
          (book as any)[field] = updates[field];
        }
      });

      await book.save();

      res.status(200).json({
        success: true,
        message: 'Book updated successfully',
        data: { book },
      });
    }
  );

  // Upload cover page
  static uploadCoverPage = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookId } = req.params;

      if (!req.file) {
        throw new ApiError(400, 'Cover page image is required');
      }

      const book = await Book.findOne({ bookId });

      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      // Check ownership (admin can bypass)
      if (!BookController.isAdmin(req)) {
        const userId = req.user?.userId;
        if (!userId) throw new ApiError(401, 'Unauthorized');
        const author = await Author.findOne({ userId });
        if (!author || book.authorId !== author.authorId) throw new ApiError(403, 'Access denied');
      }

      // Upload to Cloudinary
      const url = await UploadService.uploadToCloudinary(
        req.file.path,
        'povital/books/covers'
      );

      // Delete old cover if exists
      if (book.coverPage) {
        const publicId = UploadService.getPublicIdFromUrl(book.coverPage);
        await UploadService.deleteFromCloudinary(publicId);
      }

      book.coverPage = url;
      await book.save();

      res.status(200).json({
        success: true,
        message: 'Cover page uploaded successfully',
        data: { coverPage: url },
      });
    }
  );

  // Upload book files (manuscript, etc.)
  static uploadBookFiles = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookId } = req.params;

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        throw new ApiError(400, 'Book files are required');
      }

      const book = await Book.findOne({ bookId });

      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      // Check ownership (admin can bypass)
      if (!BookController.isAdmin(req)) {
        const userId = req.user?.userId;
        if (!userId) throw new ApiError(401, 'Unauthorized');
        const author = await Author.findOne({ userId });
        if (!author || book.authorId !== author.authorId) throw new ApiError(403, 'Access denied');
      }

      const files = req.files as Express.Multer.File[];
      const filePaths = files.map((file) => file.path);

      // Upload all files to Cloudinary
      const urls = await UploadService.uploadMultipleFiles(
        filePaths,
        'povital/books/manuscripts'
      );

      book.uploadedFiles = [...book.uploadedFiles, ...urls];
      await book.save();

      res.status(200).json({
        success: true,
        message: 'Book files uploaded successfully',
        data: { uploadedFiles: book.uploadedFiles },
      });
    }
  );

  // Delete uploaded file
  static deleteBookFile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookId } = req.params;
      const { fileUrl } = req.body;

      if (!fileUrl) {
        throw new ApiError(400, 'File URL is required');
      }

      const book = await Book.findOne({ bookId });

      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      // Check ownership (admin can bypass)
      if (!BookController.isAdmin(req)) {
        const userId = req.user?.userId;
        if (!userId) throw new ApiError(401, 'Unauthorized');
        const author = await Author.findOne({ userId });
        if (!author || book.authorId !== author.authorId) throw new ApiError(403, 'Access denied');
      }

      // Check if file exists in book
      if (!book.uploadedFiles.includes(fileUrl)) {
        throw new ApiError(404, 'File not found in book');
      }

      // Delete from Cloudinary
      const publicId = UploadService.getPublicIdFromUrl(fileUrl);
      await UploadService.deleteFromCloudinary(publicId);

      // Remove from book
      book.uploadedFiles = book.uploadedFiles.filter((url) => url !== fileUrl);
      await book.save();

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        data: { uploadedFiles: book.uploadedFiles },
      });
    }
  );

  // Submit book for review
  static submitForReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookId } = req.params;

      const book = await Book.findOne({ bookId });

      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      // Check if user is the author
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });
      if (!author || book.authorId !== author.authorId) {
        throw new ApiError(403, 'Access denied');
      }

      // Validate book is ready for submission
      if (!book.coverPage) {
        throw new ApiError(400, 'Cover page is required');
      }

      if (book.uploadedFiles.length === 0) {
        throw new ApiError(400, 'At least one book file is required');
      }

      if (book.status !== 'draft' && book.status !== 'rejected') {
        throw new ApiError(400, 'Book is already submitted or published');
      }

      book.status = 'pending';
      book.rejectionReason = undefined; // Clear rejection reason
      await book.save();

      res.status(200).json({
        success: true,
        message: 'Book submitted for review successfully',
        data: { book },
      });
    }
  );

  // Delete book (only drafts)
  static deleteBook = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookId } = req.params;

      const book = await Book.findOne({ bookId });

      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      // Check if user is the author
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });
      if (!author || book.authorId !== author.authorId) {
        throw new ApiError(403, 'Access denied');
      }

      // Only allow deletion of draft books
      if (book.status !== 'draft') {
        throw new ApiError(400, 'Only draft books can be deleted');
      }

      // Delete all uploaded files from Cloudinary
      if (book.coverPage) {
        const publicId = UploadService.getPublicIdFromUrl(book.coverPage);
        await UploadService.deleteFromCloudinary(publicId);
      }

      for (const fileUrl of book.uploadedFiles) {
        const publicId = UploadService.getPublicIdFromUrl(fileUrl);
        await UploadService.deleteFromCloudinary(publicId);
      }

      await Book.deleteOne({ bookId });

      res.status(200).json({
        success: true,
        message: 'Book deleted successfully',
      });
    }
  );

  // Get pricing for a language (used by book form)
  static getPricingSuggestions = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { language } = req.query;

      if (!language) {
        throw new ApiError(400, 'Language is required');
      }

      const config = await PricingConfig.findOne({ language, isActive: true });

      if (!config) {
        res.status(200).json({
          success: true,
          message: 'No pricing configuration found for this language',
          data: { config: null },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { config },
      });
    }
  );

  // Generate a signed URL for a book file (PDF access bypass for Cloudinary restrictions)
  static getFileUrl = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookId } = req.params;
      const { fileUrl } = req.query;

      if (!fileUrl || typeof fileUrl !== 'string') {
        throw new ApiError(400, 'fileUrl query parameter is required');
      }

      const book = await Book.findOne({ bookId });
      if (!book) throw new ApiError(404, 'Book not found');

      const userId = req.user?.userId;
      if (!userId) throw new ApiError(401, 'Unauthorized');

      // Authors can only access their own books; admins can access any
      if (req.user?.role === 'author') {
        const author = await Author.findOne({ userId });
        if (!author || book.authorId !== author.authorId) {
          throw new ApiError(403, 'Access denied');
        }
      }

      // Verify the requested URL belongs to this book
      const isBookFile =
        book.uploadedFiles.includes(fileUrl) || book.coverPage === fileUrl;

      if (!isBookFile) {
        throw new ApiError(403, 'File does not belong to this book');
      }

      // Generate a signed delivery URL (account has "Delivery URL Security" enabled)
      const signedUrl = UploadService.generateSignedUrl(fileUrl);

      res.status(200).json({
        success: true,
        data: { url: signedUrl },
      });
    }
  );

  // Update book sales data (admin only - called from admin routes)
  static updateSalesData = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookId } = req.params;
      const { platform, sellingUnits, productLink, rating } = req.body;

      if (!platform || sellingUnits === undefined) {
        throw new ApiError(400, 'Platform and selling units are required');
      }

      const book = await Book.findOne({ bookId });

      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      // Get existing platform data or create new
      const platformData = book.platformWiseSales.get(platform) || {
        sellingUnits: 0,
      };

      // Update platform data
      platformData.sellingUnits += sellingUnits;
      if (productLink) platformData.productLink = productLink;
      if (rating) platformData.rating = rating;

      book.platformWiseSales.set(platform, platformData);

      // Update total selling units
      book.totalSellingUnits += sellingUnits;

      await book.save();

      // Update author's total sold units
      const author = await Author.findOne({ authorId: book.authorId });
      if (author) {
        author.totalSoldUnits += sellingUnits;
        await author.save();
      }

      res.status(200).json({
        success: true,
        message: 'Sales data updated successfully',
        data: { book },
      });
    }
  );
}
