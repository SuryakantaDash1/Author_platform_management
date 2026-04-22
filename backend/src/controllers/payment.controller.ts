import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import Book from '../models/Book.model';
import Author from '../models/Author.model';
import User from '../models/User.model';
import Transaction from '../models/Transaction.model';
import { EmailService } from '../services/email.service';

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new ApiError(500, 'Razorpay credentials not configured');
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

export class PaymentController {
  // Create Razorpay order for a book payment (initial or installment)
  static createOrder = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookId } = req.body;
      if (!bookId) throw new ApiError(400, 'bookId is required');

      const userId = req.user?.userId;
      const author = await Author.findOne({ userId });
      if (!author) throw new ApiError(404, 'Author not found');

      const book = await Book.findOne({ bookId, authorId: author.authorId });
      if (!book) throw new ApiError(404, 'Book not found');

      // Determine amount for this payment
      const pendingAmount = book.paymentStatus.pendingAmount;
      if (pendingAmount <= 0) throw new ApiError(400, 'No pending amount for this book');

      // Calculate instalment amount based on payment plan
      let amountToPay = pendingAmount;
      const plan = book.paymentPlan;
      const totalAmount = book.paymentStatus.totalAmount;
      const alreadyPaid = book.paymentStatus.paidAmount;

      if (plan === '2_installments') {
        const each = Math.ceil(totalAmount / 2);
        amountToPay = Math.min(each, pendingAmount);
      } else if (plan === '3_installments') {
        // splits: 25, 50, 25
        const splits = [0.25, 0.50, 0.25];
        const paidCount = book.paymentStatus.installments.filter(i => i.status === 'paid').length;
        const splitIndex = Math.min(paidCount, splits.length - 1);
        amountToPay = Math.min(Math.ceil(totalAmount * splits[splitIndex]), pendingAmount);
      } else if (plan === '4_installments') {
        const each = Math.ceil(totalAmount / 4);
        amountToPay = Math.min(each, pendingAmount);
      }

      // Razorpay expects amount in paise (×100)
      const razorpay = getRazorpay();
      const order = await razorpay.orders.create({
        amount: Math.round(amountToPay * 100),
        currency: 'INR',
        receipt: `${bookId}_${Date.now()}`,
        notes: {
          bookId,
          authorId: author.authorId,
          paymentType: alreadyPaid > 0 ? 'installment' : 'initial',
        },
      });

      const user = await User.findOne({ userId: author.userId }).lean() as any;
      const authorName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : author.authorId;

      res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          amount: amountToPay,
          currency: 'INR',
          keyId: process.env.RAZORPAY_KEY_ID,
          bookId,
          bookName: book.bookName,
          authorName,
        },
      });
    }
  );

  // Verify Razorpay payment signature and update book
  static verifyPayment = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookId } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookId) {
        throw new ApiError(400, 'Missing payment verification fields');
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) throw new ApiError(500, 'Razorpay credentials not configured');

      // Verify signature
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        throw new ApiError(400, 'Payment signature verification failed');
      }

      const userId = req.user?.userId;
      const author = await Author.findOne({ userId });
      if (!author) throw new ApiError(404, 'Author not found');

      const book = await Book.findOne({ bookId, authorId: author.authorId });
      if (!book) throw new ApiError(404, 'Book not found');

      // Fetch payment details from Razorpay to get actual amount paid
      const razorpay = getRazorpay();
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      const paidAmountRupees = Number(payment.amount) / 100;

      // Update payment status
      book.paymentStatus.paidAmount += paidAmountRupees;
      book.paymentStatus.pendingAmount = Math.max(
        0,
        book.paymentStatus.totalAmount - book.paymentStatus.paidAmount
      );
      book.paymentStatus.paymentCompletionPercentage = Math.round(
        (book.paymentStatus.paidAmount / book.paymentStatus.totalAmount) * 100
      );

      // Add a new paid installment entry for this payment
      // (each Pay Now click = one installment record)
      book.paymentStatus.installments.push({
        amount: paidAmountRupees,
        status: 'paid',
        paidAt: new Date(),
      } as any);

      // Move book to pending approval if fully/partially paid
      if (book.status === 'payment_pending' || book.status === 'draft') {
        book.status = 'pending';
      }

      await book.save();

      // Send payment confirmation email
      const user = await User.findOne({ userId: author.userId }).select('firstName lastName email').lean() as any;
      if (user?.email) {
        const paidInstallments = book.paymentStatus.installments.filter((i: any) => i.status === 'paid').length;
        const totalInstallments = book.paymentPlan === 'full' ? 1
          : book.paymentPlan === '2_installments' ? 2
          : book.paymentPlan === '4_installments' ? 4
          : book.paymentPlan === '3_installments' ? 3
          : 1;

        EmailService.sendBookPaymentConfirmationEmail(
          user.email,
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Author',
          book.bookName,
          book.bookId,
          paidAmountRupees,
          book.paymentStatus.totalAmount,
          book.paymentStatus.pendingAmount,
          razorpay_payment_id,
          paidInstallments,
          totalInstallments
        );
      }

      // Log transaction
      await Transaction.create({
        authorId: author.authorId,
        bookId,
        type: 'book_payment',
        amount: paidAmountRupees,
        status: 'completed',
        transactionId: razorpay_payment_id,
        description: `Book payment for "${book.bookName}"`,
        createdBy: userId,
        metadata: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          bookId,
          paidAmount: book.paymentStatus.paidAmount,
          pendingAmount: book.paymentStatus.pendingAmount,
          paymentCompletionPercentage: book.paymentStatus.paymentCompletionPercentage,
          status: book.status,
        },
      });
    }
  );

  // Razorpay webhook (called by Razorpay directly — no auth)
  static webhook = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        res.status(200).json({ received: true });
        return;
      }

      const signature = req.headers['x-razorpay-signature'] as string;
      const body = JSON.stringify(req.body);

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        res.status(400).json({ error: 'Invalid webhook signature' });
        return;
      }

      const event = req.body;
      if (event.event === 'payment.captured') {
        const payment = event.payload?.payment?.entity;
        if (payment?.notes?.bookId) {
          const book = await Book.findOne({ bookId: payment.notes.bookId });
          if (book && book.status === 'payment_pending') {
            book.status = 'pending';
            await book.save();
          }
        }
      }

      res.status(200).json({ received: true });
    }
  );

  // Get pending payment requests for author dashboard
  static getPendingPaymentRequests = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user?.userId;
      const author = await Author.findOne({ userId });
      if (!author) throw new ApiError(404, 'Author not found');

      const books = await Book.find({
        authorId: author.authorId,
        $or: [
          { 'paymentRequests.status': 'pending' },
          { status: 'payment_pending' },
        ],
      }).select('bookId bookName paymentStatus paymentRequests paymentPlan status');

      const requests: any[] = [];

      for (const book of books) {
        // Overdue / payment_pending books
        if (book.status === 'payment_pending') {
          requests.push({
            type: 'installment',
            bookId: book.bookId,
            bookName: book.bookName,
            amount: book.paymentStatus.pendingAmount,
            dueDate: book.paymentStatus.dueDate,
            status: 'overdue',
          });
        }
        // Admin payment requests
        for (const pr of book.paymentRequests || []) {
          if (pr.status === 'pending') {
            requests.push({
              type: 'admin_request',
              bookId: book.bookId,
              bookName: book.bookName,
              amount: pr.amount,
              serviceType: pr.serviceType,
              description: pr.description,
              createdAt: pr.createdAt,
              status: 'pending',
            });
          }
        }
      }

      res.status(200).json({ success: true, data: { requests } });
    }
  );
}
