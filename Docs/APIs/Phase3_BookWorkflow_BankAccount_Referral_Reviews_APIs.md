# POVITAL - Phase 3: Book Workflow, Bank Account, Referral & Reviews APIs

> **Base URL:** `http://localhost:5000/api`
> **Content-Type:** `application/json`

---

## 1. BOOK APPROVAL & STATUS PIPELINE (ADMIN)

> **All endpoints require:** `Authorization: Bearer <adminAccessToken>`

### Book Status Flow

```
payment_pending
    └─(payment received)──► pending
                                ├─(approve)──► formatting ──► designing ──► printing ──► published
                                └─(decline)──► rejected
```

---

### 1.1 Approve Book

```
PUT /admin/books/:bookId/approve
```

Moves book from `pending` to `formatting`. Sends approval email to author.

**Body:** *(none)*

**Side Effects:**
- `book.status` → `formatting`
- Status history entry added
- Email sent to author: "Your book has been approved and is now in Formatting stage"

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book approved successfully",
  "data": {
    "book": {
      "bookId": "BK00001",
      "status": "formatting",
      "statusHistory": [
        {
          "status": "formatting",
          "changedBy": "USR000001",
          "changedAt": "2026-04-15T06:00:00.000Z",
          "note": "Book approved by admin"
        }
      ]
    }
  }
}
```

**Error (400) - Wrong status:**
```json
{
  "success": false,
  "message": "Only pending books can be approved"
}
```

---

### 1.2 Decline Book

```
PUT /admin/books/:bookId/decline
```

Moves book to `rejected` with a mandatory reason. Sends decline email to author.

**Body:**
```json
{
  "reason": "Manuscript does not meet content guidelines. Please revise chapters 3-5."
}
```

**Side Effects:**
- `book.status` → `rejected`
- `book.rejectionReason` set to provided reason
- Status history entry added
- Email sent to author with rejection reason

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book declined",
  "data": {
    "book": {
      "bookId": "BK00001",
      "status": "rejected",
      "rejectionReason": "Manuscript does not meet content guidelines. Please revise chapters 3-5."
    }
  }
}
```

**Error (400) - Missing reason:**
```json
{
  "success": false,
  "message": "Decline reason is required"
}
```

---

### 1.3 Update Book Stage (Admin)

```
PUT /admin/books/:bookId/stage
```

Moves book between pipeline stages. Used after approve to advance through `formatting → designing → printing → published`.

**Body:**
```json
{
  "stage": "designing",
  "note": "Formatting completed on schedule"
}
```

**Valid stage values:** `formatting`, `designing`, `printing`, `published`

**Side Effects:**
- `book.status` updated
- Status history entry added with note
- Email sent to author for each stage change

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book stage updated to designing",
  "data": {
    "book": {
      "bookId": "BK00001",
      "status": "designing"
    }
  }
}
```

---

### 1.4 Update Book Status (General)

```
PUT /admin/books/:bookId/status
```

General-purpose status update. Used for manual overrides.

**Body:**
```json
{
  "status": "in_progress",
  "rejectionReason": "Required only when status is 'rejected'"
}
```

**Valid status values:** `draft`, `pending`, `payment_pending`, `in_progress`, `formatting`, `designing`, `printing`, `published`, `rejected`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book status updated successfully",
  "data": { "book": { ...updated book... } }
}
```

---

### 1.5 Update Product Links (Admin)

```
PUT /admin/books/:bookId/product-links
```

Admin adds/updates selling platform URLs and ratings for a published book.

**Body:**
```json
{
  "platformLinks": [
    {
      "platform": "Amazon",
      "productLink": "https://amazon.in/dp/B0XXXXXXXX",
      "rating": 4
    },
    {
      "platform": "Flipkart",
      "productLink": "https://flipkart.com/book/p/itm...",
      "rating": 5
    },
    {
      "platform": "1200 Offline Channels",
      "rating": 4
    }
  ]
}
```

> **Note:** Offline platforms (`1200 Offline Channels`, `150+ Other Sellers`) do not accept a `productLink` — omit or leave empty.

**Side Effects:**
- `book.platformWiseSales` Map updated per platform
- Stored as: `{ sellingUnits, productLink?, rating? }`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product links updated successfully",
  "data": {
    "book": {
      "bookId": "BK00001",
      "platformWiseSales": {
        "Amazon": { "sellingUnits": 0, "productLink": "https://amazon.in/dp/B0XXXXXXXX", "rating": 4 },
        "Flipkart": { "sellingUnits": 0, "productLink": "https://flipkart.com/...", "rating": 5 },
        "1200 Offline Channels": { "sellingUnits": 0, "rating": 4 }
      }
    }
  }
}
```

---

## 2. BANK ACCOUNT MANAGEMENT (AUTHOR)

> **All endpoints require:** `Authorization: Bearer <authorAccessToken>`

---

### 2.1 Get Bank Accounts

```
GET /author/bank-accounts
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "bankAccounts": [
      {
        "_id": "64abc123...",
        "authorId": "AUT638460",
        "bankName": "State Bank of India",
        "accountHolderName": "Suryakanta Dash",
        "accountNumber": "******4321",
        "ifscCode": "SBIN0012345",
        "branchName": "Rajnagar",
        "accountType": "primary",
        "createdAt": "2026-04-15T05:00:00.000Z"
      }
    ]
  }
}
```

> `accountNumber` is masked — only last 4 digits shown.

---

### 2.2 Add Bank Account

```
POST /author/bank-accounts
```

**Body:**
```json
{
  "bankName": "State Bank of India",
  "accountHolderName": "Suryakanta Dash",
  "accountNumber": "1234564321",
  "ifscCode": "SBIN0012345",
  "branchName": "Rajnagar",
  "accountType": "primary"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `bankName` | string | Yes | — |
| `accountHolderName` | string | Yes | — |
| `accountNumber` | string | Yes | Numeric only |
| `ifscCode` | string | Yes | Format: `XXXX0XXXXXX` (11 chars) |
| `branchName` | string | Yes | — |
| `accountType` | string | No | `primary` or `secondary`. Default: `secondary` |

**Side Effects:**
- If `accountType: primary` — existing primary account is demoted to `secondary`
- Account number is AES-256-CBC encrypted before storage; only last 4 digits saved in plain text

**Success Response (201):**
```json
{
  "success": true,
  "message": "Bank account added successfully",
  "data": {
    "bankAccount": {
      "_id": "64abc123...",
      "bankName": "State Bank of India",
      "accountHolderName": "Suryakanta Dash",
      "accountNumber": "4321",
      "ifscCode": "SBIN0012345",
      "branchName": "Rajnagar",
      "accountType": "primary"
    }
  }
}
```

---

### 2.3 Edit Bank Account

```
PUT /author/bank-accounts/:accountId
```

Updates an existing bank account. Account number cannot be changed after creation.

**Body:**
```json
{
  "bankName": "HDFC Bank",
  "accountHolderName": "Suryakanta Dash",
  "ifscCode": "HDFC0001234",
  "branchName": "Connaught Place, New Delhi",
  "accountType": "primary"
}
```

**Side Effects:**
- If `accountType: primary` — existing primary is demoted to `secondary`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bank account updated successfully",
  "data": {
    "bankAccount": { ...updated account... }
  }
}
```

---

### 2.4 Delete Bank Account

```
DELETE /author/bank-accounts/:accountId
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bank account deleted successfully"
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Bank account not found"
}
```

---

## 3. REFERRAL (AUTHOR)

> **All endpoints require:** `Authorization: Bearer <authorAccessToken>` (unless noted)

---

### 3.1 Validate Referral Code (Public)

```
GET /referrals/validate/:referralCode
```

**No auth required.** Used on signup page to verify a referral code before submission.

**Example:** `GET /referrals/validate/XKY3E0PX`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Valid referral code",
  "data": {
    "referralCode": "XKY3E0PX",
    "referrerName": "SK Dash"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Invalid referral code"
}
```

---

### 3.2 Get My Referrals

```
GET /referrals/my-referrals
```

Returns the author's referral code, stats, and list of referred authors.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "referralCode": "XKY3E0PX",
    "totalReferrals": 1,
    "totalEarnings": 0,
    "pendingEarnings": 0,
    "referrals": [
      {
        "_id": "69df249f...",
        "referrerId": "AUT638460",
        "referredAuthorId": "AUT636513",
        "referralCode": "XKY3E0PX",
        "earningPercentage": 0,
        "commissionAmount": 0,
        "status": "pending",
        "totalEarnings": 0,
        "availableBalance": 0,
        "utilizedBalance": 0,
        "isActive": true,
        "createdAt": "2026-04-15T05:39:43.870Z",
        "referredAuthorDetails": {
          "authorId": "AUT636513",
          "firstName": "Suryakanta",
          "lastName": "dash",
          "totalBooks": 0,
          "totalEarnings": 0,
          "createdAt": "2026-04-15T05:39:43.806Z"
        }
      }
    ]
  }
}
```

| `status` | Meaning |
|---|---|
| `pending` | Referred author joined; commission not yet processed |
| `completed` | Admin has processed and credited the commission |

---

### 3.3 Apply Referral Balance to Book Payment

```
POST /author/referral/apply
```

Applies the author's available referral balance as a discount on a book's pending payment.

**Body:**
```json
{
  "bookId": "BK00001"
}
```

**Side Effects:**
- Deducts from `referral.availableBalance` (across all active referrals, in order)
- Adds to `referral.utilizedBalance`
- Updates `book.priceBreakdown.referralDiscount`
- Recalculates `book.priceBreakdown.finalAmount`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Referral balance applied successfully",
  "data": {
    "deduction": 500,
    "newFinalAmount": 9650,
    "referralDiscount": 500
  }
}
```

**Error (400) - No balance:**
```json
{
  "success": false,
  "message": "No referral balance available"
}
```

---

## 4. REFERRAL (ADMIN)

> **All endpoints require:** `Authorization: Bearer <adminAccessToken>`

---

### 4.1 Get All Referrals

```
GET /referrals?page=1&limit=20
```

**Query Params:**

| Param | Type | Default |
|---|---|---|
| `page` | number | 1 |
| `limit` | number | 20 |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "referrals": [ ...referral objects... ],
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

---

### 4.2 Get Referral Statistics

```
GET /referrals/stats
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalReferrals": 10,
    "completedReferrals": 3,
    "pendingReferrals": 7,
    "totalCommissionPaid": 1500,
    "topReferrers": [
      {
        "authorId": "AUT638460",
        "referralCount": 5
      }
    ]
  }
}
```

---

### 4.3 Update Commission Amount

```
PUT /referrals/:referralId/commission
```

Admin sets the commission amount for a pending referral before processing it.

**Body:**
```json
{
  "commissionAmount": 500
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Commission amount updated successfully",
  "data": { "referral": { ...updated referral... } }
}
```

---

### 4.4 Process Referral Commission

```
POST /referrals/:referralId/process
```

Marks referral as `completed`, creates a Transaction record, and credits the referrer's `totalEarnings`.

**Body:** *(none)*

**Side Effects:**
- `referral.status` → `completed`
- `Transaction` created with type `referral_commission`
- `author.totalEarnings` incremented by `commissionAmount`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Referral commission processed successfully",
  "data": { "referral": { ...referral with status: completed... } }
}
```

**Error (400) - Already processed:**
```json
{
  "success": false,
  "message": "Commission already processed"
}
```

---

## 5. REVIEWS

---

### 5.1 Get Public Reviews

```
GET /reviews/public?page=1&limit=10&rating=5
```

**No auth required.**

**Query Params:**

| Param | Type | Default |
|---|---|---|
| `page` | number | 1 |
| `limit` | number | 10 |
| `rating` | number | — | Filter by star rating (1-5) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "64abc...",
        "authorId": "AUT638460",
        "rating": 5,
        "review": "Amazing platform for authors!",
        "isVisible": true,
        "createdAt": "2026-04-15T06:00:00.000Z",
        "authorDetails": {
          "firstName": "SK",
          "lastName": "Dash"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

### 5.2 Get My Review (Author)

```
GET /reviews/my
```

> **Requires:** `Authorization: Bearer <authorAccessToken>`

Returns the logged-in author's own review if it exists.

**Success Response (200) — review exists:**
```json
{
  "success": true,
  "data": {
    "review": {
      "_id": "64abc...",
      "rating": 4,
      "review": "Great platform, very supportive team.",
      "isVisible": true,
      "createdAt": "2026-04-14T10:00:00.000Z"
    }
  }
}
```

**Success Response (200) — no review yet:**
```json
{
  "success": true,
  "data": { "review": null }
}
```

---

### 5.3 Submit Review (Author)

```
POST /reviews
```

> **Requires:** `Authorization: Bearer <authorAccessToken>`

An author can only have one review. Returns error if one already exists.

**Body:**
```json
{
  "rating": 5,
  "review": "The publishing process was smooth and professional!"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `rating` | number | Yes | 1–5 |
| `review` | string | Yes | Non-empty text |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "review": {
      "_id": "64abc...",
      "authorId": "AUT638460",
      "rating": 5,
      "review": "The publishing process was smooth and professional!",
      "isVisible": true,
      "createdAt": "2026-04-15T06:00:00.000Z"
    }
  }
}
```

**Error (400) - Already reviewed:**
```json
{
  "success": false,
  "message": "You have already submitted a review"
}
```

---

### 5.4 Update Own Review (Author)

```
PUT /reviews/:id
```

> **Requires:** `Authorization: Bearer <authorAccessToken>`

**Body (all optional):**
```json
{
  "rating": 4,
  "review": "Updated review text."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": { "review": { ...updated review... } }
}
```

---

### 5.5 Get All Reviews (Admin)

```
GET /reviews/admin?page=1&limit=20&search=great&rating=5
```

> **Requires:** `Authorization: Bearer <adminAccessToken>`

**Query Params:**

| Param | Type | Notes |
|---|---|---|
| `page` | number | Default: 1 |
| `limit` | number | Default: 20 |
| `search` | string | Searches review text |
| `rating` | number | Filter by star rating |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "64abc...",
        "authorId": "AUT638460",
        "rating": 5,
        "review": "Great platform!",
        "isVisible": true,
        "createdAt": "2026-04-15T06:00:00.000Z",
        "authorDetails": {
          "firstName": "SK",
          "lastName": "Dash",
          "email": "sdash6078@gmail.com"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

### 5.6 Edit Review (Admin)

```
PUT /reviews/admin/:id
```

> **Requires:** `Authorization: Bearer <adminAccessToken>`

Admin can update rating, text, or toggle visibility.

**Body (all optional):**
```json
{
  "rating": 3,
  "review": "Updated by admin for policy compliance.",
  "isVisible": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": { "review": { ...updated review... } }
}
```

---

### 5.7 Delete Review (Admin)

```
DELETE /reviews/admin/:id
```

> **Requires:** `Authorization: Bearer <adminAccessToken>`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## Postman Setup

### Environment Variables
| Variable | Value |
|---|---|
| `baseUrl` | `http://localhost:5000/api` |
| `adminToken` | *(set after admin login)* |
| `authorToken` | *(set after author login)* |

### Quick Reference — All Phase 3 Endpoints

| Module | Method | Endpoint | Auth |
|---|---|---|---|
| Payment | POST | `/payment/create-order` | Author |
| Payment | POST | `/payment/verify` | Author |
| Payment | GET | `/payment/pending-requests` | Author |
| Payment | POST | `/payment/webhook` | None |
| Admin Payment | POST | `/admin/books/:bookId/payment-request` | Admin |
| Admin Payment | PUT | `/admin/books/:bookId/extend-due-date` | Admin |
| Book Workflow | PUT | `/admin/books/:bookId/approve` | Admin |
| Book Workflow | PUT | `/admin/books/:bookId/decline` | Admin |
| Book Workflow | PUT | `/admin/books/:bookId/stage` | Admin |
| Book Workflow | PUT | `/admin/books/:bookId/status` | Admin |
| Book Workflow | PUT | `/admin/books/:bookId/product-links` | Admin |
| Bank Account | GET | `/author/bank-accounts` | Author |
| Bank Account | POST | `/author/bank-accounts` | Author |
| Bank Account | PUT | `/author/bank-accounts/:id` | Author |
| Bank Account | DELETE | `/author/bank-accounts/:id` | Author |
| Referral | GET | `/referrals/validate/:code` | None |
| Referral | GET | `/referrals/my-referrals` | Author |
| Referral | POST | `/author/referral/apply` | Author |
| Referral Admin | GET | `/referrals` | Admin |
| Referral Admin | GET | `/referrals/stats` | Admin |
| Referral Admin | PUT | `/referrals/:id/commission` | Admin |
| Referral Admin | POST | `/referrals/:id/process` | Admin |
| Reviews | GET | `/reviews/public` | None |
| Reviews | GET | `/reviews/my` | Author |
| Reviews | POST | `/reviews` | Author |
| Reviews | PUT | `/reviews/:id` | Author |
| Reviews Admin | GET | `/reviews/admin` | Admin |
| Reviews Admin | PUT | `/reviews/admin/:id` | Admin |
| Reviews Admin | DELETE | `/reviews/admin/:id` | Admin |
