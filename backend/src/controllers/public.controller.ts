import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import Author from '../models/Author.model';
import Book from '../models/Book.model';
import User from '../models/User.model';
import Review from '../models/Review.model';

// ─── Public: Author Listing ───────────────────────────────────────────────────

export const getPublicAuthors = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const {
      page = 1,
      limit = 20,
      search,
      language,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Only active non-restricted authors who have published books
    const filter: any = { isRestricted: false };

    // Get all authors with published books
    const publishedAuthorIds = await Book.distinct('authorId', { status: 'published' });
    filter.authorId = { $in: publishedAuthorIds };

    // Search by author name (requires joining User)
    let userFilter: any = {};
    if (search) {
      const s = (search as string).toLowerCase();
      userFilter.$or = [
        { firstName: new RegExp(s, 'i') },
        { lastName: new RegExp(s, 'i') },
      ];
    }

    const [authors] = await Promise.all([
      Author.find(filter).sort({ totalEarnings: -1 }).skip(skip).limit(Number(limit)).lean(),
      Author.countDocuments(filter),
    ]);

    const userIds = authors.map((a) => a.userId);
    const users = await User.find({ userId: { $in: userIds }, ...userFilter })
      .select('userId firstName lastName')
      .lean();

    // Filter by user search match
    const matchedUserIds = new Set(users.map((u) => u.userId));
    const filteredAuthors = search
      ? authors.filter((a) => matchedUserIds.has(a.userId))
      : authors;

    // Get published books per author
    const authorIds = filteredAuthors.map((a) => a.authorId);
    const bookCounts = await Book.aggregate([
      { $match: { authorId: { $in: authorIds }, status: 'published' } },
      { $group: { _id: '$authorId', count: { $sum: 1 }, languages: { $addToSet: '$language' } } },
    ]);

    // Filter by language
    let result = filteredAuthors.map((author) => {
      const user = users.find((u) => u.userId === author.userId);
      const bookInfo = bookCounts.find((b) => b._id === author.authorId);
      return {
        authorId: author.authorId,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        profilePicture: author.profilePicture,
        location: [author.address?.city, author.address?.state].filter(Boolean).join(', '),
        booksPublished: bookInfo?.count || 0,
        languages: bookInfo?.languages || [],
        totalSoldUnits: author.totalSoldUnits || 0,
        totalEarnings: author.totalEarnings || 0,
      };
    });

    if (language) {
      result = result.filter((a) => a.languages.includes(language as string));
    }

    res.status(200).json({
      success: true,
      data: {
        authors: result,
        pagination: {
          total: result.length,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(result.length / Number(limit)),
        },
      },
    });
  }
);

// ─── Public: Author Detail ────────────────────────────────────────────────────

export const getPublicAuthorDetail = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { authorId } = req.params;

    const author = await Author.findOne({ authorId, isRestricted: false }).lean();
    if (!author) throw new ApiError(404, 'Author not found');

    const user = await User.findOne({ userId: author.userId })
      .select('firstName lastName')
      .lean();

    const books = await Book.find({ authorId, status: 'published' })
      .select('bookId bookName subtitle coverPage language bookType actualLaunchDate totalSellingUnits marketplaces royaltyPercentage')
      .lean();

    const reviews = await Review.find({ authorId, isVisible: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
        : 0;

    res.status(200).json({
      success: true,
      data: {
        author: {
          authorId,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          profilePicture: author.profilePicture,
          location: [author.address?.city, author.address?.state].filter(Boolean).join(', '),
          totalBooks: author.totalBooks,
          totalSoldUnits: author.totalSoldUnits,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
        },
        books,
        recentReviews: reviews,
      },
    });
  }
);

// ─── Public: Book Listing ─────────────────────────────────────────────────────

export const getPublicBooks = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const {
      page = 1,
      limit = 20,
      search,
      authorName,
      bookType,
      language,
      authorId,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = { status: 'published' };

    if (bookType) filter.bookType = bookType;
    if (language) filter.language = language;
    if (authorId) filter.authorId = authorId;
    if (search) {
      filter.$or = [
        { bookName: new RegExp(search as string, 'i') },
        { subtitle: new RegExp(search as string, 'i') },
      ];
    }

    // Author name search
    if (authorName) {
      const matchedUsers = await User.find({
        $or: [
          { firstName: new RegExp(authorName as string, 'i') },
          { lastName: new RegExp(authorName as string, 'i') },
        ],
      }).select('userId').lean();
      const userIds = matchedUsers.map((u) => u.userId);
      const matchedAuthors = await Author.find({ userId: { $in: userIds } }).select('authorId').lean();
      filter.authorId = { $in: matchedAuthors.map((a) => a.authorId) };
    }

    const [books, total] = await Promise.all([
      Book.find(filter)
        .select('bookId authorId bookName subtitle coverPage language bookType actualLaunchDate totalSellingUnits marketplaces platformWiseSales priceBreakdown')
        .sort({ actualLaunchDate: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Book.countDocuments(filter),
    ]);

    // Get author info
    const authorIds = books.map((b) => b.authorId);
    const authors = await Author.find({ authorId: { $in: authorIds } }).select('authorId userId').lean();
    const userIds2 = authors.map((a) => a.userId);
    const users = await User.find({ userId: { $in: userIds2 } }).select('userId firstName lastName').lean();

    const enriched = books.map((book) => {
      const author = authors.find((a) => a.authorId === book.authorId);
      const user = author ? users.find((u) => u.userId === author.userId) : null;
      return {
        bookId: book.bookId,
        bookName: book.bookName,
        subtitle: book.subtitle,
        coverPage: book.coverPage,
        language: book.language,
        bookType: book.bookType,
        actualLaunchDate: book.actualLaunchDate,
        totalSellingUnits: book.totalSellingUnits,
        marketplaces: book.marketplaces,
        sellingPrice: (book.priceBreakdown as any)?.finalAmount || 0,
        authorId: book.authorId,
        authorName: user ? `${user.firstName} ${user.lastName}`.trim() : '',
      };
    });

    res.status(200).json({
      success: true,
      data: {
        books: enriched,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      },
    });
  }
);

// ─── Public: Book Detail ──────────────────────────────────────────────────────

export const getPublicBookDetail = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { bookId } = req.params;

    const book = await Book.findOne({ bookId, status: 'published' }).lean();
    if (!book) throw new ApiError(404, 'Book not found');

    const author = await Author.findOne({ authorId: book.authorId }).lean();
    const user = author
      ? await User.findOne({ userId: author.userId }).select('firstName lastName').lean()
      : null;

    // Platform sales as object
    const platformSales: Record<string, any> = {};
    if (book.platformWiseSales && book.platformWiseSales instanceof Map) {
      book.platformWiseSales.forEach((v, k) => { platformSales[k] = v; });
    } else if (book.platformWiseSales) {
      Object.assign(platformSales, book.platformWiseSales);
    }

    res.status(200).json({
      success: true,
      data: {
        book: {
          bookId: book.bookId,
          bookName: book.bookName,
          subtitle: book.subtitle,
          coverPage: book.coverPage,
          language: book.language,
          bookType: book.bookType,
          targetAudience: book.targetAudience,
          actualLaunchDate: book.actualLaunchDate,
          totalSellingUnits: book.totalSellingUnits,
          marketplaces: book.marketplaces,
          platformWiseSales: platformSales,
          sellingPrice: (book.priceBreakdown as any)?.finalAmount || 0,
        },
        author: {
          authorId: book.authorId,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          profilePicture: author?.profilePicture,
          location: author ? [author.address?.city, author.address?.state].filter(Boolean).join(', ') : '',
        },
      },
    });
  }
);
