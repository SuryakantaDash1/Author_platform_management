# POVITAL - Phase 4: Admin APIs

> **Base URL:** `http://localhost:5000/api`
> **Content-Type:** `application/json`
> **Auth:** All endpoints require `Authorization: Bearer <token>` (Super Admin or Sub Admin role)

---

## 1. SELLING DATA

### 1.1 Submit / Update Selling Data
```
POST /admin/selling
```
**Auth:** Admin (super_admin / sub_admin)

Creates a new selling record for the given book + month + year. If a record already exists for that period, it is updated (upsert). All financial calculations are performed server-side only.

**Body:**
```json
{
  "bookId": "BK00000001",
  "month": 4,
  "year": 2026,
  "platformSales": [
    { "platform": "Amazon",                "sellingUnits": 110, "sellingPricePerUnit": 100 },
    { "platform": "Flipkart",              "sellingUnits": 100, "sellingPricePerUnit": 120 },
    { "platform": "Meesho",                "sellingUnits": 40,  "sellingPricePerUnit": 125 },
    { "platform": "Distribution Channels", "sellingUnits": 120, "sellingPricePerUnit": 170 }
  ],
  "costPerBook": 50,
  "adsCostPerUnit": 5,
  "platformFees": 0,
  "returnsExchangeAmount": 1500,
  "outstandingAmount": 700
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| bookId | string | Yes | Must be a published book |
| month | number | Yes | 1–12 |
| year | number | Yes | e.g. 2026 |
| platformSales | array | Yes | At least one entry |
| platformSales[].platform | string | Yes | Platform name |
| platformSales[].sellingUnits | number | Yes | Manual admin input |
| platformSales[].sellingPricePerUnit | number | Yes | Manual admin input |
| costPerBook | number | No | Default 0 |
| adsCostPerUnit | number | No | Default 0 |
| platformFees | number | No | Default 0 |
| returnsExchangeAmount | number | No | Default 0 |
| outstandingAmount | number | No | Default 0 |

**Success Response (201 — new / 200 — updated):**
```json
{
  "success": true,
  "message": "Selling data submitted successfully",
  "data": {
    "sellingRecord": {
      "sellingRecordId": "SLR00000001",
      "bookId": "BK00000001",
      "authorId": "ATH00000001",
      "month": 4,
      "year": 2026,
      "platformSales": [
        { "platform": "Amazon",                "sellingUnits": 110, "sellingPricePerUnit": 100, "totalRevenue": 11000 },
        { "platform": "Flipkart",              "sellingUnits": 100, "sellingPricePerUnit": 120, "totalRevenue": 12000 },
        { "platform": "Meesho",                "sellingUnits": 40,  "sellingPricePerUnit": 125, "totalRevenue": 5000  },
        { "platform": "Distribution Channels", "sellingUnits": 120, "sellingPricePerUnit": 170, "totalRevenue": 20400 }
      ],
      "costPerBook": 50,
      "adsCostPerUnit": 5,
      "platformFees": 0,
      "returnsExchangeAmount": 1500,
      "outstandingAmount": 700,
      "totalSellingUnits": 370,
      "totalRevenue": 48400,
      "productionCost": 18500,
      "grossMargin": 29900,
      "adsCost": 1850,
      "netProfit": 25850,
      "royaltyPercentage": 70,
      "authorRoyalty": 18095
    },
    "royaltyRecord": {
      "royaltyRecordId": "RYR00000001",
      "authorId": "ATH00000001",
      "bookId": "BK00000001",
      "month": 4,
      "year": 2026,
      "authorRoyalty": 18095,
      "referralDeduction": 0,
      "outstandingDeduction": 0,
      "finalRoyalty": 18095,
      "status": "pending"
    },
    "financials": {
      "totalSellingUnits": 370,
      "totalRevenue": 48400,
      "productionCost": 18500,
      "grossMargin": 29900,
      "adsCost": 1850,
      "platformFees": 0,
      "returnsExchangeAmount": 1500,
      "outstandingAmount": 700,
      "netProfit": 25850,
      "royaltyPercentage": 70,
      "authorRoyalty": 18095
    }
  }
}
```

**Error (400) — Book not published:**
```json
{
  "success": false,
  "message": "Book must be published to record selling data"
}
```

---

### 1.2 Preview Financial Calculation (No Save)
```
POST /admin/selling/preview
```
**Auth:** Admin

Calculates and returns all financials without saving to the database. Useful for showing live calculations before the admin confirms submission.

**Body:** Same structure as `POST /admin/selling` (month and year not required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "platformBreakdown": [
      { "platform": "Amazon", "sellingUnits": 110, "sellingPricePerUnit": 100, "totalRevenue": 11000 }
    ],
    "financials": {
      "totalSellingUnits": 370,
      "totalRevenue": 48400,
      "productionCost": 18500,
      "grossMargin": 29900,
      "adsCost": 1850,
      "platformFees": 0,
      "returnsExchangeAmount": 1500,
      "outstandingAmount": 700,
      "netProfit": 25850,
      "royaltyPercentage": 70,
      "authorRoyalty": 18095
    }
  }
}
```

---

### 1.3 Get Selling History for a Book
```
GET /admin/selling/:bookId
```
**Auth:** Admin

**Path Params:**
| Param | Description |
|---|---|
| bookId | e.g. `BK00000001` |

**Query Params:**
| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 12 | Records per page |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "book": {
      "bookId": "BK00000001",
      "bookName": "My First Book",
      "authorId": "ATH00000001",
      "royaltyPercentage": 70
    },
    "records": [
      {
        "sellingRecordId": "SLR00000001",
        "bookId": "BK00000001",
        "month": 4,
        "year": 2026,
        "totalSellingUnits": 370,
        "totalRevenue": 48400,
        "grossMargin": 29900,
        "netProfit": 25850,
        "authorRoyalty": 18095,
        "platformSales": [ ... ]
      }
    ],
    "pagination": { "total": 6, "page": 1, "limit": 12, "pages": 1 }
  }
}
```

---

## 2. ROYALTY MANAGEMENT

### 2.1 Get Royalty Listing (All Authors)
```
GET /admin/royalties
```
**Auth:** Admin

**Query Params:**
| Param | Type | Description |
|---|---|---|
| page | number | Default 1 |
| limit | number | Default 20 |
| search | string | Search by author name or author ID |
| status | string | `pending` or `paid` |
| authorId | string | Filter by specific author |
| fromDate | string | ISO date string |
| toDate | string | ISO date string |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "authors": [
      {
        "authorId": "ATH00000001",
        "firstName": "Ravi",
        "lastName": "Sharma",
        "location": "Mumbai, Maharashtra",
        "totalBooks": 3,
        "totalBookUnits": 1200,
        "lastRoyalty": 18095,
        "lastRoyaltyDate": "2026-04-10T00:00:00.000Z",
        "netRoyalty": 52000,
        "pendingCount": 1,
        "paidCount": 4
      }
    ],
    "pagination": { "total": 15, "page": 1, "limit": 20, "pages": 1 }
  }
}
```

---

### 2.2 Get Per-Author Royalty Detail
```
GET /admin/royalties/author/:authorId
```
**Auth:** Admin

**Path Params:**
| Param | Description |
|---|---|
| authorId | e.g. `ATH00000001` |

**Query Params:** `page`, `limit`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "author": {
      "authorId": "ATH00000001",
      "firstName": "Ravi",
      "lastName": "Sharma",
      "email": "ravi@example.com",
      "totalEarnings": 52000,
      "totalBooks": 3
    },
    "records": [
      {
        "royaltyRecordId": "RYR00000001",
        "bookId": "BK00000001",
        "bookName": "My First Book",
        "month": 4,
        "year": 2026,
        "authorRoyalty": 18095,
        "referralDeduction": 0,
        "outstandingDeduction": 0,
        "finalRoyalty": 18095,
        "status": "pending",
        "paymentDate": null
      }
    ],
    "pagination": { "total": 5, "page": 1, "limit": 12, "pages": 1 }
  }
}
```

---

### 2.3 Get Royalty Records for a Book
```
GET /admin/royalties/book/:bookId
```
**Auth:** Admin

**Path Params:**
| Param | Description |
|---|---|
| bookId | e.g. `BK00000001` |

**Query Params:** `page`, `limit`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "book": {
      "bookId": "BK00000001",
      "bookName": "My First Book",
      "authorId": "ATH00000001"
    },
    "records": [
      {
        "royaltyRecordId": "RYR00000001",
        "month": 4,
        "year": 2026,
        "authorRoyalty": 18095,
        "finalRoyalty": 18095,
        "status": "pending"
      }
    ],
    "pagination": { "total": 3, "page": 1, "limit": 12, "pages": 1 }
  }
}
```

---

### 2.4 Release Royalty Payment
```
POST /admin/royalties/release
```
**Auth:** Admin
**Content-Type:** `multipart/form-data`

Marks a royalty record as paid, creates a transaction, and sends confirmation email to the author.

> **Note:** Payment records are immutable after submission. Only Super Admin can edit post-release via audit trail.

**Form Fields:**
| Field | Type | Required | Notes |
|---|---|---|---|
| royaltyRecordId | string | Yes | e.g. `RYR00000001` |
| bankAccountId | string | Yes | Author's bank account ID |
| paymentMode | string | Yes | `NEFT`, `IMPS`, `UPI`, `PhonePe`, `GPay`, etc. |
| transactionReference | string | No | Bank transaction reference |
| referralDeduction | number | No | Defaults to 0 |
| outstandingDeduction | number | No | Defaults to 0 |
| paymentProof | file | No | Image or PDF — uploaded to Cloudinary |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Royalty payment released successfully",
  "data": {
    "royaltyRecord": {
      "royaltyRecordId": "RYR00000001",
      "authorId": "ATH00000001",
      "bookId": "BK00000001",
      "month": 4,
      "year": 2026,
      "authorRoyalty": 18095,
      "referralDeduction": 0,
      "outstandingDeduction": 0,
      "finalRoyalty": 18095,
      "status": "paid",
      "bankAccountId": "BA00000001",
      "paymentMode": "NEFT",
      "transactionReference": "NEFT2026041012345",
      "paymentProof": "https://res.cloudinary.com/.../proof.pdf",
      "paymentDate": "2026-04-10T08:30:00.000Z",
      "transactionId": "TXN00000001"
    },
    "transactionId": "TXN00000001"
  }
}
```

**Error (400) — Already paid:**
```json
{
  "success": false,
  "message": "Royalty already paid"
}
```

---

## 3. SUPPORT / HELP CENTER

### 3.1 Get All Tickets (with Filters)
```
GET /admin/tickets
```
**Auth:** Admin

**Query Params:**
| Param | Type | Description |
|---|---|---|
| page | number | Default 1 |
| limit | number | Default 20 |
| search | string | Search by title, description, or ticket ID |
| status | string | `pending`, `in_progress`, `resolved`, `closed` |
| category | string | Ticket category |
| priority | string | `low`, `medium`, `high` |
| authorId | string | Filter by specific author |
| assignedTo | string | Filter by assigned admin user ID |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "ticketId": "TKT000001",
        "authorId": "ATH00000001",
        "title": "Issue with royalty payment",
        "category": "Royalty",
        "priority": "high",
        "status": "pending",
        "description": "My April royalty has not been released yet.",
        "discussionDay": "Tomorrow",
        "discussionTimeSlot1": "10:00 AM - 11:00 AM",
        "discussionTimeSlot2": "02:00 PM - 03:00 PM",
        "assignedTo": null,
        "createdAt": "2026-04-15T10:30:00.000Z"
      }
    ],
    "pagination": { "total": 12, "page": 1, "limit": 20, "pages": 1 }
  }
}
```

---

### 3.2 Get Ticket Statistics
```
GET /admin/tickets/stats
```
**Auth:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalTickets": 45,
      "openTickets": 12,
      "inProgressTickets": 8,
      "resolvedTickets": 20,
      "closedTickets": 5,
      "avgResolutionTimeHours": 18.5
    },
    "categoryDistribution": [
      { "_id": "Royalty", "count": 15 },
      { "_id": "Book Publishing", "count": 10 }
    ],
    "priorityDistribution": [
      { "_id": "high", "count": 8 },
      { "_id": "medium", "count": 25 },
      { "_id": "low", "count": 12 }
    ]
  }
}
```

---

### 3.3 Get Single Ticket with Messages
```
GET /tickets/:ticketId
```
**Auth:** Admin or Ticket Owner (Author)

**Path Params:**
| Param | Description |
|---|---|
| ticketId | e.g. `TKT000001` |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "ticketId": "TKT000001",
      "authorId": "ATH00000001",
      "title": "Issue with royalty payment",
      "category": "Royalty",
      "priority": "high",
      "status": "in_progress",
      "description": "My April royalty has not been released yet.",
      "discussionDay": "Tomorrow",
      "discussionTimeSlot1": "10:00 AM - 11:00 AM",
      "discussionTimeSlot2": "02:00 PM - 03:00 PM",
      "assignedTo": "USR00000001",
      "resolvedAt": null,
      "createdAt": "2026-04-15T10:30:00.000Z"
    },
    "messages": [
      {
        "ticketId": "TKT000001",
        "senderId": "ATH00000001",
        "senderRole": "author",
        "message": "Please check my account, the April payment is pending.",
        "attachments": [],
        "createdAt": "2026-04-15T10:35:00.000Z"
      },
      {
        "ticketId": "TKT000001",
        "senderId": "USR00000001",
        "senderRole": "admin",
        "message": "We are looking into this, will update you shortly.",
        "attachments": [],
        "createdAt": "2026-04-15T11:00:00.000Z"
      }
    ]
  }
}
```

---

### 3.4 Send Message in Ticket (Chat)
```
POST /tickets/:ticketId/messages
```
**Auth:** Admin or Ticket Owner (Author)
**Content-Type:** `multipart/form-data`

**Path Params:**
| Param | Description |
|---|---|
| ticketId | e.g. `TKT000001` |

**Form Fields:**
| Field | Type | Required | Notes |
|---|---|---|---|
| message | string | Yes | Message text |
| attachment | file | No | Image or PDF — uploaded to Cloudinary |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Message added successfully",
  "data": {
    "message": {
      "ticketId": "TKT000001",
      "senderId": "USR00000001",
      "senderRole": "admin",
      "message": "We are looking into this, will update you shortly.",
      "attachments": ["https://res.cloudinary.com/.../file.pdf"],
      "createdAt": "2026-04-15T11:00:00.000Z"
    }
  }
}
```

**Error (400) — Closed ticket:**
```json
{
  "success": false,
  "message": "Cannot add message to a closed ticket"
}
```

---

### 3.5 Update Ticket Status (Admin)
```
PUT /admin/tickets/:ticketId/status
```
**Auth:** Admin

**Path Params:**
| Param | Description |
|---|---|
| ticketId | e.g. `TKT000001` |

**Body:**
```json
{
  "status": "resolved"
}
```

**Valid Status Values:** `pending`, `in_progress`, `resolved`, `closed`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ticket resolved successfully",
  "data": {
    "ticket": {
      "ticketId": "TKT000001",
      "status": "resolved",
      "resolvedAt": "2026-04-16T09:00:00.000Z"
    }
  }
}
```

> A system message is automatically created in the ticket chat when status changes.

---

### 3.6 Assign Ticket to Admin
```
PUT /admin/tickets/:ticketId/assign
```
**Auth:** Admin

**Body:**
```json
{
  "assignedTo": "USR00000001"
}
```

> Pass `assignedTo: null` to unassign. Status auto-changes to `in_progress` on assign, `pending` on unassign.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ticket assignment updated",
  "data": { "ticket": { "ticketId": "TKT000001", "assignedTo": "USR00000001", "status": "in_progress" } }
}
```

---

## 4. PUBLIC WEBSITE (Read-Only, No Auth)

> These endpoints are also documented in [Phase4_Public_APIs.md](./Phase4_Public_APIs.md). Listed here for admin reference only.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/public/authors` | Public author listing |
| GET | `/public/authors/:authorId` | Public author detail |
| GET | `/public/books` | Public book listing |
| GET | `/public/books/:bookId` | Public book detail |
