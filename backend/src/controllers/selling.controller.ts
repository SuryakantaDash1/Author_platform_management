import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import SellingRecord from '../models/SellingRecord.model';
import RoyaltyRecord from '../models/RoyaltyRecord.model';
import Book from '../models/Book.model';
import Author from '../models/Author.model';
import BankAccount from '../models/BankAccount.model';
import Transaction from '../models/Transaction.model';
import User from '../models/User.model';
import { UploadService } from '../services/upload.service';
import AuditLog from '../models/AuditLog.model';

// ─── helpers ─────────────────────────────────────────────────────────────────

function genId(prefix: string, count: number) {
  return `${prefix}${(count + 1).toString().padStart(8, '0')}`;
}

// ─── Admin: Submit / update selling data for a book ──────────────────────────

export const submitSellingData = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const adminUserId = req.user?.userId;
    if (!adminUserId) throw new ApiError(401, 'Unauthorized');

    const {
      bookId,
      month,
      year,
      platformSales,           // [{ platform, sellingUnits, sellingPricePerUnit }]
      costPerBook,
      adsCostPerUnit,
      platformFees,
      returnsExchangeAmount,
      outstandingAmount,
    } = req.body;

    if (!bookId || !month || !year || !Array.isArray(platformSales)) {
      throw new ApiError(400, 'bookId, month, year and platformSales are required');
    }

    const book = await Book.findOne({ bookId });
    if (!book) throw new ApiError(404, 'Book not found');
    if (book.status !== 'published') throw new ApiError(400, 'Book must be published to record selling data');

    // ── compute per-platform totals and aggregates ──
    let totalSellingUnits = 0;
    let totalRevenue = 0;

    const computedPlatformSales = (platformSales as any[]).map((ps) => {
      const units = Number(ps.sellingUnits) || 0;
      const price = Number(ps.sellingPricePerUnit) || 0;
      const rev = units * price;
      totalSellingUnits += units;
      totalRevenue += rev;
      return { platform: ps.platform, sellingUnits: units, sellingPricePerUnit: price, totalRevenue: rev };
    });

    // ── financial calculation (backend only) ──
    const costPer = Number(costPerBook) || 0;
    const adsPer  = Number(adsCostPerUnit) || 0;
    const fees    = Number(platformFees) || 0;
    const returns = Number(returnsExchangeAmount) || 0;
    const outstanding = Number(outstandingAmount) || 0;

    const productionCost = totalSellingUnits * costPer;
    const grossMargin    = totalRevenue - productionCost;
    const adsCost        = totalSellingUnits * adsPer;
    const netProfit      = grossMargin - adsCost - fees - returns - outstanding;
    const royaltyPct     = book.royaltyPercentage || 70;
    const authorRoyalty  = Math.max(0, netProfit * (royaltyPct / 100));

    // ── Always create a new SellingRecord (each submission is a separate entry) ──
    const count = await SellingRecord.countDocuments();
    const sellingRecord = await SellingRecord.create({
      sellingRecordId: genId('SLR', count),
      bookId,
      authorId: book.authorId,
      month: Number(month),
      year: Number(year),
      platformSales: computedPlatformSales,
      costPerBook: costPer,
      adsCostPerUnit: adsPer,
      platformFees: fees,
      returnsExchangeAmount: returns,
      outstandingAmount: outstanding,
      totalSellingUnits,
      totalRevenue,
      productionCost,
      grossMargin,
      adsCost,
      netProfit,
      authorRoyalty,
      royaltyPercentage: royaltyPct,
      createdBy: adminUserId,
    });

    // ── Always accumulate book totals ──
    book.totalSellingUnits += totalSellingUnits;
    book.totalRevenue += totalRevenue;
    for (const ps of computedPlatformSales) {
      const existing = (book.platformWiseSales.get(ps.platform) as any) || { sellingUnits: 0 };
      book.platformWiseSales.set(ps.platform, {
        sellingUnits: (existing.sellingUnits || 0) + ps.sellingUnits,
        productLink: existing.productLink,
        rating: existing.rating,
      });
    }
    await book.save();

    // ── Upsert RoyaltyRecord: accumulate if pending, create new if paid ──
    const existingRoyaltyRecord = await RoyaltyRecord.findOne({
      bookId,
      month: Number(month),
      year: Number(year),
      status: 'pending',   // only look for unpaid records to accumulate into
    });

    let royaltyRecord;
    if (existingRoyaltyRecord) {
      // Accumulate into existing pending record
      existingRoyaltyRecord.authorRoyalty += authorRoyalty;
      existingRoyaltyRecord.finalRoyalty = Math.max(
        0,
        existingRoyaltyRecord.authorRoyalty - existingRoyaltyRecord.referralDeduction - existingRoyaltyRecord.outstandingDeduction
      );
      await existingRoyaltyRecord.save();
      royaltyRecord = existingRoyaltyRecord;
    } else {
      // No pending record — create a new one (either first time, or all previous ones were paid)
      const rCount = await RoyaltyRecord.countDocuments();
      royaltyRecord = await RoyaltyRecord.create({
        royaltyRecordId: genId('RYR', rCount),
        authorId: book.authorId,
        bookId,
        sellingRecordId: sellingRecord.sellingRecordId,
        month: Number(month),
        year: Number(year),
        authorRoyalty,
        referralDeduction: 0,
        outstandingDeduction: 0,
        finalRoyalty: authorRoyalty,
        status: 'pending',
      });
    }

    // Audit log
    await AuditLog.create({
      userId: adminUserId,
      action: 'create',
      resource: 'SellingRecord',
      resourceId: sellingRecord.sellingRecordId,
      details: { bookId, month, year, totalRevenue, netProfit, authorRoyalty },
    });

    res.status(201).json({
      success: true,
      message: 'Selling data submitted successfully',
      data: {
        sellingRecord,
        royaltyRecord,
        financials: {
          totalSellingUnits,
          totalRevenue,
          productionCost,
          grossMargin,
          adsCost,
          platformFees: fees,
          returnsExchangeAmount: returns,
          outstandingAmount: outstanding,
          netProfit,
          royaltyPercentage: royaltyPct,
          authorRoyalty,
        },
      },
    });
  }
);

// ─── Admin: Get all selling records across all books ─────────────────────────

export const getAllSellingRecords = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { page = 1, limit = 20, bookId, search } = req.query;
    const filter: any = {};
    if (bookId) filter.bookId = bookId;

    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      SellingRecord.find(filter).sort({ year: -1, month: -1, createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      SellingRecord.countDocuments(filter),
    ]);

    // Enrich with book + author info
    const bookIds = [...new Set(records.map((r) => r.bookId))];
    const books = await Book.find({ bookId: { $in: bookIds } }).select('bookId bookName authorId').lean();
    const authorIds = [...new Set(books.map((b) => b.authorId))];
    const authors = await Author.find({ authorId: { $in: authorIds } }).select('authorId userId').lean();
    const userIds = authors.map((a) => a.userId);
    const users = await User.find({ userId: { $in: userIds } }).select('userId firstName lastName').lean();

    const bookMap = new Map(books.map((b) => [b.bookId, b]));
    const authorMap = new Map(authors.map((a) => [a.authorId, a]));
    const userMap = new Map(users.map((u) => [u.userId, u]));

    let enriched = records.map((r) => {
      const book = bookMap.get(r.bookId);
      const author = book ? authorMap.get((book as any).authorId) : null;
      const user = author ? userMap.get((author as any).userId) : null;
      return {
        ...r,
        bookName: (book as any)?.bookName || r.bookId,
        authorName: user ? `${(user as any).firstName} ${(user as any).lastName}`.trim() : (book as any)?.authorId || '',
      };
    });

    if (search) {
      const s = (search as string).toLowerCase();
      enriched = enriched.filter(
        (r: any) =>
          r.bookId.toLowerCase().includes(s) ||
          r.bookName.toLowerCase().includes(s) ||
          r.authorName.toLowerCase().includes(s)
      );
    }

    res.status(200).json({
      success: true,
      data: {
        records: enriched,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      },
    });
  }
);

// ─── Admin: Get selling history for a book ───────────────────────────────────

export const getSellingHistory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { bookId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const book = await Book.findOne({ bookId });
    if (!book) throw new ApiError(404, 'Book not found');

    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      SellingRecord.find({ bookId }).sort({ year: -1, month: -1 }).skip(skip).limit(Number(limit)),
      SellingRecord.countDocuments({ bookId }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        book: { bookId: book.bookId, bookName: book.bookName, authorId: book.authorId, royaltyPercentage: book.royaltyPercentage },
        records,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      },
    });
  }
);

// ─── Admin: Release royalty payment ──────────────────────────────────────────

export const releaseRoyaltyPayment = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const adminUserId = req.user?.userId;
    if (!adminUserId) throw new ApiError(401, 'Unauthorized');

    const {
      royaltyRecordId,
      bankAccountId,
      paymentMode,
      transactionReference,
      referralDeduction,
      outstandingDeduction,
    } = req.body;

    if (!royaltyRecordId || !bankAccountId || !paymentMode) {
      throw new ApiError(400, 'royaltyRecordId, bankAccountId and paymentMode are required');
    }

    const royaltyRecord = await RoyaltyRecord.findOne({ royaltyRecordId });
    if (!royaltyRecord) throw new ApiError(404, 'Royalty record not found');
    if (royaltyRecord.status === 'paid') throw new ApiError(400, 'Royalty already paid');

    // bankAccountId is the MongoDB _id string sent from the frontend
    const bankAccount = await BankAccount.findOne({ _id: bankAccountId, authorId: royaltyRecord.authorId });
    if (!bankAccount) throw new ApiError(404, 'Bank account not found');

    // Handle payment proof file upload
    let paymentProofUrl: string | undefined;
    if (req.file) {
      paymentProofUrl = await UploadService.uploadToCloudinary(req.file.path, 'povital/royalties/payment-proofs');
    }

    // Calculate final royalty
    const refDed = Number(referralDeduction) || royaltyRecord.referralDeduction || 0;
    const outDed = Number(outstandingDeduction) || royaltyRecord.outstandingDeduction || 0;
    const finalRoyalty = Math.max(0, royaltyRecord.authorRoyalty - refDed - outDed);

    // Create transaction
    const txCount = await Transaction.countDocuments();
    const transactionId = genId('TXN', txCount);

    await Transaction.create({
      transactionId,
      authorId: royaltyRecord.authorId,
      bookId: royaltyRecord.bookId,
      type: 'royalty_payment',
      amount: finalRoyalty,
      status: 'completed',
      description: `Royalty payment for ${royaltyRecord.bookId} — ${getMonthName(royaltyRecord.month)} ${royaltyRecord.year}`,
      paymentMethod: 'bank_transfer',
      bankAccountId,
      paymentProof: paymentProofUrl,
      paymentDate: new Date(),
      metadata: {
        royaltyRecordId,
        sellingRecordId: royaltyRecord.sellingRecordId,
        month: royaltyRecord.month,
        year: royaltyRecord.year,
        authorRoyalty: royaltyRecord.authorRoyalty,
        referralDeduction: refDed,
        outstandingDeduction: outDed,
      },
      createdBy: adminUserId,
    });

    // Update royalty record
    royaltyRecord.status = 'paid';
    royaltyRecord.bankAccountId = bankAccountId;
    royaltyRecord.paymentProof = paymentProofUrl;
    royaltyRecord.paymentMode = paymentMode;
    royaltyRecord.transactionReference = transactionReference;
    royaltyRecord.paymentDate = new Date();
    royaltyRecord.paidBy = adminUserId;
    royaltyRecord.transactionId = transactionId;
    royaltyRecord.referralDeduction = refDed;
    royaltyRecord.outstandingDeduction = outDed;
    royaltyRecord.finalRoyalty = finalRoyalty;
    await royaltyRecord.save();

    // Update author total earnings
    const author = await Author.findOne({ authorId: royaltyRecord.authorId });
    if (author) {
      author.totalEarnings += finalRoyalty;
      await author.save();
    }

    // Audit log
    await AuditLog.create({
      userId: adminUserId,
      action: 'payment',
      resource: 'RoyaltyRecord',
      resourceId: royaltyRecordId,
      details: { authorId: royaltyRecord.authorId, bookId: royaltyRecord.bookId, finalRoyalty, transactionId },
    });

    res.status(200).json({
      success: true,
      message: 'Royalty payment released successfully',
      data: { royaltyRecord, transactionId },
    });
  }
);

// ─── Admin: Get royalty listing (all authors) ────────────────────────────────

export const getAdminRoyaltyListing = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { page = 1, limit = 20, search, status, authorId, fromDate, toDate } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (authorId) filter.authorId = authorId;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate as string);
      if (toDate) filter.createdAt.$lte = new Date(toDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Aggregate by author to get summary per author
    const authorSummary = await RoyaltyRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$authorId',
          totalRoyalty: { $sum: '$finalRoyalty' },
          totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$finalRoyalty', 0] } },
          totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$finalRoyalty', 0] } },
          lastPaymentDate: { $max: '$paymentDate' },
          lastRoyaltyAmount: { $last: '$finalRoyalty' },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          paidCount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
        },
      },
      { $sort: { totalRoyalty: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    const total = (await RoyaltyRecord.distinct('authorId', filter)).length;

    // Enrich with author + user info
    const authorIds = authorSummary.map((a) => a._id);
    const [authors, books] = await Promise.all([
      Author.find({ authorId: { $in: authorIds } }).select('authorId userId totalBooks totalSoldUnits address').lean(),
      Book.find({ authorId: { $in: authorIds }, status: 'published' }).select('authorId totalSellingUnits').lean(),
    ]);

    const userIds = authors.map((a) => a.userId);
    const users = await User.find({ userId: { $in: userIds } }).select('userId firstName lastName').lean();

    // Search filter on names
    let result = authorSummary.map((summary) => {
      const author = authors.find((a) => a.authorId === summary._id);
      const user = author ? users.find((u) => u.userId === author.userId) : null;
      const authorBooks = books.filter((b) => b.authorId === summary._id);
      const totalBookUnits = authorBooks.reduce((s, b) => s + (b.totalSellingUnits || 0), 0);
      return {
        authorId: summary._id,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        location: author ? [author.address?.city, author.address?.state].filter(Boolean).join(', ') : '',
        totalBooks: author?.totalBooks || 0,
        totalBookUnits,
        lastRoyalty: summary.lastRoyaltyAmount || 0,
        lastPaymentDate: summary.lastPaymentDate || null,
        netRoyalty: summary.totalRoyalty || 0,
        totalPaid: summary.totalPaid || 0,
        totalPending: summary.totalPending || 0,
        pendingCount: summary.pendingCount,
        paidCount: summary.paidCount,
      };
    });

    if (search) {
      const s = (search as string).toLowerCase();
      result = result.filter(
        (r) =>
          r.authorId.toLowerCase().includes(s) ||
          `${r.firstName} ${r.lastName}`.toLowerCase().includes(s)
      );
    }

    res.status(200).json({
      success: true,
      data: {
        authors: result,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      },
    });
  }
);

// ─── Admin: Per-author royalty detail ────────────────────────────────────────

export const getAuthorRoyaltyDetail = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { authorId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const author = await Author.findOne({ authorId });
    if (!author) throw new ApiError(404, 'Author not found');

    const user = await User.findOne({ userId: author.userId }).select('firstName lastName email').lean();
    const skip = (Number(page) - 1) * Number(limit);

    const [records, total] = await Promise.all([
      RoyaltyRecord.find({ authorId })
        .sort({ year: -1, month: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      RoyaltyRecord.countDocuments({ authorId }),
    ]);

    // Enrich with book info
    const bookIds = [...new Set(records.map((r) => r.bookId))];
    const books = await Book.find({ bookId: { $in: bookIds } }).select('bookId bookName').lean();

    const enriched = records.map((r) => {
      const book = books.find((b) => b.bookId === r.bookId);
      return { ...r, bookName: book?.bookName || r.bookId };
    });

    res.status(200).json({
      success: true,
      data: {
        author: {
          authorId,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          totalEarnings: author.totalEarnings,
          totalBooks: author.totalBooks,
        },
        records: enriched,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      },
    });
  }
);

// ─── Author: Get my royalty monthly list ────────────────────────────────────

export const getMyRoyalties = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) throw new ApiError(401, 'Unauthorized');

    const author = await Author.findOne({ userId });
    if (!author) throw new ApiError(404, 'Author not found');

    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Group by month+year across all books
    const monthlyGroups = await RoyaltyRecord.aggregate([
      { $match: { authorId: author.authorId } },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          totalFinalRoyalty: { $sum: '$finalRoyalty' },
          totalSellingUnits: { $sum: 0 },
          status: { $first: '$status' },
          paymentDate: { $first: '$paymentDate' },
          records: { $push: '$$ROOT' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    // Aggregate selling units per month (sum all records for each month)
    const monthYearPairs = monthlyGroups.map((g) => ({ month: g._id.month, year: g._id.year }));
    const [sellingUnitsByMonth, totalResult, totalSoldUnitsAgg] = await Promise.all([
      SellingRecord.aggregate([
        {
          $match: {
            authorId: author.authorId,
            ...(monthYearPairs.length > 0
              ? { $or: monthYearPairs.map((p) => ({ month: p.month, year: p.year })) }
              : { month: -1 }),
          },
        },
        { $group: { _id: { month: '$month', year: '$year' }, totalUnits: { $sum: '$totalSellingUnits' } } },
      ]),
      RoyaltyRecord.aggregate([
        { $match: { authorId: author.authorId } },
        { $group: { _id: { month: '$month', year: '$year' } } },
        { $count: 'total' },
      ]),
      // Aggregate total selling units from Books (source of truth)
      Book.aggregate([
        { $match: { authorId: author.authorId } },
        { $group: { _id: null, total: { $sum: '$totalSellingUnits' } } },
      ]),
    ]);

    const unitsByMonthMap = new Map(
      sellingUnitsByMonth.map((s: any) => [`${s._id.year}-${s._id.month}`, s.totalUnits])
    );

    const enriched = monthlyGroups.map((g) => ({
      month: g._id.month,
      year: g._id.year,
      sellingUnits: unitsByMonthMap.get(`${g._id.year}-${g._id.month}`) || 0,
      netRoyalty: g.totalFinalRoyalty,
      paymentDate: g.paymentDate,
      status: g.records.some((r: any) => r.status === 'pending') ? 'pending' : 'paid',
      recordCount: g.records.length,
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEarnings: author.totalEarnings,
          totalSoldUnits: totalSoldUnitsAgg[0]?.total || 0,
        },
        months: enriched,
        pagination: {
          total: totalResult[0]?.total || 0,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil((totalResult[0]?.total || 0) / Number(limit)),
        },
      },
    });
  }
);

// ─── Author: Get royalty detail for a specific month ─────────────────────────

export const getMyRoyaltyMonthDetail = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) throw new ApiError(401, 'Unauthorized');

    const author = await Author.findOne({ userId });
    if (!author) throw new ApiError(404, 'Author not found');

    const { month, year } = req.params;

    const royaltyRecords = await RoyaltyRecord.find({
      authorId: author.authorId,
      month: Number(month),
      year: Number(year),
    }).lean();

    if (royaltyRecords.length === 0) throw new ApiError(404, 'No royalty data found for this period');

    // Get selling records + books
    const bookIds = royaltyRecords.map((r) => r.bookId);
    const [sellingRecords, books] = await Promise.all([
      SellingRecord.find({ authorId: author.authorId, month: Number(month), year: Number(year) }).lean(),
      Book.find({ bookId: { $in: bookIds } }).select('bookId bookName subtitle coverPage actualLaunchDate').lean(),
    ]);

    const perBook = royaltyRecords.map((rr) => {
      const book = books.find((b) => b.bookId === rr.bookId);
      const sr = sellingRecords.find((s) => s.bookId === rr.bookId);
      return {
        bookId: rr.bookId,
        bookName: book?.bookName || rr.bookId,
        subtitle: book?.subtitle,
        coverPage: book?.coverPage,
        publishedDate: book?.actualLaunchDate,
        netSellingUnits: sr?.totalSellingUnits || 0,
        totalRevenue: sr?.totalRevenue || 0,
        netProfit: sr?.netProfit || 0,
        authorRoyalty: rr.authorRoyalty,
        finalRoyalty: rr.finalRoyalty,
        status: rr.status,
        paymentDate: rr.paymentDate,
        paymentMode: rr.paymentMode,
        transactionReference: rr.transactionReference,
        paymentProof: rr.paymentProof,
        platformSales: sr?.platformSales || [],
      };
    });

    const totals = {
      month: Number(month),
      year: Number(year),
      totalNetRoyalty: royaltyRecords.reduce((s, r) => s + r.finalRoyalty, 0),
      totalSellingUnits: sellingRecords.reduce((s, r) => s + r.totalSellingUnits, 0),
      status: royaltyRecords.some((r) => r.status === 'pending') ? 'pending' : 'paid',
      paymentDate: royaltyRecords.find((r) => r.status === 'paid')?.paymentDate,
      paymentMode: royaltyRecords.find((r) => r.status === 'paid')?.paymentMode,
      transactionReference: royaltyRecords.find((r) => r.status === 'paid')?.transactionReference,
      paymentProof: royaltyRecords.find((r) => r.status === 'paid')?.paymentProof,
    };

    res.status(200).json({
      success: true,
      data: { totals, books: perBook },
    });
  }
);

// ─── Admin: Get all royalty records with book detail (for book-level view) ───

export const getBookRoyaltyRecords = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { bookId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const book = await Book.findOne({ bookId });
    if (!book) throw new ApiError(404, 'Book not found');

    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      RoyaltyRecord.find({ bookId }).sort({ year: -1, month: -1 }).skip(skip).limit(Number(limit)).lean(),
      RoyaltyRecord.countDocuments({ bookId }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        book: { bookId: book.bookId, bookName: book.bookName, authorId: book.authorId },
        records,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      },
    });
  }
);

// ─── Admin: preview calculation without saving ───────────────────────────────

export const previewFinancials = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const {
      bookId,
      platformSales,
      costPerBook,
      adsCostPerUnit,
      platformFees,
      returnsExchangeAmount,
      outstandingAmount,
    } = req.body;

    if (!bookId || !Array.isArray(platformSales)) {
      throw new ApiError(400, 'bookId and platformSales are required');
    }

    const book = await Book.findOne({ bookId });
    if (!book) throw new ApiError(404, 'Book not found');

    let totalSellingUnits = 0;
    let totalRevenue = 0;

    const computed = (platformSales as any[]).map((ps) => {
      const units = Number(ps.sellingUnits) || 0;
      const price = Number(ps.sellingPricePerUnit) || 0;
      const rev = units * price;
      totalSellingUnits += units;
      totalRevenue += rev;
      return { platform: ps.platform, sellingUnits: units, sellingPricePerUnit: price, totalRevenue: rev };
    });

    const costPer = Number(costPerBook) || 0;
    const adsPer  = Number(adsCostPerUnit) || 0;
    const fees    = Number(platformFees) || 0;
    const returns = Number(returnsExchangeAmount) || 0;
    const outstanding = Number(outstandingAmount) || 0;

    const productionCost = totalSellingUnits * costPer;
    const grossMargin    = totalRevenue - productionCost;
    const adsCost        = totalSellingUnits * adsPer;
    const netProfit      = grossMargin - adsCost - fees - returns - outstanding;
    const royaltyPct     = book.royaltyPercentage || 70;
    const authorRoyalty  = Math.max(0, netProfit * (royaltyPct / 100));

    res.status(200).json({
      success: true,
      data: {
        platformBreakdown: computed,
        financials: {
          totalSellingUnits,
          totalRevenue,
          productionCost,
          grossMargin,
          adsCost,
          platformFees: fees,
          returnsExchangeAmount: returns,
          outstandingAmount: outstanding,
          netProfit,
          royaltyPercentage: royaltyPct,
          authorRoyalty,
        },
      },
    });
  }
);

// ─── helper ──────────────────────────────────────────────────────────────────

function getMonthName(month: number): string {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month - 1] || month.toString();
}
