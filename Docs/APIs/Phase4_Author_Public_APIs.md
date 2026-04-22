# POVITAL - Phase 4: Author & Public APIs

> **Base URL:** `http://localhost:5000/api`
> **Content-Type:** `application/json`

---

## 1. AUTHOR — ROYALTY

> **Auth:** All author endpoints require `Authorization: Bearer <token>` (Author role)

### 1.1 Get My Royalty Monthly Summary
```
GET /author/royalties
```
Returns a list of months with royalty totals. Each entry represents one calendar month across all books.

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
    "summary": {
      "totalEarnings": 52000,
      "totalSoldUnits": 1200
    },
    "months": [
      {
        "month": 4,
        "year": 2026,
        "sellingUnits": 370,
        "netRoyalty": 18095,
        "paymentDate": "2026-04-10T00:00:00.000Z",
        "status": "paid",
        "recordCount": 1
      },
      {
        "month": 3,
        "year": 2026,
        "sellingUnits": 280,
        "netRoyalty": 13500,
        "paymentDate": "2026-03-12T00:00:00.000Z",
        "status": "paid",
        "recordCount": 2
      }
    ],
    "pagination": { "total": 6, "page": 1, "limit": 12, "pages": 1 }
  }
}
```

**Status Values:**
| Value | Meaning |
|---|---|
| `pending` | At least one book royalty not yet released |
| `paid` | All book royalties released for that month |

---

### 1.2 Get Monthly Royalty Detail
```
GET /author/royalties/:year/:month
```
Returns full breakdown for a specific month — per book, per platform, and payment proof.

**Path Params:**
| Param | Description |
|---|---|
| year | e.g. `2026` |
| month | e.g. `4` (April) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totals": {
      "month": 4,
      "year": 2026,
      "totalNetRoyalty": 18095,
      "totalSellingUnits": 370,
      "status": "paid",
      "paymentDate": "2026-04-10T08:30:00.000Z",
      "paymentMode": "NEFT",
      "transactionReference": "NEFT2026041012345",
      "paymentProof": "https://res.cloudinary.com/.../proof.pdf"
    },
    "books": [
      {
        "bookId": "BK00000001",
        "bookName": "My First Book",
        "subtitle": "A Journey Begins",
        "coverPage": "https://res.cloudinary.com/.../cover.jpg",
        "publishedDate": "2025-01-15T00:00:00.000Z",
        "netSellingUnits": 370,
        "totalRevenue": 48400,
        "netProfit": 25850,
        "authorRoyalty": 18095,
        "finalRoyalty": 18095,
        "status": "paid",
        "paymentDate": "2026-04-10T08:30:00.000Z",
        "paymentMode": "NEFT",
        "transactionReference": "NEFT2026041012345",
        "paymentProof": "https://res.cloudinary.com/.../proof.pdf",
        "platformSales": [
          { "platform": "Amazon",                "sellingUnits": 110, "sellingPricePerUnit": 100, "totalRevenue": 11000 },
          { "platform": "Flipkart",              "sellingUnits": 100, "sellingPricePerUnit": 120, "totalRevenue": 12000 },
          { "platform": "Meesho",                "sellingUnits": 40,  "sellingPricePerUnit": 125, "totalRevenue": 5000  },
          { "platform": "Distribution Channels", "sellingUnits": 120, "sellingPricePerUnit": 170, "totalRevenue": 20400 }
        ]
      }
    ]
  }
}
```

**Error (404) — No data for that period:**
```json
{
  "success": false,
  "message": "No royalty data found for this period"
}
```

---

## 2. AUTHOR — SUPPORT / HELP CENTER

> **Auth:** All support endpoints require `Authorization: Bearer <token>` (Author role)

### 2.1 Submit Support Ticket
```
POST /tickets
```
**Auth:** Author

**Body:**
```json
{
  "title": "Royalty payment not received",
  "category": "Royalty",
  "priority": "high",
  "description": "My April 2026 royalty has not been credited to my bank account yet. Please look into this.",
  "discussionDay": "Tomorrow",
  "discussionTimeSlot1": "10:00 AM - 11:00 AM",
  "discussionTimeSlot2": "02:00 PM - 03:00 PM"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | Yes | Subject / topic of the issue |
| category | string | Yes | See category values below |
| priority | string | No | `low`, `medium`, `high` — default `medium` |
| description | string | Yes | Detailed description |
| discussionDay | string | No | `Today`, `Tomorrow`, `Day After Tomorrow` |
| discussionTimeSlot1 | string | No | Preferred time slot 1 |
| discussionTimeSlot2 | string | No | Preferred time slot 2 |

**Category Values:** `Royalty`, `Book Publishing`, `Account`, `Payment`, `Technical`, `Other`

**Success Response (201):**
```json
{
  "success": true,
  "message": "Support ticket created successfully",
  "data": {
    "ticket": {
      "ticketId": "TKT000001",
      "authorId": "ATH00000001",
      "title": "Royalty payment not received",
      "category": "Royalty",
      "priority": "high",
      "status": "pending",
      "description": "My April 2026 royalty has not been credited...",
      "discussionDay": "Tomorrow",
      "discussionTimeSlot1": "10:00 AM - 11:00 AM",
      "discussionTimeSlot2": "02:00 PM - 03:00 PM",
      "createdAt": "2026-04-16T09:00:00.000Z"
    }
  }
}
```

---

### 2.2 Get My Tickets
```
GET /tickets
```
**Auth:** Author

**Query Params:**
| Param | Type | Description |
|---|---|---|
| page | number | Default 1 |
| limit | number | Default 10 |
| status | string | `pending`, `in_progress`, `resolved`, `closed` |
| category | string | Filter by category |
| sortBy | string | Default `createdAt` |
| sortOrder | string | `asc` or `desc` — default `desc` |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "ticketId": "TKT000001",
        "title": "Royalty payment not received",
        "category": "Royalty",
        "priority": "high",
        "status": "in_progress",
        "discussionDay": "Tomorrow",
        "discussionTimeSlot1": "10:00 AM - 11:00 AM",
        "discussionTimeSlot2": "02:00 PM - 03:00 PM",
        "createdAt": "2026-04-16T09:00:00.000Z"
      }
    ],
    "pagination": { "total": 3, "page": 1, "limit": 10, "pages": 1 }
  }
}
```

---

### 2.3 Get Single Ticket with Messages
```
GET /tickets/:ticketId
```
**Auth:** Author (own tickets only) or Admin

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
      "title": "Royalty payment not received",
      "category": "Royalty",
      "priority": "high",
      "status": "in_progress",
      "description": "My April 2026 royalty has not been credited...",
      "discussionDay": "Tomorrow",
      "discussionTimeSlot1": "10:00 AM - 11:00 AM",
      "discussionTimeSlot2": "02:00 PM - 03:00 PM",
      "assignedTo": "USR00000001",
      "createdAt": "2026-04-16T09:00:00.000Z"
    },
    "messages": [
      {
        "ticketId": "TKT000001",
        "senderId": "ATH00000001",
        "senderRole": "author",
        "message": "Please check my account, the April payment is pending.",
        "attachments": [],
        "createdAt": "2026-04-16T09:05:00.000Z"
      },
      {
        "ticketId": "TKT000001",
        "senderId": "USR00000001",
        "senderRole": "admin",
        "message": "We are looking into this, will update you shortly.",
        "attachments": [],
        "createdAt": "2026-04-16T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 2.4 Send Chat Message
```
POST /tickets/:ticketId/messages
```
**Auth:** Author (own tickets only) or Admin
**Content-Type:** `multipart/form-data`

**Path Params:**
| Param | Description |
|---|---|
| ticketId | e.g. `TKT000001` |

**Form Fields:**
| Field | Type | Required | Notes |
|---|---|---|---|
| message | string | Yes | Message text |
| attachment | file | No | Image or PDF |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Message added successfully",
  "data": {
    "message": {
      "ticketId": "TKT000001",
      "senderId": "ATH00000001",
      "senderRole": "author",
      "message": "I am still waiting, please expedite.",
      "attachments": [],
      "createdAt": "2026-04-16T11:00:00.000Z"
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

### 2.5 Close My Ticket
```
PUT /tickets/:ticketId/status
```
**Auth:** Author (own tickets only — can only set status to `closed`)

**Body:**
```json
{
  "status": "closed"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ticket closed successfully",
  "data": {
    "ticket": {
      "ticketId": "TKT000001",
      "status": "closed",
      "resolvedAt": "2026-04-16T12:00:00.000Z"
    }
  }
}
```

**Error (403) — Author tries to set non-closed status:**
```json
{
  "success": false,
  "message": "Authors can only close tickets"
}
```

---

## 3. PUBLIC — AUTHOR LISTING & DETAIL

> **Auth:** None — all public endpoints are unauthenticated.

### 3.1 Get Public Author Listing
```
GET /public/authors
```

**Query Params:**
| Param | Type | Description |
|---|---|---|
| page | number | Default 1 |
| limit | number | Default 20 |
| search | string | Search by first name or last name |
| language | string | Filter by book language (e.g. `Hindi`, `English`) |

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
        "profilePicture": "https://res.cloudinary.com/.../photo.jpg",
        "location": "Mumbai, Maharashtra",
        "booksPublished": 3,
        "languages": ["Hindi", "English"],
        "totalSoldUnits": 1200,
        "totalEarnings": 52000
      }
    ],
    "pagination": { "total": 8, "page": 1, "limit": 20, "pages": 1 }
  }
}
```

> Only active (non-restricted) authors who have at least one published book are returned.

---

### 3.2 Get Public Author Detail
```
GET /public/authors/:authorId
```

**Path Params:**
| Param | Description |
|---|---|
| authorId | e.g. `ATH00000001` |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "author": {
      "authorId": "ATH00000001",
      "firstName": "Ravi",
      "lastName": "Sharma",
      "profilePicture": "https://res.cloudinary.com/.../photo.jpg",
      "location": "Mumbai, Maharashtra",
      "totalBooks": 3,
      "totalSoldUnits": 1200,
      "avgRating": 4.5,
      "reviewCount": 5
    },
    "books": [
      {
        "bookId": "BK00000001",
        "bookName": "My First Book",
        "subtitle": "A Journey Begins",
        "coverPage": "https://res.cloudinary.com/.../cover.jpg",
        "language": "Hindi",
        "bookType": "Paperback",
        "actualLaunchDate": "2025-01-15T00:00:00.000Z",
        "totalSellingUnits": 1200,
        "marketplaces": ["Amazon", "Flipkart"]
      }
    ],
    "recentReviews": [
      {
        "rating": 5,
        "reviewText": "Excellent book, loved it!",
        "reviewerName": "Priya",
        "createdAt": "2026-03-10T00:00:00.000Z"
      }
    ]
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Author not found"
}
```

---

## 4. PUBLIC — BOOK LISTING & DETAIL

### 4.1 Get Public Book Listing
```
GET /public/books
```

**Query Params:**
| Param | Type | Description |
|---|---|---|
| page | number | Default 1 |
| limit | number | Default 20 |
| search | string | Search by book name or subtitle |
| authorName | string | Filter by author first/last name |
| authorId | string | Filter by author ID |
| bookType | string | `Paperback`, `Hardcover`, `E-Book` |
| language | string | e.g. `Hindi`, `English` |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "bookId": "BK00000001",
        "bookName": "My First Book",
        "subtitle": "A Journey Begins",
        "coverPage": "https://res.cloudinary.com/.../cover.jpg",
        "language": "Hindi",
        "bookType": "Paperback",
        "actualLaunchDate": "2025-01-15T00:00:00.000Z",
        "totalSellingUnits": 1200,
        "marketplaces": ["Amazon", "Flipkart", "Meesho"],
        "sellingPrice": 299,
        "authorId": "ATH00000001",
        "authorName": "Ravi Sharma"
      }
    ],
    "pagination": { "total": 10, "page": 1, "limit": 20, "pages": 1 }
  }
}
```

---

### 4.2 Get Public Book Detail
```
GET /public/books/:bookId
```

**Path Params:**
| Param | Description |
|---|---|
| bookId | e.g. `BK00000001` |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "book": {
      "bookId": "BK00000001",
      "bookName": "My First Book",
      "subtitle": "A Journey Begins",
      "coverPage": "https://res.cloudinary.com/.../cover.jpg",
      "language": "Hindi",
      "bookType": "Paperback",
      "targetAudience": "General",
      "actualLaunchDate": "2025-01-15T00:00:00.000Z",
      "totalSellingUnits": 1200,
      "marketplaces": ["Amazon", "Flipkart"],
      "platformWiseSales": {
        "Amazon": {
          "sellingUnits": 700,
          "productLink": "https://amazon.in/...",
          "rating": 4.5
        },
        "Flipkart": {
          "sellingUnits": 500,
          "productLink": "https://flipkart.com/...",
          "rating": 4.3
        }
      },
      "sellingPrice": 299
    },
    "author": {
      "authorId": "ATH00000001",
      "firstName": "Ravi",
      "lastName": "Sharma",
      "profilePicture": "https://res.cloudinary.com/.../photo.jpg",
      "location": "Mumbai, Maharashtra"
    }
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Book not found"
}
```
