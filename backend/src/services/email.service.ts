import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Load email template
  private static loadTemplate(templateName: string): string {
    const templatePath = path.join(__dirname, `../templates/email/${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf-8');
  }

  // Replace template variables
  private static replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  // Send OTP email
  static async sendOTPEmail(
    email: string,
    otp: string,
    type: 'signup' | 'login' | 'reset'
  ): Promise<void> {
    try {
      const subject = type === 'signup'
        ? 'Your OTP for Registration - POVITAL'
        : type === 'reset'
        ? 'Your OTP for Password Reset - POVITAL'
        : 'Your OTP for Login - POVITAL';

      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your OTP Code</h2>
            <p>Your OTP for ${type === 'signup' ? 'registration' : type === 'reset' ? 'password reset' : 'login'} is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #666;">This OTP will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} POVITAL. All rights reserved.</p>
          </div>
        `,
      });

      console.log(`✅ OTP email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to POVITAL - Your Author Account is Ready!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to POVITAL, ${name}! 🎉</h2>
            <p>Your author account has been successfully created.</p>
            <p>You can now start publishing your books and managing your content.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/author/dashboard" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            <p style="color: #666;">Thank you for choosing POVITAL!</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} POVITAL. All rights reserved.</p>
          </div>
        `,
      });

      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      // Don't throw error for welcome email
    }
  }

  // Send admin password reset email
  static async sendAdminPasswordResetEmail(
    email: string,
    name: string,
    resetLink: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your POVITAL Admin Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your admin password. Click the button below to reset it:</p>
            <div style="margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666;">This link will expire in 1 hour.</p>
            <p style="color: #666;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">Or copy and paste this URL into your browser:<br>
            <a href="${resetLink}" style="color: #4F46E5;">${resetLink}</a></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} POVITAL. All rights reserved.</p>
          </div>
        `,
      });

      console.log(`✅ Admin password reset email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending admin password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Send admin-created author credentials
  static async sendAdminCreatedAuthorEmail(
    email: string,
    name: string,
    authorId: string,
    password: string,
    referralCode: string
  ): Promise<void> {
    try {
      const template = this.loadTemplate('admin-created-author');

      const variables = {
        authorName: name,
        authorId,
        password,
        referralCode: referralCode || 'N/A',
        email,
        loginUrl: `${process.env.FRONTEND_URL}/author/login`,
        year: new Date().getFullYear().toString(),
      };

      const html = this.replaceVariables(template, variables);

      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your POVITAL Author Account Credentials',
        html,
      });

      console.log(`Admin-created author email sent to ${email}`);
    } catch (error) {
      console.error('Error sending admin-created author email:', error);
      throw new Error('Failed to send credentials email');
    }
  }

  // Send payment request email
  static async sendPaymentRequestEmail(
    email: string,
    name: string,
    bookName: string,
    amount: number,
    paymentLink: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: `Payment Request for "${bookName}" - POVITAL`,
        html: `
          <p>Dear ${name},</p>
          <p>Your book "${bookName}" has been processed. Please complete the payment of ₹${amount}.</p>
          <p><a href="${paymentLink}">Click here to pay</a></p>
          <p>Thank you,<br>POVITAL Team</p>
        `,
      });

      console.log(`Payment request email sent to ${email}`);
    } catch (error) {
      console.error('Error sending payment request email:', error);
    }
  }

  // Send royalty payment confirmation
  static async sendRoyaltyPaymentEmail(
    email: string,
    name: string,
    amount: number,
    transactionId: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: `Royalty Payment Processed - POVITAL`,
        html: `
          <p>Dear ${name},</p>
          <p>Your royalty payment of ₹${amount} has been processed successfully.</p>
          <p>Transaction ID: ${transactionId}</p>
          <p>Thank you,<br>POVITAL Team</p>
        `,
      });

      console.log(`Royalty payment email sent to ${email}`);
    } catch (error) {
      console.error('Error sending royalty payment email:', error);
    }
  }

  // Send raw HTML email (used by cron reminders)
  static async sendRawEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
    }
  }
}
