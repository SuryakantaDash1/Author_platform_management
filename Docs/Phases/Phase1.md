Here's everything from the BRD, formatted to copy directly:

---

# POVITAL — Business Requirements Document
**Phase 1 — Authentication & Author Management**
| | |
|---|---|
| Document Version | 1.0 |
| Phase | Phase 1 of N |
| Prepared By | Tek System |
| Status | Draft — For Review |

---

## 1. Introduction

POVITAL is a full-stack book publishing management platform developed by Tek System. It connects authors with a digital and offline distribution network, enabling end-to-end publishing from manuscript to marketplace — with full royalty transparency.

### 1.1 Purpose of this Document
This BRD defines the functional and technical requirements for Phase 1 of the POVITAL platform, covering:
- Author Registration, Login, and Profile Management
- Super Admin Authentication and Dashboard
- Admin-side Author Account Creation and Management

### 1.2 Scope — Phase 1
Phase 1 is scoped to identity, onboarding, and author profile management only. All book listing, royalty, payment, and analytics modules are out of scope for this phase and will be addressed in subsequent phases.

### 1.3 Roles

| Role | Description | Access Level |
|---|---|---|
| Author | Registered content creator on the platform | Own profile, books, royalties, support |
| Super Admin | Platform administrator (Tek System staff) | Full platform access |

---

## 2. Author Module

### 2.1 Author Registration
A new author can self-register through the public-facing website via the 'I'm Author' CTA.

#### 2.1.1 Registration Form Fields

| Field | Type | Required | Validation / Notes |
|---|---|---|---|
| First Name | Text | Yes | Alphabets only, no special characters |
| Last Name | Text | Yes | Alphabets only, no special characters |
| Mobile Number | Number | Yes | Exactly 10 digits, numeric only |
| Email ID | Email | Yes | Valid email format, must be unique |
| Password | Password | Yes | See password rules below |
| Referral Code | Text | No | Optional — validated against existing author IDs |

#### 2.1.2 Password Rules
- Minimum 4 characters total
- Must include the author's First Name (case-insensitive)
- Must include at least 3 numeric digits
- **Note:** Example: If First Name is 'Ramesh', a valid password could be 'Ramesh123'

#### 2.1.3 OTP Verification
- On successful form submission, a 6-digit OTP is sent to the registered email address
- Author must enter the OTP to activate the account
- OTP validity: 10 minutes
- If OTP expires, author can request a resend
- Account remains inactive until OTP is verified

#### 2.1.4 Post-Registration
- System auto-generates a unique Author ID (e.g. RMD00127)
- Account is activated on successful OTP verification
- Author is redirected to the Author Dashboard on activation

---

### 2.2 Author Login

| Field | Type | Notes |
|---|---|---|
| Email ID | Email | Registered email address |
| Password | Password | As set during registration |

- On successful login, redirect to Author Dashboard
- Show appropriate error messages for invalid credentials
- 'Forgot Password' flow: OTP sent to registered email for reset

---

### 2.3 Author Dashboard (Home)
After login, the author lands on their personal dashboard. The following information is displayed:

| Section | Data Shown | Phase 1 Status |
|---|---|---|
| Profile Card | Photo, Author ID, Full Name, Qualification, Address, Contact, Email | Live |
| Net Royalty Earning | Total cumulative royalty earned (Rs) | Placeholder — Phase 2 |
| Total Books | Count of all published / ongoing books | Placeholder — Phase 2 |
| Ongoing Books | Count of books currently in publishing pipeline | Placeholder — Phase 2 |
| Last Month Royalty | Royalty earned in the previous calendar month (Rs) | Placeholder — Phase 2 |
| Author Royalty % | Current royalty percentage assigned by admin | Admin config |

> **Note:** In Phase 1, Royalty Earning, Total Books, Ongoing Books, and Last Month Royalty display 0 or default placeholder values as the books module is out of scope.

The dashboard header contains two action buttons:
- **Help Chart** — Opens the support / help desk form (see Section 2.5)
- **New Book** — Book submission (out of scope Phase 1; button visible but inactive)

---

### 2.4 Author Profile Update
The author updates their profile by clicking on their profile picture / name on the dashboard. An 'Update' badge is shown on the profile card. Clicking it opens an Update Profile modal.

#### 2.4.1 Profile Update Modal — Fields

**Read-only fields** (populated from registration, cannot be edited):
- User ID (auto-generated)
- Date of Enrollment (auto-set on registration)
- First Name, Last Name, Phone Number, Email ID

**Editable fields:**

| Field | Type | Notes |
|---|---|---|
| Highest Qualification | Text | e.g. MBA, B.Tech, PhD |
| Passing from University | Text | University name |
| PIN Code | Number (6 digits) | On entry, auto-populate City, District, State, Country |
| Division | Auto-filled | Populated from PIN Code lookup |
| City | Auto-filled | Populated from PIN Code lookup |
| District | Auto-filled | Populated from PIN Code lookup |
| State | Auto-filled | Populated from PIN Code lookup |
| Country | Auto-filled | Defaults to India; editable if needed |
| House/Plot No + Landmark | Text | Full house address line |

> **Note:** When a valid 6-digit PIN Code is entered, the system calls the India Post PIN Code API to auto-fill Division, City, District, and State.

- A 'Submit' button saves the updated profile
- Success and error toasts are displayed on save

---

### 2.5 Author Support — Help Chart
From the Author Dashboard, clicking 'Help Chart' opens a support request panel.

#### 2.5.1 Support Form Fields

| Field | Type | Notes |
|---|---|---|
| Select Support For? | Dropdown | e.g. 'Need Support for Book Publishing?', 'Royalty Query', 'Other' |
| Discussion Time | Time Slot Picker | Author selects 2 preferred time slots |
| Discussion Day | Dropdown | Today / Tomorrow / Day After Tomorrow |
| Description | Textarea | Free-text description of the issue |

- On 'Submit Request', the record is saved to the database
- Admin retrieves submitted tickets via a GET API
- No email notification in Phase 1; admin views from Help Center
- Author sees a success confirmation message after submission

---

## 3. Super Admin Module

### 3.1 Super Admin Authentication

#### 3.1.1 Login

| Field | Type | Notes |
|---|---|---|
| User ID | Email | Super Admin's registered email |
| Password | Password | System-generated or previously set password |

- On success, redirect to Super Admin Dashboard
- Show error for invalid credentials

#### 3.1.2 Change Password
Super Admin can change their password via a 'Change Password' option in the settings menu.

| Field | Type | Validation |
|---|---|---|
| Old Password | Password | Must match current stored password |
| New Password | Password | Standard complexity rules apply |
| Confirm New Password | Password | Must match New Password exactly |

- System validates old password before allowing update
- Success message displayed on password change

---

### 3.2 Super Admin Dashboard
The Super Admin dashboard shows a high-level platform overview.

| KPI Card | Description | Phase 1 Status |
|---|---|---|
| Active Authors | Count of verified + active author accounts | Live |
| Published Books | Total books in Published status | Placeholder (0) — Phase 2 |
| Ongoing Books | Total books currently in publishing pipeline | Placeholder (0) — Phase 2 |
| Books Selling Units | Total units sold across all platforms | Placeholder (0) — Phase 2 |
| Gross Margin | Net platform profit margin | Placeholder — Phase 2 |

> **Note:** Monthly Activities chart and Best Seller Author List are Phase 2 features. In Phase 1, they are shown as empty placeholder UI components.

---

### 3.3 Author Listing (Admin)
The Author Listing page shows all registered authors with filter and search capabilities.

#### 3.3.1 Filters

| Filter | Behaviour |
|---|---|
| Author Name / ID | Typeahead — enter 3+ characters of name or ID to see matching suggestions from DB |
| Location | Dropdown of existing State + District combinations from the database |
| Earnings | Sort toggle — Highest to Lowest / Lowest to Highest |
| From Date | Date picker — filter by enrollment date range start |
| To Date | Date picker — filter by enrollment date range end |

#### 3.3.2 Table Columns

| Column | Data | Phase 1 Notes |
|---|---|---|
| Author ID | Unique auto-generated ID (clickable) | Live |
| Author Name | Full name | Live |
| Location | State + District | Live |
| Total Sold Units | Sum of all book units sold | Show 0 — Phase 2 |
| Payment Completion % | % of onboarding payment paid | Show 0% — Phase 2 |
| Net Earnings | Total royalty earned | Show 0 — Phase 2 |
| Actions (⋮) | View / Edit / Restrict | Live |

#### 3.3.3 Author Detail View
Clicking an Author ID opens a detail panel showing:
- Full profile details (photo, ID, name, qualification, address, contact, email)
- Total Books, Ongoing Books
- Last Month Revenue, Set Author Royalty %
- Book list (Phase 2 — empty in Phase 1)
- Add Book button (Phase 2)
- Update Profile button — opens same profile update form as author-side

---

### 3.4 Create Author Account (Admin)
Super Admin can manually create an author account via the '+ Author' button on the Author Listing page.

#### 3.4.1 Create Author Form Fields

| Field | Type | Req. | Notes |
|---|---|---|---|
| Profile Picture | Image Upload | No | JPG/PNG, max 2MB |
| First Name | Text | Yes | Alphabets only |
| Last Name | Text | Yes | Alphabets only |
| Phone Number | Number | Yes | 10 digits |
| Email ID | Email | Yes | Must be unique |
| Highest Qualification | Text | No | e.g. MBA, B.Tech |
| University | Text | No | Passing university name |
| PIN Code | Number | No | Auto-fills City, District, State, Country |
| Division / City / District / State / Country | Auto-filled | — | From PIN Code lookup |
| House/Plot + Landmark | Text | No | Full address line |

#### 3.4.2 Post-Creation Flow
- System auto-generates a unique Author ID
- A system-generated password + email verification link is sent to the author's email
- Author must click the verification link to activate the account
- Until verified, account shows as 'Pending Verification' in admin listing

---

### 3.5 Edit and Restrict Author

#### 3.5.1 Edit Author
- Admin can edit any field on the author profile (except auto-generated Author ID and enrollment date)
- Same form fields as Create Author
- Changes are saved immediately on Submit

#### 3.5.2 Restrict Author
- Admin can toggle a 'Restrict' flag on any author account
- When restricted, the author can log in but only has access to:
  - Profile section (view and update)
  - Support section (Help Chart)
- All other menu items (Books, Royalty, Bank Accounts, Refer & Earn) are hidden or disabled
- The author sees a visible 'Account Restricted' notice on their dashboard

---

## 4. API Endpoint Summary — Phase 1

| Module | Method | Endpoint | Description |
|---|---|---|---|
| Auth | POST | /api/auth/author/register | Author self-registration |
| Auth | POST | /api/auth/author/verify-otp | OTP verification for author |
| Auth | POST | /api/auth/author/login | Author login |
| Auth | POST | /api/auth/author/forgot-password | Send OTP for password reset |
| Auth | POST | /api/auth/admin/login | Super Admin login |
| Auth | PUT | /api/auth/admin/change-password | Super Admin change password |
| Author | GET | /api/author/profile | Get logged-in author profile |
| Author | PUT | /api/author/profile | Update author profile |
| Author | POST | /api/author/support | Submit support request |
| Admin | GET | /api/admin/authors | List all authors (with filters) |
| Admin | POST | /api/admin/authors | Create author account |
| Admin | GET | /api/admin/authors/:id | Get single author detail |
| Admin | PUT | /api/admin/authors/:id | Edit author |
| Admin | PUT | /api/admin/authors/:id/restrict | Toggle restrict / unrestrict |
| Admin | GET | /api/admin/support | Get all support tickets |
| Utility | GET | /api/utility/pincode/:pin | PIN Code lookup → City, District, State |

---

## 5. Validation Rules Summary

| Field | Rule |
|---|---|
| First / Last Name | Alphabets only, no numbers or special characters, min 2 chars |
| Mobile Number | Exactly 10 numeric digits, no spaces or dashes |
| Email | Standard email format, must be unique in the system |
| Password (Author signup) | Min 4 chars; must contain First Name + min 3 digits |
| OTP | 6-digit numeric, expires in 10 minutes |
| PIN Code | Exactly 6 digits, valid Indian PIN Code |
| Profile Picture | JPG or PNG only, max 2MB |
| Referral Code | Optional; if entered, must match an existing active author ID |

---

## 6. Out of Scope — Phase 1
The following features are confirmed out of scope for Phase 1 and will be addressed in subsequent phases:
- Book listing, submission, and status tracking (Formatting / Designing / Printing / Published)
- Royalty calculator (Paperback / E-Book / Magazine)
- Sales and selling unit updates per platform
- Royalty payment processing and payment history
- Loyalty / monthly royalty payout page
- Bank account management
- Refer & Earn module
- Super Admin payment configuration and calculator configuration
- Monthly Activities chart and Best Seller Author List on admin dashboard
- Book product links management (Amazon, Flipkart, Meesho, etc.)
- Public-facing book discovery and order flow

---

## 7. Assumptions & Dependencies
- A third-party PIN Code API (e.g. India Post / Postalpincode.in) will be integrated for address auto-fill
- An SMTP / email service (e.g. SendGrid, AWS SES) will be configured for OTP and verification emails
- Author IDs are system-generated and not user-editable
- Super Admin accounts are pre-seeded in the database; no self-registration UI for Super Admin
- Only one Super Admin role exists in Phase 1
- All monetary values are in Indian Rupees (INR / Rs)

---

## 8. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 22 March 2026 | Tek System | Initial draft — Phase 1 scope defined |

---
*POVITAL — Phase 1 BRD | Tek System | Confidential*