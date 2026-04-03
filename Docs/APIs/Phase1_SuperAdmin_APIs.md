# POVITAL - Phase 1: Super Admin APIs

> **Base URL:** `http://localhost:5000/api`
> **Content-Type:** `application/json`

---

## 1. ADMIN AUTHENTICATION

### 1.1 Admin Login
```
POST /admin/auth/login
```
**Auth:** None (Public)

**Body:**
```json
{
  "email": "admin@povital.com",
  "password": "Admin@123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "USR000001",
      "firstName": "Super",
      "lastName": "Admin",
      "email": "admin@povital.com",
      "role": "super_admin",
      "permissions": ["all"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 1.2 Change Password
```
POST /admin/auth/change-password
```
**Auth:** `Authorization: Bearer <accessToken>`

**Body:**
```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewAdmin@456",
  "confirmPassword": "NewAdmin@456"
}
```

**Password Rules:** Minimum 8 characters

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

### 1.3 Forgot Password
```
POST /admin/auth/forgot-password
```
**Auth:** None (Public)

**Body:**
```json
{
  "email": "admin@povital.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If the email is registered, a reset link has been sent"
}
```

---

### 1.4 Reset Password
```
POST /admin/auth/reset-password
```
**Auth:** None (Public)

**Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewAdmin@456",
  "confirmPassword": "NewAdmin@456"
}
```

---

### 1.5 Refresh Token
```
POST /auth/refresh-token
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 2. AUTHOR MANAGEMENT

> **All endpoints below require:**
> `Authorization: Bearer <accessToken>` (Admin role)

### 2.1 Create Author
```
POST /admin/authors
```

**Body:**
```json
{
  "firstName": "AuthorA",
  "lastName": "Last",
  "email": "newauthor@gmail.com",
  "mobile": "1235678900",
  "qualification": "MBA",
  "university": "BPUT",
  "pinCode": "754025",
  "division": "Cuttack South",
  "city": "Jagatpur",
  "district": "Cuttack",
  "state": "Odisha",
  "country": "India",
  "housePlot": "22A",
  "landmark": "Near bus stand",
  "referralCode": ""
}
```

**Auto-generated password format:** `first4chars@3digits` (e.g., `auth@472`)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Author account created successfully. Credentials sent to email.",
  "data": {
    "user": {
      "userId": "USR097288",
      "firstName": "AuthorA",
      "lastName": "Last",
      "email": "newauthor@gmail.com",
      "role": "author"
    },
    "author": {
      "authorId": "AUT730001",
      "referralCode": "4EIBEQEZ"
    }
  }
}
```

**Error (400) - Email exists:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 2.2 Get All Authors
```
GET /admin/authors?page=1&limit=20&sortEarnings=highest
```

**Query Params:**

| Param          | Type   | Default    | Options |
|----------------|--------|------------|---------|
| `page`         | number | 1          | —       |
| `limit`        | number | 20         | —       |
| `search`       | string | —          | Search by name/email/authorId |
| `tier`         | string | —          | free, basic, premium |
| `isRestricted` | boolean| —          | true, false |
| `sortBy`       | string | createdAt  | createdAt, totalEarnings |
| `sortOrder`    | string | desc       | asc, desc |
| `sortEarnings` | string | —          | highest, lowest |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "authors": [
      {
        "_id": "69c0b4fdaea9e714d6c85918",
        "userId": "USR097288",
        "authorId": "AUT730001",
        "referralCode": "4EIBEQEZ",
        "totalBooks": 0,
        "totalEarnings": 0,
        "totalSoldUnits": 0,
        "isRestricted": false,
        "qualification": "MBA",
        "university": "BPUT",
        "address": {
          "pinCode": "754025",
          "city": "Jagatpur",
          "district": "Cuttack",
          "state": "Odisha",
          "country": "India",
          "housePlot": "22A",
          "landmark": ""
        },
        "createdAt": "2026-03-23T03:35:25.049Z",
        "user": {
          "userId": "USR097288",
          "firstName": "AuthorA",
          "lastName": "Last",
          "email": "newauthor@gmail.com",
          "mobile": "1235678900",
          "isActive": true
        }
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

### 2.3 Get Author Details
```
GET /admin/authors/:authorId
```

**Example:** `GET /admin/authors/AUT730001`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "author": {
      "authorId": "AUT730001",
      "userId": "USR097288",
      "qualification": "MBA",
      "university": "BPUT",
      "totalBooks": 0,
      "totalEarnings": 0,
      "totalSoldUnits": 0,
      "isRestricted": false,
      "address": { ... },
      "user": {
        "firstName": "AuthorA",
        "lastName": "Last",
        "email": "newauthor@gmail.com",
        "mobile": "1235678900"
      }
    },
    "books": [],
    "bankAccounts": [],
    "recentTransactions": []
  }
}
```

---

### 2.4 Restrict / Unrestrict Author
```
PUT /admin/authors/:authorId/restrict
```

**Example:** `PUT /admin/authors/AUT730001/restrict`

**Body (Restrict):**
```json
{
  "isRestricted": true,
  "restrictionReason": "Policy violation"
}
```

**Body (Unrestrict):**
```json
{
  "isRestricted": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Author restricted successfully",
  "data": {
    "authorId": "AUT730001",
    "isRestricted": true,
    "restrictionReason": "Policy violation"
  }
}
```

---

### 2.5 Update Author Tier
```
PUT /admin/authors/:authorId/tier
```

**Body:**
```json
{
  "tier": "premium"
}
```

---

## 3. SUPPORT TICKET MANAGEMENT

### 3.1 Get All Tickets
```
GET /admin/tickets?page=1&limit=10
```

**Query Params:**

| Param      | Type   | Default   | Options |
|------------|--------|-----------|---------|
| `page`     | number | 1         | —       |
| `limit`    | number | 20        | —       |
| `status`   | string | —         | pending, in_progress, resolved, closed |
| `priority` | string | —         | low, medium, high |
| `category` | string | —         | Book Publishing, Royalty, Technical, Account, Other |
| `sortBy`   | string | createdAt | createdAt, updatedAt |
| `sortOrder`| string | desc      | asc, desc |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "ticketId": "TKT000001",
        "authorId": "AUT028406",
        "title": "Need help with book publishing",
        "category": "Other",
        "status": "pending",
        "priority": "medium",
        "description": "I need help formatting my manuscript.",
        "discussionDay": "2026-03-28",
        "discussionTimeSlot1": "09:00 AM - 10:00 AM",
        "discussionTimeSlot2": "02:00 PM - 03:00 PM",
        "createdAt": "2026-03-25T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 3.2 Update Ticket Status
```
PUT /support/tickets/:ticketId/status
```

**Example:** `PUT /support/tickets/TKT000001/status`

**Body:**
```json
{
  "status": "in_progress"
}
```

**Status Options:** `pending`, `in_progress`, `resolved`, `closed`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ticket status updated to in_progress",
  "data": {
    "ticketId": "TKT000001",
    "status": "in_progress",
    "updatedAt": "2026-03-25T11:00:00.000Z"
  }
}
```

---

### 3.3 Add Message to Ticket
```
POST /support/tickets/:ticketId/messages
```

**Body:**
```json
{
  "message": "We are looking into your issue. Will update shortly."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "message": "We are looking into your issue.",
    "senderRole": "admin",
    "createdAt": "2026-03-25T11:05:00.000Z"
  }
}
```

---

### 3.4 Delete Ticket
```
DELETE /support/tickets/:ticketId
```

**Note:** Only admins can delete. This is a soft/hard delete based on implementation.

---

## 4. PLATFORM STATS (Dashboard)

### 4.1 Get Platform Statistics
```
GET /admin/stats
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalAuthors": 4,
      "totalBooks": 0,
      "totalRevenue": 0,
      "totalTransactions": 0,
      "activeTickets": 1
    },
    "tierDistribution": {
      "free": 4,
      "basic": 0,
      "premium": 0
    },
    "monthlyRevenue": []
  }
}
```

---

## 5. UTILITY

### 5.1 PIN Code Lookup
```
GET /utility/pincode/754025
```
**Auth:** None (Public)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "division": "Cuttack South",
    "city": "Jagatpur",
    "district": "Cuttack",
    "state": "Odisha",
    "country": "India"
  }
}
```

---

## Postman Setup Tips

### Environment Variables
Create a Postman environment with:

| Variable        | Value |
|-----------------|-------|
| `baseUrl`       | `http://localhost:5000/api` |
| `adminToken`    | *(set after login)* |
| `authorToken`   | *(set after login)* |

### Auto-set Token Script
Add this to the **Tests** tab of login endpoints:
```javascript
if (pm.response.code === 200) {
    const data = pm.response.json().data;
    pm.environment.set("adminToken", data.accessToken);
    // or for author:
    // pm.environment.set("authorToken", data.accessToken);
}
```

### Auth Header
For protected endpoints, set:
```
Authorization: Bearer {{adminToken}}
```
