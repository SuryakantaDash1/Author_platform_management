import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import Review from '../models/Review.model';
import Author from '../models/Author.model';

export class ReviewController {
  // Author submits a review
  static submitReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { rating, reviewText, attachment } = req.body;

      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      if (!rating || !reviewText) {
        throw new ApiError(400, 'Rating and review text are required');
      }

      if (rating < 1 || rating > 5) {
        throw new ApiError(400, 'Rating must be between 1 and 5');
      }

      if (reviewText.length > 1000) {
        throw new ApiError(400, 'Review text must be at most 1000 characters');
      }

      const author = await Author.findOne({ userId });
      if (!author) {
        throw new ApiError(404, 'Author profile not found');
      }

      // Generate unique review ID
      const reviewCount = await Review.countDocuments();
      const reviewId = `REV${(reviewCount + 1).toString().padStart(5, '0')}`;

      const review = await Review.create({
        reviewId,
        authorId: author.authorId,
        userId,
        rating,
        reviewText,
        attachment: attachment || undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: { review },
      });
    }
  );

  // Author gets own review
  static getMyReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) throw new ApiError(401, 'Unauthorized');

      const review = await Review.findOne({ userId }).lean();
      res.status(200).json({ success: true, data: { review: review || null } });
    }
  );

  // Author updates own review
  static updateReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const { rating, reviewText, attachment } = req.body;

      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const review = await Review.findOne({ reviewId: id });
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      // Ensure the author owns this review
      if (review.userId !== userId) {
        throw new ApiError(403, 'You can only edit your own reviews');
      }

      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          throw new ApiError(400, 'Rating must be between 1 and 5');
        }
        review.rating = rating;
      }

      if (reviewText !== undefined) {
        if (reviewText.length > 1000) {
          throw new ApiError(400, 'Review text must be at most 1000 characters');
        }
        review.reviewText = reviewText;
      }

      if (attachment !== undefined) {
        review.attachment = attachment || undefined;
      }

      await review.save();

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: { review },
      });
    }
  );

  // Public: get all visible reviews
  static getPublicReviews = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filter: any = { isVisible: true };

      const skip = (Number(page) - 1) * Number(limit);
      const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

      const [reviews, total] = await Promise.all([
        Review.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
        Review.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          reviews,
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

  // Admin: get all reviews
  static adminGetAllReviews = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { page = 1, limit = 20, rating, search } = req.query;
      const filter: any = {};
      if (rating) filter.rating = Number(rating);
      if (search) filter.reviewText = { $regex: search, $options: 'i' };

      const skip = (Number(page) - 1) * Number(limit);
      const [reviews, total] = await Promise.all([
        Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
        Review.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          reviews,
          pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
        },
      });
    }
  );

  // Admin edits any review
  static adminEditReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const { rating, reviewText, attachment, isVisible } = req.body;

      const review = await Review.findOne({ reviewId: id });
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          throw new ApiError(400, 'Rating must be between 1 and 5');
        }
        review.rating = rating;
      }

      if (reviewText !== undefined) {
        if (reviewText.length > 1000) {
          throw new ApiError(400, 'Review text must be at most 1000 characters');
        }
        review.reviewText = reviewText;
      }

      if (attachment !== undefined) {
        review.attachment = attachment || undefined;
      }

      if (isVisible !== undefined) {
        review.isVisible = isVisible;
      }

      await review.save();

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: { review },
      });
    }
  );

  // Admin deletes a review
  static adminDeleteReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;

      const review = await Review.findOne({ reviewId: id });
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      await Review.deleteOne({ reviewId: id });

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
      });
    }
  );
}
