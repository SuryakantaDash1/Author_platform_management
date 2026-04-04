import cron from 'node-cron';
import Book from '../models/Book.model';
import Author from '../models/Author.model';
import User from '../models/User.model';
import { EmailService } from './email.service';

export class CronService {
  /**
   * Initialize all cron jobs
   */
  static init() {
    // Run daily at 9:00 AM IST (3:30 AM UTC)
    cron.schedule('30 3 * * *', async () => {
      console.log('⏰ [CRON] Running daily payment reminder check...');
      await CronService.checkPayLaterReminders();
    });

    // Also run on server start (after a 30s delay to let DB connect)
    setTimeout(() => {
      console.log('⏰ [CRON] Initial payment reminder check on startup...');
      CronService.checkPayLaterReminders().catch(err =>
        console.error('⏰ [CRON] Startup check failed:', err)
      );
    }, 30000);

    console.log('⏰ [CRON] Payment reminder cron job scheduled (daily at 9:00 AM IST)');
  }

  /**
   * Check all pay_later books and send reminders at:
   * - 3 days before due date
   * - 1 day before due date
   * - On due date
   * - After due date: mark as overdue
   */
  static async checkPayLaterReminders() {
    try {
      const books = await Book.find({
        paymentPlan: 'pay_later',
        'paymentStatus.pendingAmount': { $gt: 0 },
        'paymentStatus.dueDate': { $exists: true, $ne: null },
      }).lean();

      if (books.length === 0) {
        console.log('⏰ [CRON] No pay_later books with pending payments found.');
        return;
      }

      console.log(`⏰ [CRON] Found ${books.length} pay_later book(s) to check.`);

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      for (const book of books) {
        try {
          const dueDate = new Date(book.paymentStatus.dueDate!);
          const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
          const diffMs = dueDay.getTime() - startOfToday.getTime();
          const daysUntilDue = Math.round(diffMs / (1000 * 60 * 60 * 24));

          // Get author + user info for email
          const author = await Author.findOne({ authorId: book.authorId }).lean();
          if (!author) continue;

          const user = await User.findOne({ userId: author.userId }).lean();
          if (!user?.email) continue;

          const amount = book.paymentStatus.pendingAmount || book.paymentStatus.totalAmount || 0;
          const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;
          const formattedDueDate = dueDate.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
          });

          if (daysUntilDue === 3) {
            // 3 days before
            console.log(`⏰ [CRON] Sending 3-day reminder for book ${book.bookId} to ${user.email}`);
            await CronService.sendPaymentReminder(
              user.email,
              user.firstName,
              book.bookId,
              book.bookName,
              formattedAmount,
              formattedDueDate,
              '3 days'
            );
          } else if (daysUntilDue === 1) {
            // 1 day before
            console.log(`⏰ [CRON] Sending 1-day reminder for book ${book.bookId} to ${user.email}`);
            await CronService.sendPaymentReminder(
              user.email,
              user.firstName,
              book.bookId,
              book.bookName,
              formattedAmount,
              formattedDueDate,
              '1 day'
            );
          } else if (daysUntilDue === 0) {
            // Due today
            console.log(`⏰ [CRON] Sending due-today reminder for book ${book.bookId} to ${user.email}`);
            await CronService.sendPaymentReminder(
              user.email,
              user.firstName,
              book.bookId,
              book.bookName,
              formattedAmount,
              formattedDueDate,
              'today'
            );
          } else if (daysUntilDue < 0) {
            // Overdue — pause publishing
            console.log(`⏰ [CRON] Book ${book.bookId} is OVERDUE by ${Math.abs(daysUntilDue)} day(s). Setting to payment_pending.`);

            await Book.updateOne(
              { bookId: book.bookId },
              {
                $set: {
                  status: 'payment_pending',
                  'paymentStatus.installments.$[elem].status': 'overdue',
                },
              },
              { arrayFilters: [{ 'elem.status': 'pending' }] }
            );

            await CronService.sendOverdueNotification(
              user.email,
              user.firstName,
              book.bookId,
              book.bookName,
              formattedAmount,
              formattedDueDate
            );
          }
        } catch (bookErr) {
          console.error(`⏰ [CRON] Error processing book ${book.bookId}:`, bookErr);
        }
      }

      console.log('⏰ [CRON] Payment reminder check completed.');
    } catch (err) {
      console.error('⏰ [CRON] Error in checkPayLaterReminders:', err);
    }
  }

  /**
   * Send payment reminder email
   */
  private static async sendPaymentReminder(
    email: string,
    name: string,
    bookId: string,
    bookName: string,
    amount: string,
    dueDate: string,
    timeLeft: string
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const isUrgent = timeLeft === 'today' || timeLeft === '1 day';

    const subject = timeLeft === 'today'
      ? `Payment Due Today — "${bookName}" | POVITAL`
      : `Payment Reminder — "${bookName}" due in ${timeLeft} | POVITAL`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="text-align:center;margin-bottom:20px">
          <h2 style="color:#4F46E5;margin:0">POVITAL</h2>
        </div>

        <h3 style="color:#1F2937">Dear ${name},</h3>

        <p style="color:#4B5563;line-height:1.6">
          This is a ${isUrgent ? '<strong>urgent</strong>' : 'friendly'} reminder that your payment for the book
          <strong>"${bookName}"</strong> (${bookId}) is due ${timeLeft === 'today' ? '<strong>today</strong>' : `in <strong>${timeLeft}</strong>`}.
        </p>

        <div style="background:${isUrgent ? '#FEF2F2' : '#F0F9FF'};border:1px solid ${isUrgent ? '#FECACA' : '#BAE6FD'};border-radius:12px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:8px 0;color:#6B7280;font-size:14px">Book ID</td>
              <td style="padding:8px 0;color:#1F2937;font-weight:600;text-align:right;font-size:14px">${bookId}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6B7280;font-size:14px">Amount Due</td>
              <td style="padding:8px 0;color:${isUrgent ? '#DC2626' : '#1F2937'};font-weight:700;text-align:right;font-size:18px">${amount}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6B7280;font-size:14px">Due Date</td>
              <td style="padding:8px 0;color:#1F2937;font-weight:600;text-align:right;font-size:14px">${dueDate}</td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;margin:24px 0">
          <a href="${frontendUrl}/author/books"
             style="display:inline-block;background:#4F46E5;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            Pay Now
          </a>
        </div>

        ${isUrgent ? `
        <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:8px;padding:12px 16px;margin:16px 0">
          <p style="color:#92400E;font-size:13px;margin:0">
            <strong>Important:</strong> If payment is not received by the due date, your book publishing will be paused until the payment is completed.
          </p>
        </div>
        ` : ''}

        <p style="color:#9CA3AF;font-size:12px;margin-top:24px">
          This is an automated reminder from POVITAL. If you have already made the payment, please ignore this email.
        </p>
      </div>
    `;

    await EmailService.sendRawEmail(email, subject, html);
  }

  /**
   * Send overdue notification
   */
  private static async sendOverdueNotification(
    email: string,
    name: string,
    bookId: string,
    bookName: string,
    amount: string,
    dueDate: string
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="text-align:center;margin-bottom:20px">
          <h2 style="color:#4F46E5;margin:0">POVITAL</h2>
        </div>

        <h3 style="color:#DC2626">Payment Overdue — Action Required</h3>

        <p style="color:#4B5563;line-height:1.6">
          Dear ${name}, the payment for your book <strong>"${bookName}"</strong> (${bookId}) was due on
          <strong>${dueDate}</strong> and has not been received.
        </p>

        <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:20px;margin:20px 0">
          <p style="color:#991B1B;font-weight:600;margin:0 0 8px 0">Publishing Paused</p>
          <p style="color:#7F1D1D;font-size:14px;margin:0">
            Your book's publishing process has been paused. To resume, please complete the pending payment of <strong>${amount}</strong>.
          </p>
        </div>

        <div style="text-align:center;margin:24px 0">
          <a href="${frontendUrl}/author/books"
             style="display:inline-block;background:#DC2626;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            Pay Now to Resume
          </a>
        </div>

        <p style="color:#6B7280;font-size:13px">
          If you need help or want to request an extension, please contact our support team.
        </p>
      </div>
    `;

    await EmailService.sendRawEmail(email, `Payment Overdue — "${bookName}" Publishing Paused | POVITAL`, html);
  }
}
