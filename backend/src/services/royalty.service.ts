import { calculateRoyalty } from '../utils/helpers';
import Book from '../models/Book.model';
import Transaction from '../models/Transaction.model';
import Author from '../models/Author.model';
import Referral from '../models/Referral.model';
import { generateUniqueId } from '../utils/helpers';
import logger from '../utils/logger';

export class RoyaltyService {
  // Calculate royalty for a book
  static async calculateBookRoyalty(
    bookId: string,
    platformWiseSales: any,
    expenses: {
      adsCost: number;
      platformFees: number;
      returnsExchanges: number;
    }
  ) {
    const book = await Book.findOne({ bookId });
    if (!book) {
      throw new Error('Book not found');
    }

    const royaltyData = calculateRoyalty(
      platformWiseSales,
      expenses,
      book.royaltyPercentage
    );

    return {
      bookId,
      bookName: book.bookName,
      authorId: book.authorId,
      ...royaltyData,
    };
  }

  // Process royalty payment
  static async processRoyaltyPayment(
    authorId: string,
    bookId: string,
    amount: number,
    bankAccountId: string,
    paymentProof: string,
    adminId: string
  ) {
    // Get author and referral info
    const author = await Author.findOne({ authorId });
    if (!author) {
      throw new Error('Author not found');
    }

    // Calculate referral deduction if applicable
    let referralDeduction = 0;
    if (author.referredBy) {
      const referral = await Referral.findOne({
        referrerId: author.referredBy,
        referredAuthorId: authorId,
        isActive: true,
      });

      if (referral) {
        referralDeduction = (amount * referral.earningPercentage) / 100;

        // Update referral earnings
        referral.totalEarnings += referralDeduction;
        referral.availableBalance += referralDeduction;
        await referral.save();

        // Create referral earning transaction
        await Transaction.create({
          transactionId: generateUniqueId('TXN'),
          authorId: author.referredBy,
          type: 'referral_earning',
          amount: referralDeduction,
          description: `Referral earning from ${author.authorId}`,
          status: 'completed',
          createdBy: adminId,
        });
      }
    }

    // Final amount after referral deduction
    const finalAmount = amount - referralDeduction;

    // Create royalty payment transaction
    const transaction = await Transaction.create({
      transactionId: generateUniqueId('TXN'),
      authorId,
      bookId,
      type: 'royalty_payment',
      amount: finalAmount,
      description: `Royalty payment for book ${bookId}`,
      status: 'completed',
      bankAccountId,
      paymentProof,
      paymentDate: new Date(),
      metadata: {
        originalAmount: amount,
        referralDeduction,
      },
      createdBy: adminId,
    });

    // Update author total earnings
    author.totalEarnings += finalAmount;
    await author.save();

    logger.info(`Royalty payment processed for author ${authorId}: ₹${finalAmount}`);

    return transaction;
  }

  // Get author royalty summary
  static async getAuthorRoyaltySummary(authorId: string, startDate?: Date, endDate?: Date) {
    const matchStage: any = {
      authorId,
      type: 'royalty_payment',
      status: 'completed',
    };

    if (startDate || endDate) {
      matchStage.paymentDate = {};
      if (startDate) matchStage.paymentDate.$gte = startDate;
      if (endDate) matchStage.paymentDate.$lte = endDate;
    }

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRoyalty: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    return summary[0] || { totalRoyalty: 0, totalTransactions: 0 };
  }

  // Get book-wise royalty breakdown
  static async getBookWiseRoyalty(authorId: string) {
    const royalties = await Transaction.aggregate([
      {
        $match: {
          authorId,
          type: 'royalty_payment',
          status: 'completed',
          bookId: { $exists: true },
        },
      },
      {
        $group: {
          _id: '$bookId',
          totalRoyalty: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          lastPayment: { $max: '$paymentDate' },
        },
      },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: 'bookId',
          as: 'book',
        },
      },
      {
        $unwind: '$book',
      },
      {
        $project: {
          bookId: '$_id',
          bookName: '$book.bookName',
          totalRoyalty: 1,
          transactionCount: 1,
          lastPayment: 1,
        },
      },
      {
        $sort: { totalRoyalty: -1 },
      },
    ]);

    return royalties;
  }
}
