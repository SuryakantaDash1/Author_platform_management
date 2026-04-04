OVERVIEW
──────────────────────────────────────────────────

Phase 3 builds on the book submission from Phase 2. It covers the complete Razorpay integration (installment payments, Pay Later reminders), the book approval and decline workflow, admin-controlled book status pipeline, bank account management, refer and earn, and ratings and reviews.

Prerequisite: Phase 2 fully deployed.







1. RAZORPAY INTEGRATION (COMPLETE)
──────────────────────────────────────────────────

Phase 2 creates the Razorpay order and captures the initial payment. Phase 3 completes the full integration including installment tracking, Pay Later enforcement, and additional payment requests from admin.



1.1 Payment Flow

  • Author selects payment option (100% / 50% / 25% / Pay Later) on the price breakdown screen
  • Backend calls Razorpay API to create an order with the correct amount
  • Author completes payment on Razorpay checkout
  • Razorpay sends webhook callback to backend on success
  • Backend verifies payment signature, updates payment record in DB
  • Book status updated to "Pending Approval" on successful payment



1.2 Installment Tracking

  • Each installment creates a separate Razorpay order
  • Payment history stored per book: amount, date, transaction ID, payment mode
  • Author can pay next installment from Book Detail page — Pay [amount] button triggers new Razorpay order
  • Admin can also trigger a payment request from admin panel (see 1.4)



1.3 Pay Later Enforcement

  • Due date: 7 days from book submission date — stored in DB
  • Automated email reminders: 3 days before, 1 day before, on due date
  • On due date breach: book status automatically set to "Payment Pending" — publishing paused
  • Admin can manually extend due date from Book Detail admin panel
  • Once payment received: status returns to "Pending Approval"



1.4 Payment Request — Admin to Author

Admin can raise an additional payment request from the Book Detail view.

Field | Notes
--- | ---
Book ID / Name / Status | Auto-filled
Amount received so far | Auto-filled (e.g. Rs 1250, 50%)
Service Type | Inclusive Services / Exclusive Services dropdown
Amount | Inclusive: remaining amount auto-suggested. Exclusive: admin inputs manually
Description | Optional free text


  • On submit: notification sent to author via email and shown on author dashboard as a payment card
  • Author pays via Razorpay from the dashboard card or Book Detail page







2. BOOK APPROVAL & DECLINE WORKFLOW (ADMIN)
──────────────────────────────────────────────────



2.1 Approval Flow

  • Admin sees all "Pending Approval" books in Books Listing
  • Admin clicks book → Book Detail View → Approve or Decline button
  • On Approve: book status moves to "Formatting" — email sent to author: "Your book has been approved and is now in Formatting stage"
  • On Decline: admin modal asks for decline reason (required text input)
  • On Decline confirm: book status set to "Declined" — email sent to author with the decline reason
  • Declined books remain visible in admin and author listings with "Declined" badge



2.2 Book Status Pipeline (Admin Controlled)


Pending Approval
  → Approve   → Formatting → Designing → Printing → Published
  → Decline   → Declined (with reason)


  • Only admin can move a book between stages — author cannot change status
  • Each status change triggers an email notification to the author
  • Status history is logged with timestamp and admin ID for audit trail



2.3 Status Email Notifications

Status Change | Email to Author
--- | ---
Pending Approval → Approved (Formatting) | "Your book has been approved and entered Formatting stage"
Formatting → Designing | "Your book has moved to the Designing stage"
Designing → Printing | "Your book has moved to the Printing stage"
Printing → Published | "Congratulations! Your book is now Published"
Any → Declined | "Your book has been declined. Reason: [admin reason]"








3. ONLINE PRODUCT LINK UPDATE (ADMIN)
──────────────────────────────────────────────────

Once a book is Published, admin adds the live selling links per platform so they appear on the public-facing website.

Field | Notes
--- | ---
Selling Platform | Auto-listed from platforms authorized during book creation
Product Rating | Star rating selector (1–5)
Book Link | Paste product URL (Amazon, Flipkart, etc.)


For Offline Distribution: number of channels, user feedback rating, distributor name in link area.

Update Product button saves and reflects immediately in DB.







4. BANK ACCOUNT MANAGEMENT (AUTHOR)
──────────────────────────────────────────────────



4.1 Account List View

  • Lists all saved bank accounts: Bank Name, Account Holder Name, masked A/C No
  • Edit and Delete buttons per account
  • Primary badge shown on primary account
  • Add Bank A/C button



4.2 Add / Edit Bank Account Fields

Field | Required | Validation
--- | --- | ---
Bank Name | Yes | 
Account Holder Name | Yes | 
Account Number | Yes | Numeric only
Re-enter Account Number | Yes | Must exactly match Account Number
IFSC Code | Yes | Valid Indian IFSC format e.g. HDFC0001234
Branch Name | Yes | 
Is this Primary Account? | Yes/No | Only one primary allowed at a time — setting new primary removes old one


  • Author can add multiple accounts but only one can be Primary
  • Admin selects primary account when releasing royalty payment (Phase 4)







5. REFER & EARN (AUTHOR)
──────────────────────────────────────────────────



5.1 How It Works

  • Each author has a unique Referral ID (e.g. RAMESH1207) shown on their Refer & Earn page
  • Author shares their Referral ID — new authors enter it during registration
  • Rs 500 credited to referrer only after referred author completes 100% payment of their first book
  • Referral balance can only be used as a discount during book publishing payment — not withdrawable as cash



5.2 Refer & Earn Page — Author

Section | Details
--- | ---
Referral ID card | Author's unique ID shown prominently with a share/copy button
Available Balance | Rs amount available to use on next book payment
Balance Utilized | Rs amount already used in previous book payments
Referral List | Referred Author Name, Author ID, Payment Status (% + amount), Date




5.3 Referral Balance Usage Rule

  • At book payment screen: if author has available referral balance, it is auto-applied as "Referral Discount"
  • Author can see the deduction in the Price Breakdown
  • Balance is deducted from DB on successful Razorpay payment
  • Cannot be used partially — full available balance is applied each time







6. RATING & REVIEW MODULE
──────────────────────────────────────────────────



6.1 Author Side

  • Author submits a platform rating (1–5 stars) and written review text
  • Optional attachment: image or document (max 5MB)
  • Submission saved to DB and immediately visible on the public website
  • Author can only submit one review — can edit their own review



6.2 Admin Side

  • Admin can view all submitted reviews in admin panel
  • Admin can edit or delete any review
  • Reviews shown on public-facing website homepage and author listing page







7. SYSTEM NOTIFICATIONS — PHASE 3
──────────────────────────────────────────────────

Event | Recipient | Channel
--- | --- | ---
Book submitted (payment received) | Super Admin | Email
Book approved | Author | Email
Book declined with reason | Author | Email
Book status updated (each stage) | Author | Email
Payment request raised by admin | Author | Email + Dashboard notification
Additional payment received | Admin | Email
Pay Later reminder — 3 days before | Author | Email
Pay Later reminder — 1 day before | Author | Email
Pay Later overdue | Author | Email
Referral bonus credited (Rs 500) | Author | Email + Dashboard








8. PHASE 3 API ENDPOINTS
──────────────────────────────────────────────────

Module | Method | Endpoint | Description
--- | --- | --- | ---
Payment | POST | /api/payment/create-order | Razorpay order creation (installment)
Payment | POST | /api/payment/webhook | Razorpay webhook callback
Payment | POST | /api/payment/verify | Verify Razorpay payment signature
Payment | POST | /api/admin/books/:id/payment-request | Admin raises additional payment request
Payment | PUT | /api/admin/books/:id/extend-due-date | Admin extends Pay Later due date
Books | PUT | /api/admin/books/:id/approve | Admin approves book
Books | PUT | /api/admin/books/:id/decline | Admin declines book with reason
Books | PUT | /api/admin/books/:id/status | Admin updates book stage
Books | PUT | /api/admin/books/:id/product-links | Admin updates platform product links
Bank | GET | /api/author/bank-accounts | List author bank accounts
Bank | POST | /api/author/bank-accounts | Add bank account
Bank | PUT | /api/author/bank-accounts/:id | Edit bank account
Bank | DELETE | /api/author/bank-accounts/:id | Delete bank account
Refer | GET | /api/author/referral | Get referral list and balance
Refer | POST | /api/author/referral/apply | Apply referral balance to payment
Reviews | POST | /api/author/reviews | Author submits review
Reviews | PUT | /api/author/reviews/:id | Author edits own review
Reviews | GET | /api/reviews | Public reviews list
Reviews | PUT | /api/admin/reviews/:id | Admin edits any review
Reviews | DELETE | /api/admin/reviews/:id | Admin deletes review








9. OUT OF SCOPE — PHASE 3
──────────────────────────────────────────────────

  [OUT OF SCOPE] Selling Engine

  [OUT OF SCOPE] Royalty Calculation

  [OUT OF SCOPE] Royalty Payout

  [OUT OF SCOPE] Help Center / Chat

  [OUT OF SCOPE] Public Website Pages

  [OUT OF SCOPE] Sub Admin Role