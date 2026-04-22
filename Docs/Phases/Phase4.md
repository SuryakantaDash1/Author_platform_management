OVERVIEW
──────────────────────────────────────────────────

Phase 4 is the financial engine. It covers selling unit updates by admin, the full royalty calculation chain (strictly backend), royalty payout to authors with payment proof, the author royalty page, the help center (ticket system + chat), and the public-facing website (author listing and book listing pages).

Prerequisite: Phases 2 and 3 fully deployed.







1. SELLING UPDATE (ADMIN)
──────────────────────────────────────────────────

Admin enters monthly selling data per book. All revenue and profit calculations happen on the backend only — no client-side math.



1.1 Step 1 — Select Book

Field | Notes
--- | ---
Author ID | Typeahead — auto-fills Author Name
Book ID | Dropdown — auto-fills Book Name, Subtitle, Cover, Published Date




1.2 Step 2 — Selling Parts Per Platform

Platform | Selling Units | Selling Price / Unit | Auto Calculation
--- | --- | --- | ---
Amazon | 110 (manual input) | Rs 100 | Rs 11,000
Flipkart | 100 (manual input) | Rs 120 | Rs 12,000
Meesho | 40 (manual input) | Rs 125 | Rs 5,000
Distribution Channels | 120 (manual input) | Rs 170 | Rs 20,400
Total | 370 |  | Rs 48,400


Only platforms authorized during book creation are shown. Admin can add additional platforms. Selling Price Per Unit auto-calculates the row total on input.







2. FINANCIAL CALCULATION LOGIC (BACKEND ONLY)
──────────────────────────────────────────────────

All calculations are strictly backend-controlled. No client-side royalty or financial computation is permitted under any circumstance.



2.1 Step 1 — Gross Margin Calculation


Total Revenue = Σ (Selling Units × Selling Price Per Unit)
             = 11,000 + 12,000 + 5,000 + 20,400
             = Rs 48,400

Net Selling Units = 110 + 100 + 40 + 120 = 370

Production Cost = Net Selling Units × Cost Per Book
               = 370 × Rs 50 = Rs 18,500

Gross Margin = Total Revenue − Production Cost
             = 48,400 − 18,500 = Rs 29,900




2.2 Step 2 — Profit & Expenditures

Particulars | Amount | Notes
--- | --- | ---
Gross Margin | Rs 29,900 | From Step 1
Ads Cost Per Book (Rs 5 × 370) | − Rs 1,850 | Admin input: cost per book × total units
Net Return & Exchange | − Rs 1,500 | Admin input: total returns/exchange cost
Any Outstanding Amount | − Rs 700 | Optional — admin input
Net Profit | Rs 25,850 | Auto-calculated



Net Profit = Gross Margin − Ads Cost − Returns & Exchange − Outstanding
           = 29,900 − 1,850 − 1,500 − 700 = Rs 25,850




2.3 Step 3 — Author Royalty


Author Royalty = Net Profit × Royalty %
               = 25,850 × 70% = Rs 18,095




2.4 Step 4 — Final Royalty (Adjustments)


Final Royalty = Author Royalty − Referral Deduction − Outstanding Amount
             = Auto-calculated by backend


  • Referral Deduction: any referral balance used by this author is deducted here (auto-reflected)
  • Outstanding Amount: any pending dues from prior months (admin input — optional)
  • Final Royalty is the amount admin pays to the author's bank account



2.5 Admin Inputs Required for Calculation

Admin only manually enters: Selling Units per platform, Selling Price Per Unit, Production Cost Per Book, Ads Cost Per Book, Platform Fees, Returns & Exchange Amount, Outstanding Amount (optional). All other values auto-calculate on backend.







3. BOOK FINANCIAL DETAIL VIEW (ADMIN)
──────────────────────────────────────────────────



3.1 Summary Cards

Metric | Value
--- | ---
Cost of Production | Auto-calculated
Cost of Selling (Ads + Fees) | Auto-calculated
Author Royalty | Auto-calculated
Net Profit | Auto-calculated




3.2 Per-Platform Breakdown

Platform | Selling Units | Selling Price | Expense | Gross Margin
--- | --- | --- | --- | ---
Amazon | 200 | Rs 40k | Rs 3k | Rs 15k
Flipkart | 242 | Rs 57k | Rs 5k | Rs 22k
Offline Distribution | 242 | Rs 57k | Rs 5k | Rs 22k








4. ROYALTY PAYMENT RELEASE (ADMIN)
──────────────────────────────────────────────────

Step | Action
--- | ---
1 | Admin reviews auto-calculated Final Royalty amount
2 | Admin selects Author's Primary Bank Account from dropdown
3 | Admin uploads Payment Proof (image or PDF)
4 | Admin clicks Update Payment Status → Paid
5 | System sends confirmation email to Author and Super Admin


  • Payment records are immutable after submission
  • Only Super Admin can edit a payment record — full audit trail logged
  • Royalty release is per-book per-month cycle







5. AUTHOR ROYALTY LISTING (ADMIN)
──────────────────────────────────────────────────



5.1 Filters

Author Name/ID, Location, Earnings (Highest / Lowest), From Date, To Date



5.2 Table Columns

Column | Notes
--- | ---
Author ID | Clickable — opens per-author royalty detail
Author Name | 
Location | 
Total Book Units | All-time cumulative
Last Royalty | Most recent month payout
Net Royalty | Cumulative total earned
Actions | 3-dot menu — view detail, release payment








6. ROYALTY PAGE — AUTHOR SIDE
──────────────────────────────────────────────────



6.1 Monthly Summary List

Column | Description
--- | ---
Selling Units | Total units sold that month across all books
Net Royalty | Final royalty credited for that month
Payment Date | Date admin released the payment
Explore button | Opens monthly detail view




6.2 Monthly Detail View

  • Total Net Royalty for the month (prominent number)
  • Per book: Book Name, Published Date, Net Selling Units, Net Royalty, Payment Released On
  • Per platform split per book: Amazon, Flipkart, Meesho, Snapdeal, Offline Channel



6.3 Payment Proof Section

  • Net Payment amount
  • Payment Mode (e.g. NEFT, Phone Pay)
  • Transaction ID
  • Payment Proof file — downloadable by author







7. HELP CENTER
──────────────────────────────────────────────────



7.1 Ticket System (Admin)

Column | Notes
--- | ---
Ticket ID | Author ID used as Ticket ID
Author Name | 
Support Title | Topic of the support request
Discussion Time | Scheduled time slot chosen by author
Date | Submission date
Status | Pending / Working / Solved


Filters: Author Name/ID, Status (Pending/Working/Solved), From Date, To Date. Admin can change ticket status from the listing. "Chat with Author" button opens chat window.



7.2 Chat System

  • Two-way messaging between author and admin per ticket
  • Attachment support: images and PDFs
  • No WebSocket required — polling-based, refresh every 30 seconds
  • Full message history preserved per ticket
  • Author submits ticket from Help Chart on dashboard (support title, discussion time slots, discussion day, description)







8. PUBLIC WEBSITE PAGES
──────────────────────────────────────────────────



8.1 Author Listing Page (Public)

  • Lists all active published authors
  • Filters: Author Name, Book Language, Book Rating
  • Author card: Photo, Name, Location, Books Published, Net Royalty, Rating, Order Now button
  • Click author → Author Detail page showing full profile + book list



8.2 Book Listing Page (Public)

  • Lists all published books
  • Filters: Author Name, Book Name, Book Type, Book Language, Book Rating
  • Book card: Cover image, Title, Author Name, Units Sold, Discounted Price, Rating, Explore + Share buttons
  • Click book → Book Detail page: platform availability (Amazon, Flipkart, Meesho, Offline), units sold per platform, ratings, Share Now button







9. SYSTEM NOTIFICATIONS — PHASE 4
──────────────────────────────────────────────────

Event | Recipient | Channel
--- | --- | ---
Royalty payment released | Author + Super Admin | Email
Selling update submitted by admin | Super Admin (log) | Audit log
Support ticket submitted by author | Admin | Email + Dashboard
Admin replies to chat | Author | Email + Dashboard
Ticket status changed to Solved | Author | Email








10. PHASE 4 API ENDPOINTS
──────────────────────────────────────────────────

Module | Method | Endpoint | Description
--- | --- | --- | ---
Selling | POST | /api/admin/selling/update | Admin submits selling data for a book
Selling | GET | /api/admin/selling/:bookId | Get selling history for a book
Royalty | POST | /api/admin/royalty/release | Admin releases royalty payment
Royalty | GET | /api/admin/royalty | Admin royalty listing (all authors)
Royalty | GET | /api/admin/royalty/:authorId | Per-author royalty detail
Royalty | GET | /api/author/royalty | Author monthly royalty list
Royalty | GET | /api/author/royalty/:id | Monthly royalty detail view
Help | POST | /api/author/support | Author submits support ticket
Help | GET | /api/admin/support | Admin list all tickets with filters
Help | PUT | /api/admin/support/:id/status | Admin updates ticket status
Chat | GET | /api/chat/:ticketId | Get all messages for a ticket
Chat | POST | /api/chat/:ticketId | Send a chat message
Public | GET | /api/public/authors | Public author listing with filters
Public | GET | /api/public/authors/:id | Public author detail page
Public | GET | /api/public/books | Public book listing with filters
Public | GET | /api/public/books/:id | Public book detail page








11. NON-FUNCTIONAL REQUIREMENTS
──────────────────────────────────────────────────

Requirement | Detail
--- | ---
All financial calculations | Backend only — zero client-side math
Payment records | Immutable after submission — Super Admin edits only with full audit trail
Audit logs | Required for all financial updates and royalty releases
Dashboard response | Under 3 seconds
Uptime | 99% minimum
Scalability | Must support 100,000+ authors
File upload validation | Format and size enforced server-side








12. OUT OF SCOPE — PHASE 4
──────────────────────────────────────────────────

  [OUT OF SCOPE] Sub Admin Role & Module Permissions

  [OUT OF SCOPE] WhatsApp Notifications

  [OUT OF SCOPE] Royalty Calculator on Public Page

  [OUT OF SCOPE] Advanced Analytics / Pie Charts