import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import Book from '../models/Book.model';
import Author from '../models/Author.model';
import PricingConfig from '../models/PricingConfig.model';

export class BookController {
  // Create a new book (draft)
  static createBook = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        bookName,
        subtitle,
        bookType,
        targetAudience,
        needFormatting,
        needCopyright,
        physicalCopies,
        royaltyPercentage,
        expectedLaunchDate,
        marketplaces,
      } = req.body;

      if (!bookName || !bookType || !royaltyPercentage || !expectedLaunchDate) {
        throw new ApiError(
          400,
          'Book name, type, royalty percentage, and expected launch date are required'
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

      // Check if author is restricted
      if (author.isRestricted) {
        throw new ApiError(
          403,
          `Account restricted: ${author.restrictionReason || 'Contact support'}`
        );
      }

      // Generate unique book ID
      const bookCount = await Book.countDocuments();
      const bookId = `BK${(bookCount + 1).toString().padStart(5, '0')}`;

      const book = await Book.create({
        bookId,
        authorId: author.authorId,
        bookName,
        subtitle,
        bookType,
        targetAudience,
        needFormatting: needFormatting || false,
        needCopyright: needCopyright || false,
        physicalCopies: physicalCopies || 2,
        royaltyPercentage,
        expectedLaunchDate,
        marketplaces: marketplaces || [],
        status: 'draft',
      });

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
        'bookName',
        'subtitle',
        'bookType',
        'targetAudience',
        'needFormatting',
        'needCopyright',
        'physicalCopies',
        'expectedLaunchDate',
        'marketplaces',
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

      // Check if user is the author
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });
      if (!author || book.authorId !== author.authorId) {
        throw new ApiError(403, 'Access denied');
      }

      // Upload to Cloudinary
      const url = await UploadService.uploadToCloudinary(
        req.file.path,
        'povital/covers'
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

      // Check if user is the author
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });
      if (!author || book.authorId !== author.authorId) {
        throw new ApiError(403, 'Access denied');
      }

      const files = req.files as Express.Multer.File[];
      const filePaths = files.map((file) => file.path);

      // Upload all files to Cloudinary
      const urls = await UploadService.uploadMultipleFiles(
        filePaths,
        'povital/books'
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

      // Check if user is the author
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });
      if (!author || book.authorId !== author.authorId) {
        throw new ApiError(403, 'Access denied');
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

  // Get pricing suggestions based on language and book type
  static getPricingSuggestions = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { language, bookType } = req.query;

      if (!language || !bookType) {
        throw new ApiError(400, 'Language and book type are required');
      }

      const pricingConfig = await PricingConfig.findOne({
        language,
        bookType,
      });

      if (!pricingConfig) {
        res.status(200).json({
          success: true,
          message: 'No pricing configuration found for this combination',
          data: { priceRange: null },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          language,
          bookType,
          priceRange: (pricingConfig as any).priceRange,
        },
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
