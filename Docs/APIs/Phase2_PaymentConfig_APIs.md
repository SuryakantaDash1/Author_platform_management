# POVITAL - Phase 2: Payment Configuration APIs

> **Base URL:** `http://localhost:5000/api`
> **Content-Type:** `application/json`

---

## 1. PUBLIC CONFIG (No Auth Required)

### 1.1 Get Active Pricing Configs + Languages + Book Types
```
GET /payment-config/public
```
**Auth:** None (Public)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "configs": [
      {
        "_id": "69c1a...",
        "language": "English",
        "languagePrice": { "main": 5000, "discount": 50 },
        "publishingPrice": { "main": 5000, "discount": 70 },
        "coverDesignPrice": { "main": 1000, "discount": 50 },
        "distributionPrice": { "main": 500, "discount": 0 },
        "copyrightPrice": { "main": 5500, "discount": 10 },
        "formattingPrice": { "main": 2000, "discount": 25 },
        "perBookCopyPrice": { "main": 250, "discount": 40 },
        "installmentOptions": [
          { "label": "Full Payment", "splits": [100] },
          { "label": "2 Installments", "splits": [50, 50] },
          { "label": "3 Installments", "splits": [25, 50, 25] }
        ],
        "referralConfig": {
          "firstBookBonus": 500,
          "perReferralBonus": 500
        },
        "platforms": ["Amazon", "Flipkart", "Meesho", "Snapdeal", "Myntra", "1200 Offline Channels"],
        "benefits": ["You will get a free copy", "Free ISBN registration"],
        "isActive": true,
        "createdAt": "2026-04-04T10:00:00.000Z",
        "updatedAt": "2026-04-04T10:00:00.000Z"
      }
    ],
    "languages": ["English", "Hindi", "Odia"],
    "bookTypes": ["Fiction", "Non-Fiction", "Academic", "Poetry"]
  }
}
```

---

## 2. ADMIN CONFIG CRUD

> **All endpoints below require:**
> `Authorization: Bearer <adminAccessToken>`

### 2.1 Get All Configs (Admin)
```
GET /admin/payment-config
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "configs": [ ...same structure as public... ],
    "bookTypes": ["Fiction", "Non-Fiction", "Academic"]
  }
}
```

---

### 2.2 Create Language Config
```
POST /admin/payment-config
```

**Body:**
```json
{
  "language": "English",
  "services": {
    "languagePrice": { "price": 5000, "discount": 50 },
    "publishing": { "price": 5000, "discount": 70 },
    "coverDesign": { "price": 1000, "discount": 50 },
    "distribution": { "price": 500, "discount": 0 },
    "copyright": { "price": 5500, "discount": 10 },
    "formatting": { "price": 2000, "discount": 25 },
    "perBookCopy": { "price": 250, "discount": 40 }
  },
  "installmentOptions": ["full", "two", "three"],
  "referral": {
    "firstBookBonus": 500,
    "perReferralBonus": 500
  },
  "platforms": ["Amazon", "Flipkart", "Meesho", "Snapdeal", "Myntra", "1200 Offline Channels"],
  "benefits": ["You will get a free copy", "Free ISBN registration"]
}
```

**Note:** `installmentOptions` accepts string shortcuts: `"full"`, `"two"`, `"three"`, `"four"` — backend auto-converts to `{ label, splits }` objects.

**Success Response (201):**
```json
{
  "success": true,
  "message": "Pricing configuration for \"English\" created successfully",
  "data": { "config": { ...PricingConfig... } }
}
```

**Error (400) - Duplicate:**
```json
{
  "success": false,
  "message": "Configuration for \"English\" already exists"
}
```

---

### 2.3 Get Single Config
```
GET /admin/payment-config/:id
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { "config": { ...PricingConfig... } }
}
```

---

### 2.4 Update Config
```
PUT /admin/payment-config/:id
```

**Body:** Same as create (all fields optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "data": { "config": { ...PricingConfig... } }
}
```

---

### 2.5 Delete Config
```
DELETE /admin/payment-config/:id
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Configuration for \"English\" deleted successfully"
}
```

---

## 3. BOOK TYPES MANAGEMENT

### 3.1 Get Book Types
```
GET /admin/payment-config/book-types
```
**Auth:** `Authorization: Bearer <adminAccessToken>`

**Success Response (200):**
```json
{
  "success": true,
  "data": { "bookTypes": ["Fiction", "Non-Fiction", "Academic", "Poetry"] }
}
```

---

### 3.2 Update Book Types
```
PUT /admin/payment-config/book-types
```
**Auth:** `Authorization: Bearer <adminAccessToken>`

**Body:**
```json
{
  "bookTypes": ["Fiction", "Non-Fiction", "Academic", "Poetry", "Magazine", "Children"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book types updated successfully",
  "data": { "bookTypes": ["Fiction", "Non-Fiction", "Academic", "Poetry", "Magazine", "Children"] }
}
```

---

## Postman Environment Variables

| Variable | Value |
|----------|-------|
| `baseUrl` | `http://localhost:5000/api` |
| `adminToken` | *(set after admin login)* |

### Auto-set Token Script (Tests tab):
```javascript
if (pm.response.code === 200) {
    const data = pm.response.json().data;
    pm.environment.set("adminToken", data.accessToken);
}
```
