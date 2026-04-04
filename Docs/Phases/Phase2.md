OVERVIEW
──────────────────────────────────────────────────

Phase 2 is scoped entirely to book submission — the form fields, file uploads, marketplace authorization, price breakdown display (from admin's payment configuration), and the initial payment trigger via Razorpay. No approval flow, no status tracking — those are Phase 3.







1. PAYMENT CONFIGURATION MODULE (ADMIN — REQUIRED BEFORE BOOK SUBMISSION)
──────────────────────────────────────────────────

A dynamic pricing engine. All prices are set by admin and stored in DB. No prices are hardcoded in backend code. These prices drive the book submission price breakdown for both author and admin flows.



1.1 Configuration Page Fields (Per Language)

Field | Type | Notes
--- | --- | ---
Book Language | Text | e.g. English, Hindi, Odia
Book Language wise Price | Main Price + Discount % | Base language fee
Book Publishing Price | Main Price + Discount % | Core publishing fee
Cover Design Price | Main Price + Discount % | Professional cover
Distribution Price | Main Price + Discount % | Platform distribution fee
Copyright Price | Main Price + Discount % | Copyright registration
Formatting Price | Main Price + Discount % | Manuscript formatting
Per Book Copy Price | Main Price + Discount % | Physical copy price per piece




1.2 Installment Configuration

Option | Split
--- | ---
One-time Payment | 100% at once
2 Installments | 50% + 50%
3 Installments | 25% + 50% + 25%
4 Installments | 25% + 50% + 25% + 0% (final on approval)




1.3 Referral Configuration

  • 1st Book Published Bonus — Rs amount input by admin
  • Per Referral Bonus — Rs amount input by admin



1.4 Benefits List

  • Admin adds bullet-point benefits (free text)
  • Shown to author during book submission price breakdown screen
  • Admin can add, edit, delete benefit items

Admin can Add, Edit, and Update any configuration. All changes save to DB instantly and reflect in book submission flow immediately.







2. ADD BOOK — AUTHOR SIDE
──────────────────────────────────────────────────



2.1 Book Details Form Fields

Field | Type | Required | Notes
--- | --- | --- | ---
Book Name | Text | Yes | 
Book Language | Dropdown | Yes | Pulled from Payment Config — drives pricing shown
Book Type | Dropdown | Yes | Fiction, Non-Fiction, Academic, Magazine
Book Title / Subtitle | Text | Yes | 
Target Audience | Text | No | e.g. Adults, Students, Children
Book Cover | Yes/No toggle + Upload | Yes | If Yes — upload JPG/PNG max 10MB
Need Formatting? | Yes/No | Yes | 
Need Copyright? | Yes/No | Yes | 
Need Book Designing? | Yes/No | Yes | 
Physical Copies Needed | Number | Yes | 2 copies free by default
Book Expected Launch Date | Date Picker | Yes | No past dates allowed
Upload Manuscript Files | Multi-file upload | Yes | PDF, .doc, .docx, Images. Max 200MB total




2.2 Authorize to Selling — Platform Checkboxes

  • Amazon, Flipkart, Meesho, Snapdeal, Myntra
  • 150+ Other Sellers, 1200 Offline Channels
  • Select All toggle
  • Platform list is dynamically pulled from admin Payment Configuration



2.3 Price Breakdown Screen (Shown After Form — Before Payment)

All prices pulled dynamically from Payment Configuration for the selected language.

Service | Discounted Price | Original Price
--- | --- | ---
Book Publishing | Rs [from config] | Rs [main — strikethrough]
Cover Design | Rs [from config] | Rs [main — strikethrough]
Book Formatting | Rs [from config] | Rs [main — strikethrough]
Copyright | Rs [from config] | Rs [main — strikethrough]
Physical Copies (10) | Rs [from config] | Rs [main — strikethrough]
Net Amount | Rs [total] | 
Discount | Rs [saved — strikethrough] | 
Referral Discount | Rs [if applicable — strikethrough] | Auto-applied if author has referral balance


Benefits list (from admin config) is shown below the price breakdown.



2.4 Payment Options — Razorpay

Option | Description
--- | ---
Pay 100% | Full payment now via Razorpay
Pay 50% | 50% now via Razorpay, 50% deferred
Pay 25% | 25% now via Razorpay, remaining in installments
Pay Later | Deferred — due date set to 7 days from submission




2.5 Pay Later Rules

  • Due date: 7 days from book submission date
  • Reminder emails: 3 days before due date, 1 day before, and on due date
  • If unpaid after due date: book status set to "Payment Pending" and publishing is paused
  • Admin can manually extend due date from admin panel



2.6 Post-Payment / Post-Submission

  • On Razorpay success: book record created in DB with status "Pending Approval"
  • Author receives confirmation email: "Your book has been submitted for review"
  • Book appears in author's Books Listing with status badge: Pending Approval
  • Admin sees new book in Books Listing — approval flow handled in Phase 3







3. ADD BOOK — ADMIN SIDE
──────────────────────────────────────────────────

Admin can add a book directly on behalf of any author from the Books Listing page via the "+ Books" button.



3.1 Add Book Form Fields (Admin)

Field | Type | Required | Notes
--- | --- | --- | ---
Author ID | Typeahead search | Yes | Auto-fills Author Name on selection
Author Name | Auto-filled | — | Read-only after Author ID selected
Book Language | Dropdown | Yes | Drives pricing from Payment Config
Book Name | Text | Yes | 
Book Title / Subtitle | Text | No | 
Book Type | Dropdown | Yes | Fiction, Non-Fiction, Academic, Magazine
Target Audience | Text | No | 
Book Cover | Upload | No | Admin uploads if author has no cover. JPG/PNG max 10MB
Need Formatting? | Yes/No | Yes | 
Need Copyright? | Yes/No | Yes | 
Need Book Designing? | Yes/No | Yes | 
Physical Copies | Number | Yes | 2 free default
Set Author Royalty % | Number input | Yes | Admin sets this — author cannot set own royalty %
Expected Launch Date | Date Picker | Yes | No past dates allowed
Upload Manuscript Files | Multi-file | Yes | PDF, .doc, .docx, Images. Max 200MB total
Authorize Selling Platforms | Checkboxes | Yes | Dynamic from payment config platform list




3.2 Price Breakdown — Admin View

Same dynamic price breakdown as author side, pulled from Payment Configuration for the selected language. Admin sees the same pricing screen.



3.3 Post-Admin Book Creation

  • Book record created in DB
  • Payment request sent to author via email and mobile notification
  • Author sees payment card on dashboard with amount and Pay button
  • Book visible in admin Books Listing with status: "Payment Pending"
  • Approval flow handled in Phase 3







4. BOOKS LISTING — ADMIN SIDE (PHASE 2 SCOPE)
──────────────────────────────────────────────────



4.1 Filters

Filter | Type
--- | ---
Author Name | Typeahead (3+ characters)
Book Name | Typeahead (3+ characters)
Selling Units | Highest / Lowest sort
From Date | Date picker
To Date | Date picker




4.2 Table Columns

Column | Notes
--- | ---
Book Name | Clickable — opens book detail
Author Name | 
Book Type | 
Book Status | Color badge
Selling Units | Show 0 in Phase 2
Net Earnings | Show 0 in Phase 2
Date | Entry date
Payment % | Spinner icon (pending) / green tick (complete)




4.3 Book Detail View (Admin — Phase 2 Scope)

  • Book Register Date, Book ID, Name, Type, Title/Subtitle, Current Status badge
  • View Files button (attached manuscript)
  • Services Including: Language, Cover Page, Designing, Formatting, Copyright, Royalty %, Payment status %
  • Net Payable Amount (with discount strikethrough), Last Payment info
  • Edit Book button
  • Approve / Decline — Phase 3
  • Payment Request button — Phase 3
  • Selling stats — Phase 4







5. BOOKS LISTING — AUTHOR SIDE (PHASE 2 SCOPE)
──────────────────────────────────────────────────



5.1 Table Columns

Column | Notes
--- | ---
Book ID | Auto-generated e.g. DT0071
Book Name | Clickable
Book Status | Pending Approval / Formatting / Designing / Printing / Published / Declined / Payment Pending
Selling Units | Show 0 in Phase 2
Net Earnings | Show 0 in Phase 2
Launch Date | Expected date
Payment Status | Pay Now button / Paid badge




5.2 Book Detail View (Author — Phase 2 Scope)

  • Book ID, Title, Subtitle, Language, Type, Entry Date, Status badge
  • Services Including: Language, Cover Page, Designing, Formatting, Copyright, Royalty %, Net Payment %
  • View Files button
  • Net Payable Amount (with discount strikethrough)
  • Last Payment date and amount
  • Pay [amount] button for remaining installments (triggers Razorpay)
  • Per-platform selling stats — Phase 4







6. PHASE 2 API ENDPOINTS
──────────────────────────────────────────────────

Module | Method | Endpoint | Description
--- | --- | --- | ---
Payment Config | GET | /api/admin/payment-config | Get all language pricing
Payment Config | POST | /api/admin/payment-config | Add new language pricing
Payment Config | PUT | /api/admin/payment-config/:id | Update language pricing
Payment Config | DELETE | /api/admin/payment-config/:id | Delete language pricing
Books | POST | /api/author/books | Author submits new book
Books | GET | /api/author/books | Author book list
Books | GET | /api/author/books/:id | Author book detail
Books | PUT | /api/author/books/:id | Author edits book (before approval)
Books | POST | /api/admin/books | Admin adds book on author account
Books | GET | /api/admin/books | Admin book listing with filters
Books | GET | /api/admin/books/:id | Admin book detail
Books | PUT | /api/admin/books/:id | Admin edits book
Payment | POST | /api/payment/create-order | Razorpay order creation
Payment | POST | /api/payment/verify | Razorpay payment verification callback
Payment | GET | /api/author/books/:id/payment-status | Get payment status for a book








7. VALIDATION RULES — PHASE 2
──────────────────────────────────────────────────

Field | Rule
--- | ---
Book Launch Date | Cannot be a past date
Manuscript files | PDF, .doc, .docx, Images only. Max 200MB total
Cover image | JPG/PNG only. Max 10MB
Royalty % | 0–100, numeric, set by admin only — author cannot set
Payment Config main price | Must be greater than 0
Payment Config discount % | 0–100
Physical copies | Numeric, minimum 2 (free default)








8. OUT OF SCOPE — PHASE 2
──────────────────────────────────────────────────

  [OUT OF SCOPE] Book Approval / Decline

  [OUT OF SCOPE] Book Status Updates

  [OUT OF SCOPE] Bank Accounts

  [OUT OF SCOPE] Refer & Earn

  [OUT OF SCOPE] Ratings & Reviews

  [OUT OF SCOPE] Selling Engine

  [OUT OF SCOPE] Royalty Calculation

  [OUT OF SCOPE] Help Center

  [OUT OF SCOPE] Public Website