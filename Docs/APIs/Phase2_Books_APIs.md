# POVITAL - Phase 2: Book Management APIs

> **Base URL:** `http://localhost:5000/api`
> **Content-Type:** `application/json` (unless file upload)

---

## 1. AUTHOR BOOK ENDPOINTS

> **All endpoints require:** `Authorization: Bearer <authorAccessToken>`

### 1.1 Create Book (Author)
```
POST /books
```

**Body:**
```json
{
  "bookName": "The Afternoon of Life",
  "subtitle": "Finding purpose and joy in midlife",
  "language": "English",
  "bookType": "Fiction",
  "targetAudience": "Adults, Professionals",
  "needFormatting": true,
  "needCopyright": true,
  "needDesigning": false,
  "physicalCopies": 10,
  "royaltyPercentage": 70,
  "expectedLaunchDate": "2026-06-15",
  "marketplaces": ["Amazon", "Flipkart", "Meesho"],
  "paymentPlan": "full",
  "hasCover": true
}
```

**Field Rules:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `bookName` | string | Yes | 2-200 chars |
| `subtitle` | string | No | Max 300 chars |
| `language` | string | No | Defaults to "English". Must match a PricingConfig language |
| `bookType` | string | Yes | From admin-configured book types |
| `targetAudience` | string | No | Max 200 chars |
| `needFormatting` | boolean | No | Default false |
| `needCopyright` | boolean | No | Default false |
| `needDesigning` | boolean | No | Default false |
| `physicalCopies` | number | No | Min 2, default 2. First 2 are free |
| `royaltyPercentage` | number | No | 0-100, default 70 |
| `expectedLaunchDate` | date | Yes | Must be future date |
| `marketplaces` | string[] | No | Platform names |
| `paymentPlan` | string | No | `full`, `2_installments`, `3_installments`, `4_installments`, `pay_later` |
| `hasCover` | boolean | No | Whether author wants cover design |

**Price Calculation:** Backend auto-fetches PricingConfig for the selected language and calculates `priceBreakdown` based on selected services.

**Success Response (201):**
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "book": {
      "bookId": "BK00001",
      "authorId": "AUT638460",
      "bookName": "The Afternoon of Life",
      "language": "English",
      "bookType": "Fiction",
      "status": "payment_pending",
      "priceBreakdown": {
        "publishing": { "original": 5000, "discounted": 1500 },
        "coverDesign": { "original": 1000, "discounted": 500 },
        "formatting": { "original": 2000, "discounted": 1500 },
        "copyright": { "original": 5500, "discounted": 4950 },
        "distribution": { "original": 500, "discounted": 500 },
        "physicalCopies": { "original": 2000, "discounted": 1200, "quantity": 10 },
        "netAmount": 10150,
        "totalDiscount": 5850,
        "referralDiscount": 0,
        "finalAmount": 10150
      },
      "paymentPlan": "full",
      "paymentStatus": {
        "totalAmount": 10150,
        "paidAmount": 0,
        "pendingAmount": 10150,
        "paymentCompletionPercentage": 0,
        "installments": [{ "amount": 10150, "status": "pending" }]
      },
      "createdAt": "2026-04-04T12:00:00.000Z"
    }
  }
}
```

**Error (403) - Restricted:**
```json
{
  "success": false,
  "message": "Account restricted: Policy violation"
}
```

---

### 1.2 Get Book by ID
```
GET /books/:bookId
```

**Example:** `GET /books/BK00001`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "book": { ...full book object... }
  }
}
```

---

### 1.3 Update Book (Draft/Rejected only)
```
PUT /books/:bookId
```

**Body (all optional):**
```json
{
  "bookName": "Updated Name",
  "subtitle": "New subtitle",
  "language": "Hindi",
  "bookType": "Non-Fiction",
  "targetAudience": "Students",
  "needFormatting": false,
  "needCopyright": true,
  "needDesigning": true,
  "physicalCopies": 5,
  "expectedLaunchDate": "2026-07-01",
  "marketplaces": ["Amazon", "Flipkart"]
}
```

**Error (400) - Wrong status:**
```json
{
  "success": false,
  "message": "Cannot update book. Only draft or rejected books can be edited."
}
```

---

### 1.4 Upload Cover Page
```
POST /books/:bookId/cover
```
**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `coverPage` | File | Image file (JPG, PNG). Max 10MB |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cover page uploaded successfully",
  "data": {
    "coverPage": "https://res.cloudinary.com/dxxxxxx/image/upload/v123/povital/covers/cover.jpg"
  }
}
```

---

### 1.5 Upload Book Files (Manuscript)
```
POST /books/:bookId/files
```
**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `bookFiles` | File[] | Up to 5 files. PDF, DOC, DOCX, images |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book files uploaded successfully",
  "data": {
    "uploadedFiles": [
      "https://res.cloudinary.com/.../file1.pdf",
      "https://res.cloudinary.com/.../file2.docx"
    ]
  }
}
```

---

### 1.6 Delete Book File
```
DELETE /books/:bookId/files
```

**Body:**
```json
{
  "fileUrl": "https://res.cloudinary.com/.../file1.pdf"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": { "uploadedFiles": ["https://res.cloudinary.com/.../file2.docx"] }
}
```

---

### 1.7 Submit Book for Review
```
POST /books/:bookId/submit
```

**Prerequisites:** Book must have cover page + at least 1 uploaded file + status must be `draft` or `rejected`.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book submitted for review successfully",
  "data": { "book": { ...book with status: "pending"... } }
}
```

---

### 1.8 Delete Book (Draft only)
```
DELETE /books/:bookId
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

---

### 1.9 Get Pricing for Language
```
GET /books/pricing-suggestions?language=English
```

| Param | Type | Required |
|-------|------|----------|
| `language` | string | Yes |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "config": {
      "language": "English",
      "languagePrice": { "main": 5000, "discount": 50 },
      "publishingPrice": { "main": 5000, "discount": 70 },
      "coverDesignPrice": { "main": 1000, "discount": 50 },
      "...": "..."
    }
  }
}
```

---

## 2. ADMIN BOOK ENDPOINTS

> **All endpoints require:** `Authorization: Bearer <adminAccessToken>`

### 2.1 Create Book for Author (Admin)
```
POST /admin/books
```

**Body:**
```json
{
  "authorId": "AUT638460",
  "bookName": "The Loin Story",
  "subtitle": "A tale of fiction",
  "language": "English",
  "bookType": "Fiction",
  "targetAudience": "Young Adults",
  "needFormatting": true,
  "needCopyright": false,
  "needDesigning": true,
  "physicalCopies": 5,
  "royaltyPercentage": 50,
  "expectedLaunchDate": "2026-06-01",
  "marketplaces": ["Amazon", "Flipkart", "Meesho"],
  "paymentPlan": "2_installments"
}
```

**Side Effects:**
- Book created with status `payment_pending`
- Author `totalBooks` incremented
- Payment request email sent to author

**Success Response (201):**
```json
{
  "success": true,
  "message": "Book created for author successfully",
  "data": {
    "book": {
      "bookId": "BK00002",
      "authorId": "AUT638460",
      "status": "payment_pending",
      "priceBreakdown": { ... },
      "paymentStatus": {
        "totalAmount": 8500,
        "paidAmount": 0,
        "pendingAmount": 8500,
        "paymentCompletionPercentage": 0,
        "installments": [{ "amount": 8500, "status": "pending" }]
      },
      "createdBy": "USR000001"
    }
  }
}
```

**Error (404) - Author not found:**
```json
{
  "success": false,
  "message": "Author not found"
}
```

---

### 2.2 Get All Books (Admin)
```
GET /admin/books?page=1&limit=20
```

**Query Params:**

| Param | Type | Default | Options |
|-------|------|---------|---------|
| `page` | number | 1 | — |
| `limit` | number | 20 | — |
| `search` | string | — | Searches by book name |
| `status` | string | — | pending, payment_pending, in_progress, formatting, designing, published, rejected |
| `bookType` | string | — | Any configured book type |
| `authorId` | string | — | Filter by author ID |
| `sortBy` | string | createdAt | Any book field |
| `sortOrder` | string | desc | asc, desc |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "bookId": "BK00001",
        "authorId": "AUT638460",
        "bookName": "The Afternoon of Life",
        "bookType": "Fiction",
        "status": "payment_pending",
        "totalSellingUnits": 0,
        "totalRevenue": 0,
        "createdAt": "2026-04-04T12:00:00.000Z",
        "authorName": "SK Dash",
        "author": {
          "authorId": "AUT638460",
          "userId": "USR988743",
          "user": {
            "userId": "USR988743",
            "firstName": "SK",
            "lastName": "Dash",
            "email": "sdash6078@gmail.com"
          }
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

### 2.3 Update Book Status (Admin)
```
PUT /admin/books/:bookId/status
```

**Body:**
```json
{
  "status": "published",
  "rejectionReason": "Optional - required if status is 'rejected'"
}
```

**Status Options:** `pending`, `payment_pending`, `in_progress`, `formatting`, `designing`, `published`, `rejected`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book published successfully",
  "data": { "book": { ...updated book... } }
}
```

---

### 2.4 Update Book Sales Data (Admin)
```
PUT /books/:bookId/sales
```

**Body:**
```json
{
  "platform": "Amazon",
  "sellingUnits": 50,
  "productLink": "https://amazon.in/dp/...",
  "rating": 4.5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sales data updated successfully",
  "data": { "book": { ...book with updated platformWiseSales... } }
}
```

---

## Postman Setup

### Environment Variables
| Variable | Value |
|----------|-------|
| `baseUrl` | `http://localhost:5000/api` |
| `adminToken` | *(set after admin login)* |
| `authorToken` | *(set after author login)* |

### File Upload in Postman
For cover and file upload endpoints:
1. Set method to POST
2. Go to Body → form-data
3. Add key `coverPage` or `bookFiles` with type **File**
4. Select file(s) from your system
5. Do NOT set Content-Type header manually — Postman handles it

### Auto-set Token Script
Add to **Tests** tab of login endpoints:
```javascript
if (pm.response.code === 200) {
    const data = pm.response.json().data;
    // For admin login:
    pm.environment.set("adminToken", data.accessToken);
    // For author login:
    pm.environment.set("authorToken", data.accessToken);
}
```
