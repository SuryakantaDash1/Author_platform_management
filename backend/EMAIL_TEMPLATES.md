# 📧 Email Templates for POVITAL Platform

Professional email templates for authentication, notifications, and system communications.

---

## 1. OTP Verification Email

**File**: `src/templates/email/otp-verification.html`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account - POVITAL</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 3px solid #3b82f6;">
                            <h1 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 700;">
                                POVITAL
                            </h1>
                            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">
                                Author Platform Management
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">
                                Credential Details
                            </h2>

                            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Hello <strong>{{authorName}}</strong>,
                            </p>

                            <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Use this verification code to complete your {{action}}:
                            </p>

                            <!-- OTP Box -->
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
                                <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                                    Your Verification Code
                                </p>
                                <p style="margin: 0; color: #ffffff; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    {{otp}}
                                </p>
                            </div>

                            <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                                This code will expire in <strong style="color: #ef4444;">{{expiryMinutes}} minutes</strong>
                            </p>

                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 20px 0;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                    <strong>⚠️ Security Notice:</strong> Never share this code with anyone. POVITAL will never ask for your OTP via phone or email.
                                </p>
                            </div>

                            <p style="margin: 30px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                                If you didn't request this code, please ignore this email or contact our support team.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-align: center;">
                                Thank you,<br>
                                <strong>POVITAL Team</strong>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                © {{year}} POVITAL. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

**Variables**:
- `{{authorName}}` - Author's full name
- `{{otp}}` - 6-digit OTP code
- `{{action}}` - "signup" or "login"
- `{{expiryMinutes}}` - OTP expiry time (5 or 10 minutes)
- `{{year}}` - Current year

---

## 2. Welcome Email (After Registration)

**File**: `src/templates/email/welcome.html`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to POVITAL</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header with gradient -->
                    <tr>
                        <td style="padding: 0; background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%); border-radius: 8px 8px 0 0;">
                            <div style="padding: 40px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                                    Welcome to POVITAL!
                                </h1>
                                <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                                    Your journey as an author begins now
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                Hello {{authorName}},
                            </p>

                            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Congratulations! Your author account has been successfully created. We're excited to help you publish and manage your books across multiple platforms.
                            </p>

                            <!-- Account Details -->
                            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                    Your Account Details
                                </h3>
                                <table role="presentation" style="width: 100%;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Author ID:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">{{authorId}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">{{email}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Mobile:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">{{mobile}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Account Tier:</td>
                                        <td style="padding: 8px 0; color: #3b82f6; font-size: 14px; font-weight: 600; text-align: right; text-transform: uppercase;">{{tier}}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Features -->
                            <h3 style="margin: 30px 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                What you can do with your Free account:
                            </h3>
                            <ul style="margin: 0; padding: 0 0 0 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                                <li>Publish up to 3 books</li>
                                <li>Track sales across multiple platforms</li>
                                <li>View royalty reports</li>
                                <li>Access basic analytics</li>
                                <li>Get email support within 48 hours</li>
                            </ul>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="{{dashboardUrl}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                                    Go to Dashboard
                                </a>
                            </div>

                            <!-- Upgrade Notice -->
                            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 20px; margin: 24px 0;">
                                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 16px; font-weight: 600;">
                                    🚀 Want more features?
                                </p>
                                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                                    Upgrade to our Paid plan to publish unlimited books, get advanced analytics, API access, and pay only 2-3% platform fee instead of 5%.
                                </p>
                                <div style="margin: 12px 0 0 0;">
                                    <a href="{{pricingUrl}}" style="color: #92400e; font-size: 14px; font-weight: 600; text-decoration: underline;">
                                        View Pricing Plans →
                                    </a>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; text-align: center;">
                                Need help? Contact us at <a href="mailto:support@povital.com" style="color: #3b82f6; text-decoration: none;">support@povital.com</a>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                © {{year}} POVITAL. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

**Variables**:
- `{{authorName}}` - Author's full name
- `{{authorId}}` - Generated Author ID (e.g., AUT001)
- `{{email}}` - Author's email
- `{{mobile}}` - Author's mobile number
- `{{tier}}` - Account tier (FREE, BASIC, PRO, ENTERPRISE)
- `{{dashboardUrl}}` - URL to dashboard
- `{{pricingUrl}}` - URL to pricing page
- `{{year}}` - Current year

---

## 3. Admin-Created Author Credentials Email

**File**: `src/templates/email/admin-created-author.html`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your POVITAL Account Credentials</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 3px solid #3b82f6;">
                            <h1 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 700;">
                                POVITAL
                            </h1>
                            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">
                                Author Platform Management
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">
                                Credential Details
                            </h2>

                            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Hello <strong>{{authorName}}</strong>,
                            </p>

                            <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Your author account has been created by our admin team. Use this one-time password (OTP) to login to your account:
                            </p>

                            <!-- OTP Box -->
                            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
                                <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                                    Use this OTP to login your account
                                </p>
                                <p style="margin: 0; color: #ffffff; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    {{otp}}
                                </p>
                            </div>

                            <!-- Account Details Box -->
                            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                                    Your Account Information
                                </h3>
                                <table role="presentation" style="width: 100%;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Author ID:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; font-family: 'Courier New', monospace;">{{authorId}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Login Mobile:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">{{mobile}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Login Email:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">{{email}}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Login Instructions -->
                            <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 20px 0;">
                                <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 15px; font-weight: 600;">
                                    📌 How to Login:
                                </p>
                                <ol style="margin: 0; padding: 0 0 0 20px; color: #1e3a8a; font-size: 14px; line-height: 1.8;">
                                    <li>Visit <a href="{{loginUrl}}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">{{loginUrl}}</a></li>
                                    <li>Enter your mobile number or email</li>
                                    <li>Use the OTP above to login</li>
                                    <li>Complete your profile setup</li>
                                </ol>
                            </div>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="{{loginUrl}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                                    Login Now
                                </a>
                            </div>

                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 20px 0;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                    <strong>⚠️ Security Notice:</strong> This is a one-time login credential. After your first login, you'll need to verify via OTP for subsequent logins. Keep this information secure and never share it with anyone.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-align: center;">
                                Thank you,<br>
                                <strong>POVITAL Team</strong>
                            </p>
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-align: center;">
                                Need help? Contact <a href="mailto:support@povital.com" style="color: #3b82f6; text-decoration: none;">support@povital.com</a>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                © {{year}} POVITAL. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

**Variables**:
- `{{authorName}}` - Author's full name
- `{{authorId}}` - Generated Author ID
- `{{otp}}` - One-time password for first login
- `{{mobile}}` - Author's mobile number
- `{{email}}` - Author's email
- `{{loginUrl}}` - Login page URL
- `{{year}}` - Current year

---

## Email Service Configuration

### Using Nodemailer (Free SMTP)

```typescript
// src/config/email.ts
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // App password, not regular password
  }
});

// Or use SendGrid
export const transporter = nodemailer.createTransporter({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### Send OTP Email Function

```typescript
// src/services/email.service.ts
import fs from 'fs';
import path from 'path';
import { transporter } from '../config/email';

export const sendOTPEmail = async (
  email: string,
  name: string,
  otp: string,
  action: 'signup' | 'login'
) => {
  const template = fs.readFileSync(
    path.join(__dirname, '../templates/email/otp-verification.html'),
    'utf-8'
  );

  const html = template
    .replace(/\{\{authorName\}\}/g, name)
    .replace(/\{\{otp\}\}/g, otp)
    .replace(/\{\{action\}\}/g, action)
    .replace(/\{\{expiryMinutes\}\}/g, action === 'signup' ? '10' : '5')
    .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());

  await transporter.sendMail({
    from: `"POVITAL" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Your OTP for ${action === 'signup' ? 'Registration' : 'Login'} - POVITAL`,
    html
  });
};
```

---

**Document Version:** 1.0
**Last Updated:** 2025-03-12
**Maintained By:** POVITAL Development Team
