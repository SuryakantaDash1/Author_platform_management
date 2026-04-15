# POVITAL - Phase 3: Payment APIs

> **Base URL:** `http://localhost:5000/api`
> **Content-Type:** `application/json`

---

## 1. RAZORPAY PAYMENT ENDPOINTS (AUTHOR)

> **All endpoints require:** `Authorization: Bearer <authorAccessToken>`
> **Exception:** `/payment/webhook` — no auth (called directly by Razorpay)

---

### 1.1 Create Razorpay Order

```
POST /payment/create-order
```

Creates a Razorpay order for the next pending payment on a book. Handles both initial payment and installments automatically based on the book's `paymentPlan`.

**Body:**
```json
{
  "bookId": "BK00001"
}
```

**Installment Logic:**

| Payment Plan | Amount per call |
|---|---|
| `full` | Full pending amount |
| `2_installments` | `ceil(totalAmount / 2)` or remaining if last |
| `3_installments` | Splits: 25% → 50% → 25% of total |
| `4_installments` | `ceil(totalAmount / 4)` or remaining if last |
| `pay_later` | Full pending amount |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "order_PxxxxxxxxxXXX",
    "amount": 5075,
    "currency": "INR",
    "keyId": "rzp_test_xxxxxxxxxxxxxxxx",
    "bookId": "BK00001",
    "bookName": "The Afternoon of Life",
    "authorName": "SK Dash"
  }
}
```

**Error (400) - No pending amount:**
```json
{
  "success": false,
  "message": "No pending amount for this book"
}
```

**Frontend Usage:**
```javascript
// Open Razorpay checkout after receiving orderId
const options = {
  key: data.keyId,
  amount: data.amount * 100,
  currency: "INR",
  order_id: data.orderId,
  name: "POVITAL",
  description: `Payment for "${data.bookName}"`,
  handler: function(response) {
    // Call /payment/verify with the response
  }
};
const rzp = new Razorpay(options);
rzp.open();
```

---

### 1.2 Verify Payment

```
POST /payment/verify
```

Verifies the Razorpay payment signature, updates book payment status, creates a Transaction record, and moves book status to `pending` if it was `payment_pending` or `draft`.

**Body:**
```json
{
  "razorpay_order_id": "order_PxxxxxxxxxXXX",
  "razorpay_payment_id": "pay_PxxxxxxxxxXXX",
  "razorpay_signature": "abc123def456...",
  "bookId": "BK00001"
}
```

**Side Effects:**
- `book.paymentStatus.paidAmount` incremented by actual paid amount
- `book.paymentStatus.pendingAmount` recalculated
- `book.paymentStatus.paymentCompletionPercentage` updated
- First pending installment marked as `paid`
- Book status set to `pending` (if was `payment_pending` or `draft`)
- `Transaction` record created with type `book_payment`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "bookId": "BK00001",
    "paidAmount": 5075,
    "pendingAmount": 5075,
    "paymentCompletionPercentage": 50,
    "status": "pending"
  }
}
```

**Error (400) - Signature mismatch:**
```json
{
  "success": false,
  "message": "Payment signature verification failed"
}
```

---

### 1.3 Get Pending Payment Requests

```
GET /payment/pending-requests
```

Returns all outstanding payment items for the author dashboard — overdue books and admin-raised payment requests.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "type": "installment",
        "bookId": "BK00001",
        "bookName": "The Afternoon of Life",
        "amount": 5075,
        "dueDate": "2026-04-11T00:00:00.000Z",
        "status": "overdue"
      },
      {
        "type": "admin_request",
        "bookId": "BK00002",
        "bookName": "My Second Book",
        "amount": 2000,
        "serviceType": "exclusive",
        "description": "Cover redesign requested by author",
        "createdAt": "2026-04-10T08:00:00.000Z",
        "status": "pending"
      }
    ]
  }
}
```

| type | When shown |
|---|---|
| `installment` | Book has `status: payment_pending` |
| `admin_request` | Admin raised a manual payment request |

---

### 1.4 Razorpay Webhook

```
POST /payment/webhook
```

Called directly by Razorpay — **no Authorization header**. Verifies webhook signature and handles `payment.captured` event to update book status.

**Headers set by Razorpay:**
```
x-razorpay-signature: <hmac_sha256_signature>
```

**Body (Razorpay event format):**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_PxxxxxxxxxXXX",
        "amount": 507500,
        "notes": {
          "bookId": "BK00001",
          "authorId": "AUT638460"
        }
      }
    }
  }
}
```

**Response (200):**
```json
{ "received": true }
```

> **Note:** If `RAZORPAY_WEBHOOK_SECRET` is not set in `.env`, webhook is accepted without signature verification.

---

## 2. ADMIN PAYMENT ENDPOINTS

> **All endpoints require:** `Authorization: Bearer <adminAccessToken>`

---

### 2.1 Create Payment Request (Admin → Author)

```
POST /admin/books/:bookId/payment-request
```

Admin raises an additional payment request for a specific book. Shows as a notification card on author's dashboard.

**Body:**
```json
{
  "amount": 2000,
  "serviceType": "exclusive",
  "description": "Cover redesign - author requested premium design"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `amount` | number | Yes | Amount in INR |
| `serviceType` | string | Yes | `inclusive` or `exclusive` |
| `description` | string | Yes | Reason for the request |

**Side Effects:**
- Adds entry to `book.paymentRequests[]`
- Sends email notification to author

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment request created successfully",
  "data": {
    "paymentRequest": {
      "amount": 2000,
      "serviceType": "exclusive",
      "description": "Cover redesign - author requested premium design",
      "status": "pending",
      "createdAt": "2026-04-15T06:00:00.000Z"
    }
  }
}
```

---

### 2.2 Extend Pay Later Due Date (Admin)

```
PUT /admin/books/:bookId/extend-due-date
```

Admin extends the due date for a book under `pay_later` plan that has breached its deadline.

**Body:**
```json
{
  "dueDate": "2026-04-25"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Due date extended successfully",
  "data": {
    "book": {
      "bookId": "BK00001",
      "paymentStatus": {
        "dueDate": "2026-04-25T00:00:00.000Z"
      }
    }
  }
}
```

---

## 3. ENVIRONMENT VARIABLES REQUIRED

Add to `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

> Get these from [Razorpay Dashboard](https://dashboard.razorpay.com) → Settings → API Keys

---

## Postman Setup

### Environment Variables
| Variable | Value |
|---|---|
| `baseUrl` | `http://localhost:5000/api` |
| `authorToken` | *(set after author login)* |
| `adminToken` | *(set after admin login)* |

### Test Payment Flow
1. `POST /payment/create-order` → copy `orderId`, `keyId`, `amount`
2. Open Razorpay checkout in browser with the returned values
3. Use test card: `4111 1111 1111 1111`, Expiry: any future, CVV: any 3 digits
4. On success, call `POST /payment/verify` with the 3 Razorpay response fields + `bookId`
5. Verify book status changed to `pending`
