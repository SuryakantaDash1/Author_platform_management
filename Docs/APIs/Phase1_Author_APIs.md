# POVITAL - Phase 1: Author APIs

> **Base URL:** `http://localhost:5000/api`
> **Content-Type:** `application/json`

---

## 1. AUTHOR AUTHENTICATION

### 1.1 Send Signup OTP
```
POST /author/auth/send-signup-otp
```
**Auth:** None (Public)

**Body:**
```json
{
  "email": "author@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email"
}
```

**Error (400) - Email exists:**
```json
{
  "success": false,
  "message": "An account with this email already exists"
}
```

---

### 1.2 Verify OTP & Complete Signup
```
POST /author/auth/verify-otp-signup
```
**Auth:** None (Public)

**Body:**
```json
{
  "email": "author@example.com",
  "otp": "572555",
  "firstName": "JP",
  "lastName": "Singh",
  "mobile": "8978876543",
  "password": "jpsi@472",
  "referralCode": "XKY3E0PX"
}
```

**Password Rules:**
- Minimum 4 characters
- At least 3 numbers

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "USR988743",
      "firstName": "JP",
      "lastName": "Singh",
      "email": "author@example.com",
      "role": "author"
    },
    "author": {
      "authorId": "AUT638460",
      "referralCode": "XKY3E0PX"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 1.3 Author Login
```
POST /author/auth/login
```
**Auth:** None (Public)

**Body:**
```json
{
  "email": "author@example.com",
  "password": "jpsi@472"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "USR988743",
      "firstName": "JP",
      "lastName": "Singh",
      "email": "author@example.com",
      "role": "author",
      "mobile": "8978876543"
    },
    "author": {
      "authorId": "AUT638460",
      "referralCode": "XKY3E0PX",
      "totalBooks": 0,
      "totalEarnings": 0
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error (401) - Wrong credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 1.4 Send Forgot Password OTP
```
POST /author/auth/send-login-otp
```
**Auth:** None (Public)

**Body:**
```json
{
  "email": "author@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If the email is registered, an OTP has been sent"
}
```

---

### 1.5 Verify OTP & Reset Password
```
POST /author/auth/verify-login-otp
```
**Auth:** None (Public)

**Body:**
```json
{
  "email": "author@example.com",
  "otp": "123456",
  "newPassword": "newpass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 1.6 Refresh Token
```
POST /auth/refresh-token
```
**Auth:** None (Public)

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 2. AUTHOR PROFILE

> **All endpoints below require:**
> `Authorization: Bearer <accessToken>`

### 2.1 Get Author Profile
```
GET /author/profile
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "USR988743",
      "firstName": "JP",
      "lastName": "Singh",
      "email": "sdash8869@gmail.com",
      "mobile": "8978876543",
      "isActive": true
    },
    "author": {
      "authorId": "AUT028406",
      "referralCode": "4EIBEQEZ",
      "qualification": "MCA",
      "university": "OUAT",
      "profilePicture": "https://res.cloudinary.com/...",
      "totalBooks": 0,
      "totalEarnings": 0,
      "totalSoldUnits": 0,
      "isRestricted": false,
      "address": {
        "pinCode": "754225",
        "city": "Rajnagar",
        "district": "Kendrapara",
        "state": "Odisha",
        "country": "India",
        "housePlot": "22A",
        "landmark": "Near temple"
      },
      "createdAt": "2026-03-22T07:08:29.921Z"
    }
  }
}
```

---

### 2.2 Update Author Profile
```
PUT /author/profile
```

**Body:**
```json
{
  "qualification": "MCA",
  "university": "OUAT",
  "address": {
    "pinCode": "754225",
    "city": "Rajnagar",
    "district": "Kendrapara",
    "state": "Odisha",
    "country": "India",
    "housePlot": "22A",
    "landmark": "Near temple"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### 2.3 Upload Profile Picture
```
POST /author/profile/picture
```
**Content-Type:** `multipart/form-data`

| Field       | Type   | Description                    |
|-------------|--------|--------------------------------|
| `profilePicture` | File   | Image (JPEG, PNG, GIF, WebP). Max 5MB |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "profilePicture": "https://res.cloudinary.com/dxxxxxx/image/upload/v123/povital/authors/AUT028406-profile.jpg"
  }
}
```

---

### 2.4 Get Author Dashboard
```
GET /author/dashboard
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalBooks": 0,
    "ongoingBooks": 0,
    "totalEarnings": 0,
    "lastMonthEarnings": 0,
    "royaltyPercentage": 70
  }
}
```

---

## 3. SUPPORT TICKETS (Author)

### 3.1 Create Support Ticket
```
POST /support/tickets
```

**Body:**
```json
{
  "title": "Need help with book publishing",
  "category": "Book Publishing",
  "priority": "medium",
  "description": "I need help formatting my manuscript for publishing.",
  "discussionDay": "2026-03-28",
  "discussionTimeSlot1": "10:00 AM - 11:00 AM",
  "discussionTimeSlot2": "02:00 PM - 03:00 PM"
}
```

**Category Options:** `Book Publishing`, `Royalty`, `Technical`, `Account`, `Other`

**Priority Options:** `low`, `medium`, `high`

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "ticketId": "TKT000001",
    "title": "Need help with book publishing",
    "category": "Book Publishing",
    "status": "pending",
    "discussionDay": "2026-03-28",
    "discussionTimeSlot1": "10:00 AM - 11:00 AM",
    "createdAt": "2026-03-25T10:30:00.000Z"
  }
}
```

---

### 3.2 Get My Tickets
```
GET /support/tickets?page=1&limit=10
```

**Query Params:**

| Param     | Type   | Default | Options |
|-----------|--------|---------|---------|
| `page`    | number | 1       | —       |
| `limit`   | number | 10      | —       |
| `status`  | string | —       | pending, in_progress, resolved, closed |
| `category`| string | —       | Book Publishing, Royalty, Technical, Account, Other |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "ticketId": "TKT000001",
        "title": "Need help with book publishing",
        "category": "Book Publishing",
        "status": "pending",
        "priority": "medium",
        "description": "I need help formatting...",
        "discussionDay": "2026-03-28",
        "discussionTimeSlot1": "10:00 AM - 11:00 AM",
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

### 3.3 Update Ticket Status (Author can only close)
```
PUT /support/tickets/:ticketId/status
```

**Body:**
```json
{
  "status": "closed"
}
```

---

## 4. UTILITY

### 4.1 PIN Code Lookup
```
GET /utility/pincode/754225
```
**Auth:** None (Public)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "division": "Kendrapara",
    "city": "Rajnagar",
    "district": "Kendrapara",
    "state": "Odisha",
    "country": "India"
  }
}
```

**Error (404) - Invalid PIN:**
```json
{
  "success": false,
  "message": "No data found for this PIN code"
}
```
