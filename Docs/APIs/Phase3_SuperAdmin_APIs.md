# POVITAL - Phase 3: Super Admin APIs

> **Base URL:** `http://localhost:5000/api`
> **Content-Type:** `application/json`
> **All endpoints require:** `Authorization: Bearer <adminAccessToken>`

---

## 1. BOOK APPROVAL & PIPELINE

### 1.1 Approve Book

```
PUT /admin/books/:bookId/approve
```

Moves a `pending` book to `formatting`. Sends approval email to author.

**Body:** *(none)*

**Side Effects:**
- `book.status` → `formatting`
- Status history entry added: `{ status: "formatting", changedBy, changedAt, note: "Book approved by admin" }`
- Approval email sent to author
- AuditLog entry: `action: "status_change"`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book approved and moved to formatting stage",
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

**Error (400) - Not pending:**
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

Moves a `pending` book to `rejected`. Reason is mandatory. Sends decline email to author.

**Body:**
```json
{
  "reason": "Manuscript does not meet content guidelines. Please revise chapters 3–5."
}
```

**Side Effects:**
- `book.status` → `rejected`
- `book.rejectionReason` set
- Status history entry added: `{ status: "rejected", note: "Declined: <reason>" }`
- Decline email sent to author with reason
- AuditLog entry: `action: "status_change"`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book declined",
  "data": {
    "book": {
      "bookId": "BK00001",
      "status": "rejected",
      "rejectionReason": "Manuscript does not meet content guidelines. Please revise chapters 3–5."
    }
  }
}
```

**Error (400) - Missing reason:**
```json
{
  "success": false,
  "message": "Rejection reason is required"
}
```

**Error (400) - Not pending:**
```json
{
  "success": false,
  "message": "Only pending books can be declined"
}
```

---

### 1.3 Advance Book Stage (Pipeline)

```
PUT /admin/books/:bookId/stage
```

Advances book to the next stage in the fixed pipeline. No body needed — next stage is auto-determined.

**Pipeline:**
```
formatting → designing → printing → published
```

**Body:** *(none)*

**Side Effects:**
- `book.status` → next pipeline stage
- If advancing to `published`:
  - `book.actualLaunchDate` set to current date
  - `author.totalBooks` incremented by 1
- Status history entry added
- Stage update email sent to author
- AuditLog entry: `action: "status_change"`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book moved from formatting to designing",
  "data": {
    "book": {
      "bookId": "BK00001",
      "status": "designing",
      "statusHistory": [
        {
          "status": "designing",
          "changedBy": "USR000001",
          "changedAt": "2026-04-15T07:00:00.000Z",
          "note": "Stage advanced from formatting to designing"
        }
      ]
    }
  }
}
```

**Error (400) - Wrong stage:**
```json
{
  "success": false,
  "message": "Cannot advance book from 'published' status. Book must be in formatting, designing, or printing stage."
}
```

---

### 1.4 Update Book Status (Manual Override)

```
PUT /admin/books/:bookId/status
```

Manual status override for any book. Use for edge cases — prefer approve/decline/stage for normal flow.

**Body:**
```json
{
  "status": "in_progress",
  "rejectionReason": "Only required when status is 'rejected'"
}
```

**Valid status values:** `draft` `pending` `payment_pending` `in_progress` `formatting` `designing` `printing` `published` `rejected`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book status updated successfully",
  "data": { "book": { ...updated book... } }
}
```

---

### 1.5 Update Product Links

```
PUT /admin/books/:bookId/product-links
```

Sets the selling URL and/or rating for a single platform on a book. Call once per platform.

**Body:**
```json
{
  "platform": "Amazon",
  "productLink": "https://amazon.in/dp/B0XXXXXXXX",
  "rating": 4
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `platform` | string | Yes | Must match a platform in `book.marketplaces` |
| `productLink` | string | No | Omit for offline platforms |
| `rating` | number | No | 0–5 |

> **Offline platforms** (`1200 Offline Channels`, `150+ Other Sellers`): do not send `productLink` — it will be ignored.

**Side Effects:**
- `book.platformWiseSales[platform]` updated with `{ sellingUnits, productLink?, rating? }`

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
        "1200 Offline Channels": { "sellingUnits": 0, "rating": 3 }
      }
    }
  }
}
```

---

## 2. PAYMENT MANAGEMENT

### 2.1 Create Payment Request

```
POST /admin/books/:bookId/payment-request
```

Raises an additional payment request for a book (e.g. extra services). Author sees it as a notification card on their dashboard.

**Body:**
```json
{
  "serviceType": "exclusive",
  "amount": 2000,
  "description": "Premium cover redesign requested by author"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `serviceType` | string | Yes | `inclusive` or `exclusive` |
| `amount` | number | Yes | Amount in INR |
| `description` | string | Yes | Shown to author in email and dashboard |

**Side Effects:**
- Entry added to `book.paymentRequests[]` with `status: "pending"`
- Payment request notification email sent to author

**Success Response (201):**
```json
{
  "success": true,
  "message": "Payment request created successfully",
  "data": {
    "book": {
      "bookId": "BK00001",
      "paymentRequests": [
        {
          "amount": 2000,
          "serviceType": "exclusive",
          "description": "Premium cover redesign requested by author",
          "status": "pending",
          "createdAt": "2026-04-15T08:00:00.000Z"
        }
      ]
    }
  }
}
```

---

### 2.2 Extend Pay Later Due Date

```
PUT /admin/books/:bookId/extend-due-date
```

Extends the payment due date for a book on the `pay_later` plan.

**Body:**
```json
{
  "newDueDate": "2026-04-30"
}
```

**Side Effects:**
- `book.paymentStatus.dueDate` updated

**Success Response (200):**
```json
{
  "success": true,
  "message": "Due date extended successfully",
  "data": {
    "book": {
      "bookId": "BK00001",
      "paymentStatus": {
        "dueDate": "2026-04-30T00:00:00.000Z"
      }
    }
  }
}
```

---

## 3. REFERRAL MANAGEMENT

### 3.1 Get All Referrals

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
    "referrals": [
      {
        "_id": "69df249f...",
        "referrerId": "AUT638460",
        "referredAuthorId": "AUT636513",
        "referralCode": "XKY3E0PX",
        "earningPercentage": 0,
        "commissionAmount": 0,
        "status": "pending",
        "isActive": true,
        "createdAt": "2026-04-15T05:39:43.870Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

### 3.2 Get Referral Statistics

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

### 3.3 Set Commission Amount

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

**Error (400) - Already completed:**
```json
{
  "success": false,
  "message": "Cannot update completed referral commission"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Commission amount updated successfully",
  "data": {
    "referral": {
      "_id": "69df249f...",
      "commissionAmount": 500,
      "status": "pending"
    }
  }
}
```

---

### 3.4 Process Referral Commission

```
POST /referrals/:referralId/process
```

Marks the referral as `completed`, creates a Transaction, and credits the referrer's `totalEarnings`.

**Body:** *(none)*

**Side Effects:**
- `referral.status` → `completed`
- `Transaction` created: `{ type: "referral_commission", amount: commissionAmount, status: "completed" }`
- `author.totalEarnings` incremented by `commissionAmount`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Referral commission processed successfully",
  "data": {
    "referral": {
      "_id": "69df249f...",
      "commissionAmount": 500,
      "status": "completed"
    }
  }
}
```

**Error (400) - Already done:**
```json
{
  "success": false,
  "message": "Commission already processed"
}
```

---

## 4. REVIEWS

### 4.1 Get All Reviews

```
GET /reviews/admin?page=1&limit=20&search=great&rating=5
```

**Query Params:**

| Param | Type | Notes |
|---|---|---|
| `page` | number | Default: 1 |
| `limit` | number | Default: 20 |
| `search` | string | Searches review text |
| `rating` | number | Filter by star rating (1–5) |

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

### 4.2 Edit Review

```
PUT /reviews/admin/:id
```

Admin can update rating, text, or toggle visibility.

**Body (all optional):**
```json
{
  "rating": 3,
  "review": "Edited for compliance.",
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

### 4.3 Delete Review

```
DELETE /reviews/admin/:id
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## 5. PLATFORM STATS

### 5.1 Get Platform Stats

```
GET /admin/stats
```

Returns dashboard KPIs and charts.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalAuthors": 42,
      "totalBooks": 18,
      "totalRevenue": 185000,
      "totalTransactions": 63,
      "activeTickets": 5
    },
    "tierDistribution": [
      { "_id": "free", "count": 38 },
      { "_id": "premium", "count": 4 }
    ],
    "monthlyRevenue": [
      { "_id": { "year": 2026, "month": 3 }, "revenue": 42000 },
      { "_id": { "year": 2026, "month": 4 }, "revenue": 31500 }
    ]
  }
}
```

---

## 6. AUDIT LOGS

### 6.1 Get Audit Logs

```
GET /admin/audit-logs?page=1&limit=50
```

**Query Params:**

| Param | Type | Notes |
|---|---|---|
| `page` | number | Default: 1 |
| `limit` | number | Default: 50 |
| `action` | string | Filter: `create` `update` `delete` `login` `logout` `restrict` `activate` `payment` `status_change` `other` |
| `resource` | string | Filter: `Author` `Book` `PricingConfig` etc. |
| `userId` | string | Filter by admin user ID |
| `startDate` | date | ISO date string |
| `endDate` | date | ISO date string |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "64abc...",
        "userId": "USR000001",
        "action": "status_change",
        "resource": "Book",
        "resourceId": "BK00001",
        "details": {
          "adminId": "USR000001",
          "oldStatus": "pending",
          "newStatus": "formatting",
          "action": "approve"
        },
        "ipAddress": "::1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2026-04-15T06:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 50,
      "pages": 3
    }
  }
}
```

---

## Quick Reference

| Module | Method | Endpoint |
|---|---|---|
| Book | PUT | `/admin/books/:bookId/approve` |
| Book | PUT | `/admin/books/:bookId/decline` |
| Book | PUT | `/admin/books/:bookId/stage` |
| Book | PUT | `/admin/books/:bookId/status` |
| Book | PUT | `/admin/books/:bookId/product-links` |
| Payment | POST | `/admin/books/:bookId/payment-request` |
| Payment | PUT | `/admin/books/:bookId/extend-due-date` |
| Referral | GET | `/referrals` |
| Referral | GET | `/referrals/stats` |
| Referral | PUT | `/referrals/:referralId/commission` |
| Referral | POST | `/referrals/:referralId/process` |
| Reviews | GET | `/reviews/admin` |
| Reviews | PUT | `/reviews/admin/:id` |
| Reviews | DELETE | `/reviews/admin/:id` |
| Stats | GET | `/admin/stats` |
| Audit | GET | `/admin/audit-logs` |
