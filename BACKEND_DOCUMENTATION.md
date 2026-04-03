# BACKEND API DOCUMENTATION
## Author Platform Management System - POVITAL

**Version:** 1.0.0
**Base URL:** `http://localhost:5000/api/v1`
**Tech Stack:** Node.js, Express.js, MongoDB, TypeScript

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Endpoints](#api-endpoints)
5. [Business Logic & Calculations](#business-logic--calculations)
6. [Error Handling](#error-handling)
7. [File Upload](#file-upload)
8. [Notifications](#notifications)

---

## System Architecture

### Folder Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── cloudinary.ts
│   │   └── env.ts
│   ├── models/
│   │   ├── User.model.ts
│   │   ├── Author.model.ts
│   │   ├── Book.model.ts
│   │   ├── Transaction.model.ts
│   │   ├── BankAccount.model.ts
│   │   ├── Ticket.model.ts
│   │   ├── Message.model.ts
│   │   ├── Referral.model.ts
│   │   ├── PricingConfig.model.ts
│   │   └── AuditLog.model.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── author.controller.ts
│   │   ├── book.controller.ts
│   │   ├── financial.controller.ts
│   │   ├── support.controller.ts
│   │   └── referral.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   ├── sms.service.ts
│   │   ├── royalty.service.ts
│   │   └── upload.service.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── upload.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── author.routes.ts
│   │   ├── book.routes.ts
│   │   ├── financial.routes.ts
│   │   └── support.routes.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── author.validator.ts
│   │   └── book.validator.ts
│   ├── utils/
│   │   ├── ApiResponse.ts
│   │   ├── ApiError.ts
│   │   ├── logger.ts
│   │   └── helpers.ts
│   ├── types/
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
├── uploads/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Database Schema

### 1. User Schema (Admin/Sub-Admin)
```typescript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  role: Enum['super_admin', 'sub_admin'] (default: 'sub_admin'),
  permissions: {
    authors: Boolean,
    books: Boolean,
    financial: Boolean,
    support: Boolean,
    configuration: Boolean
  },
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Author Schema
```typescript
{
  _id: ObjectId,
  authorId: String (unique, auto-generated: "AUT" + 6 digits),
  profilePicture: String (URL),
  firstName: String (required),
  lastName: String (required),
  email: String (unique, required),
  phone: String (unique, required, 10 digits),
  password: String (hashed, required),

  // Academic
  qualification: String,
  university: String,

  // Address
  address: {
    houseNo: String,
    landmark: String,
    pinCode: String,
    city: String (auto-filled),
    district: String (auto-filled),
    state: String (auto-filled),
    country: String (auto-filled)
  },

  // Status
  isEmailVerified: Boolean (default: false),
  isPhoneVerified: Boolean (default: false),
  isRestricted: Boolean (default: false),
  restrictionReason: String,

  // Referral
  referralCode: String (unique, auto-generated),
  referredBy: String (referral code),

  // Stats
  totalBooks: Number (default: 0),
  publishedBooks: Number (default: 0),
  totalEarnings: Number (default: 0),
  totalSales: Number (default: 0),

  createdAt: Date,
  updatedAt: Date
}
```

### 3. Book Schema
```typescript
{
  _id: ObjectId,
  bookId: String (unique, auto-generated: "BK" + 6 digits),
  authorId: ObjectId (ref: 'Author', required),

  // Basic Info
  bookName: String (required),
  subtitle: String,
  bookType: String (required),
  targetAudience: String,
  language: String (required),

  // Cover & Files
  coverPage: String (URL),
  files: [String] (URLs),

  // Services
  needCoverDesign: Boolean (default: false),
  needFormatting: Boolean (default: false),
  needCopyright: Boolean (default: false),
  physicalCopies: Number (default: 2),

  // Marketplace
  marketplaces: {
    amazon: {
      authorized: Boolean (default: false),
      productLink: String,
      rating: Number (1-5),
      soldUnits: Number (default: 0)
    },
    flipkart: {
      authorized: Boolean (default: false),
      productLink: String,
      rating: Number (1-5),
      soldUnits: Number (default: 0)
    },
    meesho: {...},
    snapdeal: {...},
    offline: {
      soldUnits: Number (default: 0)
    }
  },

  // Financial
  royaltyPercentage: Number (required, 0-100),
  sellingPrice: Number,
  productionCost: Number,

  // Status
  status: Enum['payment_pending', 'formatting', 'designing', 'printing', 'published'] (default: 'payment_pending'),
  launchDate: Date,
  publishedDate: Date,

  // Payments
  totalAmount: Number,
  paidAmount: Number (default: 0),
  paymentStatus: Enum['pending', 'partial', 'completed'] (default: 'pending'),
  installments: [{
    amount: Number,
    percentage: Number,
    status: Enum['pending', 'paid'],
    paidAt: Date,
    transactionId: String
  }],

  // Stats
  totalSoldUnits: Number (default: 0),
  totalRevenue: Number (default: 0),
  totalRoyalty: Number (default: 0),

  createdAt: Date,
  updatedAt: Date
}
```

### 4. Transaction Schema (Royalty Payments)
```typescript
{
  _id: ObjectId,
  transactionId: String (unique, auto-generated),
  authorId: ObjectId (ref: 'Author', required),
  bookId: ObjectId (ref: 'Book', required),

  // Period
  month: Number (1-12),
  year: Number,

  // Sales Data
  totalUnits: Number (required),
  platformWiseSales: {
    amazon: { units: Number, revenue: Number },
    flipkart: { units: Number, revenue: Number },
    meesho: { units: Number, revenue: Number },
    snapdeal: { units: Number, revenue: Number },
    offline: { units: Number, revenue: Number }
  },

  // Financial Breakdown
  totalRevenue: Number,
  productionCost: Number,
  grossMargin: Number,

  expenses: {
    adsCost: Number (default: 0),
    platformFees: Number (default: 0),
    returnsExchanges: Number (default: 0)
  },

  netProfit: Number,
  royaltyPercentage: Number,
  authorRoyalty: Number,

  adjustments: {
    referralDeduction: Number (default: 0),
    outstandingDeduction: Number (default: 0)
  },

  finalRoyalty: Number,

  // Payment
  paymentStatus: Enum['pending', 'processing', 'paid'] (default: 'pending'),
  bankAccountId: ObjectId (ref: 'BankAccount'),
  paymentProof: String (URL),
  paymentMode: String,
  utrNumber: String,
  paidAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

### 5. BankAccount Schema
```typescript
{
  _id: ObjectId,
  authorId: ObjectId (ref: 'Author', required),

  bankName: String (required),
  accountHolderName: String (required),
  accountNumber: String (required, encrypted),
  ifscCode: String (required),
  branchName: String,

  accountType: Enum['primary', 'secondary'] (default: 'secondary'),
  isActive: Boolean (default: true),

  createdAt: Date,
  updatedAt: Date
}
```

### 6. Ticket Schema
```typescript
{
  _id: ObjectId,
  ticketId: String (unique, auto-generated: "TKT" + 6 digits),
  authorId: ObjectId (ref: 'Author', required),

  title: String (required),
  description: String (required),
  category: Enum['technical', 'royalty', 'publishing', 'general'],
  priority: Enum['low', 'medium', 'high'] (default: 'medium'),

  status: Enum['pending', 'working', 'solved'] (default: 'pending'),

  discussionTime: String,
  discussionDay: String,

  attachments: [String] (URLs),

  assignedTo: ObjectId (ref: 'User'),

  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date
}
```

### 7. Message Schema (Chat)
```typescript
{
  _id: ObjectId,
  ticketId: ObjectId (ref: 'Ticket'),
  authorId: ObjectId (ref: 'Author'),

  senderType: Enum['author', 'admin'] (required),
  senderId: ObjectId (required),

  message: String (required),
  attachments: [String] (URLs),

  isRead: Boolean (default: false),

  createdAt: Date
}
```

### 8. Referral Schema
```typescript
{
  _id: ObjectId,
  referrerId: ObjectId (ref: 'Author', required),
  referredAuthorId: ObjectId (ref: 'Author', required),

  referralCode: String (required),

  // Earnings
  earningAmount: Number (default: 500),
  earningStatus: Enum['pending', 'partial', 'completed'] (default: 'pending'),
  paymentPercentage: Number (default: 0), // Based on referred author's payment

  isEarned: Boolean (default: false),
  earnedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

### 9. PricingConfig Schema
```typescript
{
  _id: ObjectId,
  language: String (unique, required),

  pricing: {
    publishing: {
      mainPrice: Number,
      discount: Number (0-100)
    },
    coverDesign: {
      mainPrice: Number,
      discount: Number
    },
    distribution: {
      mainPrice: Number,
      discount: Number
    },
    copyright: {
      mainPrice: Number,
      discount: Number
    },
    formatting: {
      mainPrice: Number,
      discount: Number
    },
    perCopy: {
      mainPrice: Number,
      discount: Number
    }
  },

  installmentOptions: {
    one: Boolean (default: true),
    two: Boolean (default: false),
    three: Boolean (default: false),
    four: Boolean (default: false)
  },

  benefits: [String],

  isActive: Boolean (default: true),

  createdAt: Date,
  updatedAt: Date
}
```

### 10. AuditLog Schema
```typescript
{
  _id: ObjectId,

  userId: ObjectId (User or Author),
  userType: Enum['admin', 'sub_admin', 'author'],

  action: String (required), // e.g., "CREATE_AUTHOR", "UPDATE_ROYALTY"
  module: String, // e.g., "authors", "books", "financial"

  resourceType: String, // e.g., "Author", "Book", "Transaction"
  resourceId: ObjectId,

  changes: {
    before: Object,
    after: Object
  },

  ipAddress: String,
  userAgent: String,

  createdAt: Date
}
```

---

## Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "ObjectId",
  "email": "user@example.com",
  "role": "super_admin | sub_admin | author",
  "permissions": {...},
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role-Based Access Control

**Super Admin:** Full access to all modules
**Sub Admin:** Limited access based on assigned permissions
**Author:** Only access to own data

### Middleware Chain
```
Request → Auth Middleware → Role Middleware → Validation Middleware → Controller
```

---

## API Endpoints

### AUTH MODULE

#### 1. Admin Login
```http
POST /auth/admin/login
```
**Request:**
```json
{
  "email": "admin@povital.com",
  "password": "Admin@123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "...",
      "email": "admin@povital.com",
      "role": "super_admin",
      "permissions": {...}
    }
  },
  "message": "Login successful"
}
```

#### 2. Author Registration
```http
POST /auth/author/register
```
**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "qualification": "MBA",
  "university": "MIT",
  "referralCode": "REF123456" // Optional
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "author": {
      "authorId": "AUT000001",
      "email": "john@example.com"
    },
    "otp": {
      "sentTo": ["email", "phone"]
    }
  },
  "message": "Registration successful. Please verify OTP"
}
```

#### 3. Verify OTP
```http
POST /auth/author/verify-otp
```
**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### 4. Author Login
```http
POST /auth/author/login
```
**Request:**
```json
{
  "email": "john@example.com",
  "password": "John@123"
}
```

#### 5. Change Password
```http
PUT /auth/change-password
Headers: Authorization: Bearer {token}
```
**Request:**
```json
{
  "oldPassword": "Old@123",
  "newPassword": "New@456",
  "confirmPassword": "New@456"
}
```

---

### ADMIN MODULE

#### 6. Get Dashboard Stats
```http
GET /admin/dashboard?month=5&year=2025
Headers: Authorization: Bearer {admin_token}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "activeAuthors": 257,
      "activePercentage": 85.3,
      "publishedBooks": 170,
      "ongoingBooks": 127,
      "totalSellingUnits": 47000,
      "grossMargin": 415000
    },
    "monthlyStats": {
      "authors": 50,
      "books": 25,
      "sales": 5000,
      "revenue": 50000
    },
    "topAuthors": [
      {
        "authorId": "AUT000001",
        "name": "John Doe",
        "totalSales": 1270,
        "totalEarnings": 27540,
        "status": "active"
      }
    ]
  }
}
```

#### 7. Create Author (by Admin)
```http
POST /admin/authors
Headers: Authorization: Bearer {admin_token}
```
**Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "9876543211",
  "qualification": "PhD",
  "university": "Stanford",
  "address": {
    "pinCode": "751010",
    "houseNo": "123",
    "landmark": "Near Hospital"
  }
}
```

#### 8. Get All Authors (with filters)
```http
GET /admin/authors?search=john&location=Odisha&earnings=highest&fromDate=2025-01-01&toDate=2025-05-31&page=1&limit=20
Headers: Authorization: Bearer {admin_token}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "authors": [
      {
        "_id": "...",
        "authorId": "AUT000001",
        "name": "John Doe",
        "location": "Bhadrak, Odisha",
        "totalBooks": 7,
        "paymentCompletion": 85.7,
        "netEarnings": 27540
      }
    ],
    "pagination": {
      "total": 257,
      "page": 1,
      "limit": 20,
      "pages": 13
    }
  }
}
```

#### 9. Get Author Details
```http
GET /admin/authors/:authorId
Headers: Authorization: Bearer {admin_token}
```

#### 10. Update Author
```http
PUT /admin/authors/:authorId
Headers: Authorization: Bearer {admin_token}
```

#### 11. Restrict/Unrestrict Author
```http
PATCH /admin/authors/:authorId/restriction
Headers: Authorization: Bearer {admin_token}
```
**Request:**
```json
{
  "isRestricted": true,
  "reason": "Payment default"
}
```

---

### BOOK MODULE

#### 12. Create Book (Admin)
```http
POST /admin/books
Headers: Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```
**Request (FormData):**
```
authorId: AUT000001
bookName: The Startup Journey
subtitle: From Idea to Success
bookType: Business
targetAudience: Entrepreneurs
language: English
needCoverDesign: true
needFormatting: true
needCopyright: true
physicalCopies: 10
royaltyPercentage: 70
launchDate: 2025-06-15
marketplaces[amazon]: true
marketplaces[flipkart]: true
files: [file1.pdf, file2.docx]
coverPage: cover.jpg (optional)
```
**Response:**
```json
{
  "success": true,
  "data": {
    "book": {
      "bookId": "BK000001",
      "bookName": "The Startup Journey",
      "status": "payment_pending",
      "totalAmount": 3750,
      "paymentLink": "https://payment.povital.com/..."
    }
  },
  "message": "Book created successfully. Payment link sent to author"
}
```

#### 13. Get All Books (with filters)
```http
GET /admin/books?author=john&bookName=startup&sellingUnits=highest&fromDate=2025-01-01&toDate=2025-05-31&page=1&limit=20
Headers: Authorization: Bearer {admin_token}
```

#### 14. Get Book Details
```http
GET /admin/books/:bookId
Headers: Authorization: Bearer {admin_token}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "book": {
      "_id": "...",
      "bookId": "BK000001",
      "bookName": "The Startup Journey",
      "author": {
        "authorId": "AUT000001",
        "name": "John Doe"
      },
      "status": "published",
      "totalSoldUnits": 1040,
      "totalRevenue": 57200,
      "totalRoyalty": 40040,
      "marketplaces": {
        "amazon": {
          "soldUnits": 220,
          "productLink": "https://amazon.in/...",
          "rating": 4.5
        },
        "flipkart": {
          "soldUnits": 170,
          "productLink": "https://flipkart.com/...",
          "rating": 4.2
        }
      },
      "launchDate": "2025-05-15T00:00:00.000Z"
    }
  }
}
```

#### 15. Update Book Product Links
```http
PUT /admin/books/:bookId/product-links
Headers: Authorization: Bearer {admin_token}
```
**Request:**
```json
{
  "marketplaces": {
    "amazon": {
      "productLink": "https://amazon.in/product/...",
      "rating": 4.5
    },
    "flipkart": {
      "productLink": "https://flipkart.com/product/...",
      "rating": 4.2
    }
  }
}
```

---

### FINANCIAL MODULE

#### 16. Update Book Sales
```http
POST /admin/financial/sales
Headers: Authorization: Bearer {admin_token}
```
**Request:**
```json
{
  "bookId": "BK000001",
  "month": 5,
  "year": 2025,
  "platformWiseSales": {
    "amazon": {
      "units": 50,
      "sellingPrice": 450,
      "productionCost": 200
    },
    "flipkart": {
      "units": 40,
      "sellingPrice": 450,
      "productionCost": 200
    },
    "offline": {
      "units": 30,
      "sellingPrice": 400,
      "productionCost": 200
    }
  },
  "expenses": {
    "adsCost": 500,
    "platformFees": 1200,
    "returnsExchanges": 300
  }
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "calculation": {
      "totalUnits": 120,
      "totalRevenue": 51000,
      "productionCost": 24000,
      "grossMargin": 27000,
      "totalExpenses": 2000,
      "netProfit": 25000,
      "royaltyPercentage": 70,
      "authorRoyalty": 17500,
      "adjustments": {
        "referralDeduction": 500,
        "outstandingDeduction": 0
      },
      "finalRoyalty": 17000
    }
  },
  "message": "Sales updated successfully"
}
```

#### 17. Process Royalty Payment
```http
POST /admin/financial/royalty-payment
Headers: Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```
**Request (FormData):**
```
transactionId: TXN123456
bankAccountId: 507f1f77bcf86cd799439011
paymentMode: Bank Transfer
utrNumber: UTR123456789
paymentProof: payment_proof.jpg
```

#### 18. Get Financial Report
```http
GET /admin/financial/report?bookId=BK000001&fromDate=2025-01-01&toDate=2025-05-31
Headers: Authorization: Bearer {admin_token}
```

---

### PRICING CONFIGURATION MODULE

#### 19. Create/Update Pricing Config
```http
POST /admin/pricing
Headers: Authorization: Bearer {admin_token}
```
**Request:**
```json
{
  "language": "English",
  "pricing": {
    "publishing": {
      "mainPrice": 5000,
      "discount": 70
    },
    "coverDesign": {
      "mainPrice": 1000,
      "discount": 50
    },
    "distribution": {
      "mainPrice": 500,
      "discount": 90
    },
    "copyright": {
      "mainPrice": 5500,
      "discount": 10
    },
    "formatting": {
      "mainPrice": 2000,
      "discount": 50
    },
    "perCopy": {
      "mainPrice": 1000,
      "discount": 25
    }
  },
  "installmentOptions": {
    "one": true,
    "two": true,
    "three": true,
    "four": true
  },
  "benefits": [
    "70% Author Royalty",
    "Multi-platform distribution",
    "Professional cover design",
    "Copyright registration"
  ]
}
```

#### 20. Get Pricing Config
```http
GET /admin/pricing/:language
Headers: Authorization: Bearer {admin_token}
```

---

### SUPPORT MODULE

#### 21. Get All Tickets
```http
GET /admin/support/tickets?author=john&status=pending&fromDate=2025-01-01&toDate=2025-05-31&page=1&limit=20
Headers: Authorization: Bearer {admin_token}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "ticketId": "TKT000001",
        "author": {
          "authorId": "AUT000001",
          "name": "John Doe"
        },
        "title": "Royalty payment issue",
        "status": "pending",
        "discussionTime": "12:30 PM",
        "discussionDay": "Today",
        "createdAt": "2025-05-15T10:30:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 22. Get Ticket Messages
```http
GET /admin/support/tickets/:ticketId/messages
Headers: Authorization: Bearer {admin_token}
```

#### 23. Send Message
```http
POST /admin/support/tickets/:ticketId/messages
Headers: Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```
**Request (FormData):**
```
message: Hello, we are looking into your issue
attachments: [file1.jpg, file2.pdf]
```

#### 24. Update Ticket Status
```http
PATCH /admin/support/tickets/:ticketId/status
Headers: Authorization: Bearer {admin_token}
```
**Request:**
```json
{
  "status": "solved"
}
```

---

### AUTHOR ENDPOINTS

#### 25. Get Author Dashboard
```http
GET /author/dashboard
Headers: Authorization: Bearer {author_token}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "authorId": "AUT000001",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210"
    },
    "stats": {
      "netRoyalty": 27540,
      "totalBooks": 7,
      "ongoingBooks": 2,
      "lastMonthRoyalty": 5700
    }
  }
}
```

#### 26. Update Author Profile
```http
PUT /author/profile
Headers: Authorization: Bearer {author_token}
Content-Type: multipart/form-data
```
**Request (FormData):**
```
firstName: John
lastName: Doe
phone: 9876543210
qualification: PhD
university: MIT
profilePicture: profile.jpg
address[pinCode]: 751010
address[houseNo]: 123
address[landmark]: Near Hospital
```

#### 27. Submit New Book (Author)
```http
POST /author/books
Headers: Authorization: Bearer {author_token}
Content-Type: multipart/form-data
```
(Same structure as Admin create book)

#### 28. Get Author Books
```http
GET /author/books?status=published&page=1&limit=10
Headers: Authorization: Bearer {author_token}
```

#### 29. Get Royalty Summary
```http
GET /author/royalty?month=5&year=2025
Headers: Authorization: Bearer {author_token}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "month": 5,
      "year": 2025,
      "totalSellingUnits": 1200,
      "netRoyalty": 27700,
      "paymentDate": "2025-06-10T00:00:00.000Z",
      "paymentStatus": "paid"
    },
    "bookWiseBreakdown": [
      {
        "bookId": "BK000001",
        "bookName": "The Startup Journey",
        "soldUnits": 1200,
        "netRoyalty": 27700,
        "platformWise": {
          "amazon": { "units": 470, "royalty": 12000 },
          "flipkart": { "units": 337, "royalty": 8500 },
          "offline": { "units": 393, "royalty": 7200 }
        }
      }
    ],
    "paymentDetails": {
      "bankAccount": "HDFC Bank - ***7174",
      "utrNumber": "UTR001217",
      "paymentProof": "https://...",
      "paidAt": "2025-06-10T10:30:00.000Z"
    }
  }
}
```

#### 30. Get Referral Earnings
```http
GET /author/referrals
Headers: Authorization: Bearer {author_token}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "referralCode": "REF123456",
    "availableBalance": 1500,
    "utilizedBalance": 2500,
    "referrals": [
      {
        "authorId": "AUT000002",
        "name": "Jane Smith",
        "enrolledDate": "2025-04-10",
        "paymentStatus": "completed",
        "earning": 500
      },
      {
        "authorId": "AUT000003",
        "name": "Mike Johnson",
        "enrolledDate": "2025-05-01",
        "paymentStatus": "partial",
        "paymentPercentage": 50,
        "earning": 250
      }
    ]
  }
}
```

---

### BANK ACCOUNT MODULE

#### 31. Add Bank Account
```http
POST /author/bank-accounts
Headers: Authorization: Bearer {author_token}
```
**Request:**
```json
{
  "bankName": "HDFC Bank",
  "accountHolderName": "John Doe",
  "accountNumber": "12345678901234",
  "confirmAccountNumber": "12345678901234",
  "ifscCode": "HDFC0001234",
  "branchName": "Bhubaneswar Main",
  "accountType": "primary"
}
```

#### 32. Get Bank Accounts
```http
GET /author/bank-accounts
Headers: Authorization: Bearer {author_token}
```

#### 33. Update Bank Account
```http
PUT /author/bank-accounts/:accountId
Headers: Authorization: Bearer {author_token}
```

#### 34. Delete Bank Account
```http
DELETE /author/bank-accounts/:accountId
Headers: Authorization: Bearer {author_token}
```

---

### SUPPORT MODULE (Author Side)

#### 35. Create Ticket
```http
POST /author/support/tickets
Headers: Authorization: Bearer {author_token}
Content-Type: multipart/form-data
```
**Request (FormData):**
```
title: Royalty payment issue
description: I haven't received my royalty for May 2025
category: royalty
discussionTime: 12:30 PM
discussionDay: Tomorrow
attachments: [screenshot.jpg]
```

#### 36. Get My Tickets
```http
GET /author/support/tickets?status=pending&page=1&limit=10
Headers: Authorization: Bearer {author_token}
```

#### 37. Get Ticket Messages (Author)
```http
GET /author/support/tickets/:ticketId/messages
Headers: Authorization: Bearer {author_token}
```

#### 38. Send Message (Author)
```http
POST /author/support/tickets/:ticketId/messages
Headers: Authorization: Bearer {author_token}
Content-Type: multipart/form-data
```

---

## Business Logic & Calculations

### 1. Book Payment Calculation
```javascript
// Based on language pricing config
const calculateBookPayment = (config, services) => {
  let total = 0;

  // Publishing (always included)
  total += config.pricing.publishing.mainPrice * (1 - config.pricing.publishing.discount / 100);

  // Cover Design (if needed)
  if (services.needCoverDesign) {
    total += config.pricing.coverDesign.mainPrice * (1 - config.pricing.coverDesign.discount / 100);
  }

  // Formatting (if needed)
  if (services.needFormatting) {
    total += config.pricing.formatting.mainPrice * (1 - config.pricing.formatting.discount / 100);
  }

  // Copyright (if needed)
  if (services.needCopyright) {
    total += config.pricing.copyright.mainPrice * (1 - config.pricing.copyright.discount / 100);
  }

  // Distribution
  total += config.pricing.distribution.mainPrice * (1 - config.pricing.distribution.discount / 100);

  // Physical Copies (if more than 2)
  if (services.physicalCopies > 2) {
    const extraCopies = services.physicalCopies - 2;
    total += extraCopies * config.pricing.perCopy.mainPrice * (1 - config.pricing.perCopy.discount / 100);
  }

  return Math.round(total);
};
```

### 2. Royalty Calculation
```javascript
const calculateRoyalty = (salesData, expenses, royaltyPercentage) => {
  // Step 1: Calculate Total Revenue
  let totalRevenue = 0;
  let productionCost = 0;

  for (const platform in salesData) {
    const { units, sellingPrice, costPerUnit } = salesData[platform];
    totalRevenue += units * sellingPrice;
    productionCost += units * costPerUnit;
  }

  // Step 2: Calculate Gross Margin
  const grossMargin = totalRevenue - productionCost;

  // Step 3: Deduct Expenses
  const totalExpenses = expenses.adsCost + expenses.platformFees + expenses.returnsExchanges;

  // Step 4: Calculate Net Profit
  const netProfit = grossMargin - totalExpenses;

  // Step 5: Calculate Author Royalty
  const authorRoyalty = netProfit * (royaltyPercentage / 100);

  return {
    totalRevenue,
    productionCost,
    grossMargin,
    totalExpenses,
    netProfit,
    authorRoyalty
  };
};
```

### 3. Final Royalty with Adjustments
```javascript
const calculateFinalRoyalty = (authorRoyalty, adjustments) => {
  const { referralDeduction = 0, outstandingDeduction = 0 } = adjustments;

  const finalRoyalty = authorRoyalty - referralDeduction - outstandingDeduction;

  return Math.max(0, finalRoyalty); // Never negative
};
```

### 4. Referral Earning Logic
```javascript
// Referrer earns Rs. 500 only when referred author completes 100% payment
const processReferralEarning = async (referredAuthorId) => {
  const referral = await Referral.findOne({ referredAuthorId });

  if (!referral) return;

  // Check if referred author has completed any book payment 100%
  const completedPayment = await Book.findOne({
    authorId: referredAuthorId,
    paymentStatus: 'completed'
  });

  if (completedPayment && !referral.isEarned) {
    referral.isEarned = true;
    referral.earnedAt = new Date();
    await referral.save();

    // Update referrer's available balance
    await Author.findByIdAndUpdate(
      referral.referrerId,
      { $inc: { availableReferralBalance: 500 } }
    );
  }
};
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Error Codes
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Unauthorized access
- `VAL_001`: Validation error
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Duplicate resource
- `SERVER_ERROR`: Internal server error

---

## File Upload

### Supported File Types
- **Images:** .jpg, .jpeg, .png (max 5MB)
- **Documents:** .pdf, .doc, .docx (max 20MB)

### Upload Flow
1. Client sends multipart/form-data
2. Multer middleware validates file
3. File uploaded to Cloudinary
4. URL stored in database
5. Response sent with file URL

---

## Notifications

### Email Notifications
- OTP verification
- Payment link
- Publishing approval/rejection
- Royalty payment confirmation
- Ticket status update

### SMS Notifications
- OTP verification
- Important updates

### Email Templates
- Welcome email
- Payment reminder
- Royalty statement
- Support ticket confirmation

---

## Performance & Security

### Security Measures
1. **Authentication:** JWT with 24h expiry
2. **Password:** Bcrypt with 10 salt rounds
3. **Account Number:** AES-256 encryption
4. **Rate Limiting:** 100 requests/15 minutes
5. **Input Validation:** Joi schemas
6. **SQL Injection:** Mongoose parameterized queries
7. **XSS Protection:** Helmet.js

### Performance Optimization
1. **Database Indexing:**
   - Author: email, authorId
   - Book: bookId, authorId
   - Transaction: authorId, bookId, month, year
2. **Pagination:** Default 20 items per page
3. **Caching:** Redis for frequently accessed data
4. **Aggregation:** MongoDB aggregation pipeline for reports

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] SSL certificate installed
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Error logging setup (Winston)
- [ ] Backup strategy implemented
- [ ] API documentation published

---

**Last Updated:** March 2026
**Maintained By:** Development Team
**Contact:** dev@povital.com
