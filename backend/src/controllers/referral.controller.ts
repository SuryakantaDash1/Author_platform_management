import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import Referral from '../models/Referral.model';
import Author from '../models/Author.model';
import User from '../models/User.model';
import Transaction from '../models/Transaction.model';

export class ReferralController {
  // Get referral details for author
  static getReferralDetails = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      const author = await Author.findOne({ userId: userId });

      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      const [referrals, totalEarnings, pendingEarnings] = await Promise.all([
        Referral.find({ referrerId: author.authorId }).sort({ createdAt: -1 }),
        Referral.aggregate([
          { $match: { referrerId: author.authorId, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
        ]),
        Referral.aggregate([
          { $match: { referrerId: author.authorId, status: 'pending' } },
          { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
        ]),
      ]);

      // Get referred authors info + their user names
      const referredAuthorIds = referrals.map((r) => r.referredAuthorId);
      const referredAuthors = await Author.find({
        authorId: { $in: referredAuthorIds },
      }).select('authorId userId totalBooks totalEarnings createdAt').lean();

      const referredUserIds = referredAuthors.map((a) => a.userId);
      const referredUsers = await User.find({
        userId: { $in: referredUserIds },
      }).select('userId firstName lastName').lean();

      res.status(200).json({
        success: true,
        data: {
          referralCode: author.referralCode,
          totalReferrals: referrals.length,
          totalEarnings: totalEarnings[0]?.total || 0,
          pendingEarnings: pendingEarnings[0]?.total || 0,
          referrals: referrals.map((ref) => {
            const refAuthor = referredAuthors.find((a) => a.authorId === ref.referredAuthorId);
            const refUser = refAuthor
              ? referredUsers.find((u) => u.userId === refAuthor.userId)
              : null;
            return {
              ...ref.toObject(),
              referredAuthorDetails: refAuthor ? {
                authorId: refAuthor.authorId,
                firstName: refUser?.firstName || '',
                lastName: refUser?.lastName || '',
                totalBooks: refAuthor.totalBooks,
                totalEarnings: refAuthor.totalEarnings,
                createdAt: refAuthor.createdAt,
              } : null,
            };
          }),
        },
      });
    }
  );

  // Process referral commission (admin only)
  static processReferralCommission = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { referralId } = req.params;

      const referral = await Referral.findById(referralId);

      if (!referral) {
        throw new ApiError(404, 'Referral not found');
      }

      if (referral.status === 'completed') {
        throw new ApiError(400, 'Commission already processed');
      }

      // Get referrer author
      const referrer = await Author.findOne({
        authorId: referral.referrerId,
      });

      if (!referrer) {
        throw new ApiError(404, 'Referrer not found');
      }

      // Create transaction for commission payment
      const transactionCount = await Transaction.countDocuments();
      const transactionId = `TXN${(transactionCount + 1)
        .toString()
        .padStart(8, '0')}`;

      await Transaction.create({
        transactionId,
        authorId: referral.referrerId,
        type: 'referral_commission',
        amount: referral.commissionAmount,
        status: 'completed',
        description: `Referral commission for ${referral.referredAuthorId}`,
        completedAt: new Date(),
      });

      // Update referral status
      referral.status = 'completed';
      await referral.save();

      // Update referrer's total earnings
      referrer.totalEarnings += referral.commissionAmount;
      await referrer.save();

      res.status(200).json({
        success: true,
        message: 'Referral commission processed successfully',
        data: { referral },
      });
    }
  );

  // Get all referrals (admin only)
  static getAllReferrals = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 20,
        status,
        referrerId,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filter: any = {};

      if (status) {
        filter.status = status;
      }

      if (referrerId) {
        filter.referrerId = referrerId;
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

      const [referrals, total] = await Promise.all([
        Referral.find(filter).sort(sort).skip(skip).limit(Number(limit)),
        Referral.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          referrals,
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

  // Get referral statistics (admin only)
  static getReferralStats = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const [
        totalReferrals,
        activeReferrals,
        completedReferrals,
        totalCommissionPaid,
        totalCommissionPending,
        topReferrers,
      ] = await Promise.all([
        Referral.countDocuments(),
        Referral.countDocuments({ status: 'pending' }),
        Referral.countDocuments({ status: 'completed' }),
        Referral.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
        ]),
        Referral.aggregate([
          { $match: { status: 'pending' } },
          { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
        ]),
        Referral.aggregate([
          {
            $group: {
              _id: '$referrerId',
              count: { $sum: 1 },
              totalEarnings: { $sum: '$commissionAmount' },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

      // Get author details for top referrers
      const topReferrerIds = topReferrers.map((r) => r._id);
      await Author.find({
        authorId: { $in: topReferrerIds },
      }).select('authorId');

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalReferrals,
            activeReferrals,
            completedReferrals,
            totalCommissionPaid: totalCommissionPaid[0]?.total || 0,
            totalCommissionPending: totalCommissionPending[0]?.total || 0,
          },
          topReferrers: topReferrers.map((ref) => ({
            authorId: ref._id,
            referralCount: ref.count,
            totalEarnings: ref.totalEarnings,
          })),
        },
      });
    }
  );

  // Validate referral code (public endpoint for signup)
  static validateReferralCode = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { referralCode } = req.params;

      if (!referralCode) {
        throw new ApiError(400, 'Referral code is required');
      }

      const author = await Author.findOne({
        referralCode: referralCode.toUpperCase(),
      });

      if (!author) {
        res.status(200).json({
          success: true,
          valid: false,
          message: 'Invalid referral code',
        });
        return;
      }

      // Check if author is restricted
      if (author.isRestricted) {
        res.status(200).json({
          success: true,
          valid: false,
          message: 'Referral code is not active',
        });
        return;
      }

      res.status(200).json({
        success: true,
        valid: true,
        message: 'Valid referral code',
        data: {
          referrerId: author.authorId,
        },
      });
    }
  );

  // Update commission amount for a referral (admin only)
  static updateCommission = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { referralId } = req.params;
      const { commissionAmount } = req.body;

      if (commissionAmount === undefined || commissionAmount < 0) {
        throw new ApiError(400, 'Valid commission amount is required');
      }

      const referral = await Referral.findById(referralId);

      if (!referral) {
        throw new ApiError(404, 'Referral not found');
      }

      if (referral.status === 'completed') {
        throw new ApiError(400, 'Cannot update completed referral commission');
      }

      referral.commissionAmount = commissionAmount;
      await referral.save();

      res.status(200).json({
        success: true,
        message: 'Commission amount updated successfully',
        data: { referral },
      });
    }
  );
}
