export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP_SIGNUP: '/auth/verify-otp-signup',
    VERIFY_OTP_LOGIN: '/auth/verify-otp-login',
    GOOGLE_AUTH: '/auth/google',
    MICROSOFT_AUTH: '/auth/microsoft',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    GET_CURRENT_USER: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    CHANGE_EMAIL: '/auth/change-email',
    ENABLE_2FA: '/auth/2fa/enable',
    VERIFY_2FA: '/auth/2fa/verify',
    DISABLE_2FA: '/auth/2fa/disable',
  },

  // Admin endpoints
  ADMIN: {
    CREATE_AUTHOR: '/admin/authors',
    GET_ALL_AUTHORS: '/admin/authors',
    GET_AUTHOR_DETAILS: (authorId: string) => `/admin/authors/${authorId}`,
    UPDATE_AUTHOR_TIER: (authorId: string) => `/admin/authors/${authorId}/tier`,
    RESTRICT_AUTHOR: (authorId: string) => `/admin/authors/${authorId}/restrict`,
    GET_AUTHOR_BANK_ACCOUNTS: (authorId: string) => `/admin/authors/${authorId}/bank-accounts`,
    // Books
    GET_ALL_BOOKS: '/admin/books',
    CREATE_BOOK: '/admin/books',
    GET_BOOK_DETAIL: (bookId: string) => `/admin/books/${bookId}`,
    UPDATE_BOOK: (bookId: string) => `/admin/books/${bookId}`,
    UPDATE_BOOK_STATUS: (bookId: string) => `/admin/books/${bookId}/status`,
    APPROVE_BOOK: (bookId: string) => `/admin/books/${bookId}/approve`,
    DECLINE_BOOK: (bookId: string) => `/admin/books/${bookId}/decline`,
    UPDATE_BOOK_STAGE: (bookId: string) => `/admin/books/${bookId}/stage`,
    UPDATE_PRODUCT_LINKS: (bookId: string) => `/admin/books/${bookId}/product-links`,
    REQUEST_PAYMENT: (bookId: string) => `/admin/books/${bookId}/payment-request`,
    EXTEND_DUE_DATE: (bookId: string) => `/admin/books/${bookId}/extend-due-date`,
    // Payment Config
    GET_PAYMENT_CONFIG: '/admin/payment-config',
    CREATE_PAYMENT_CONFIG: '/admin/payment-config',
    UPDATE_PAYMENT_CONFIG: (id: string) => `/admin/payment-config/${id}`,
    DELETE_PAYMENT_CONFIG: (id: string) => `/admin/payment-config/${id}`,
    // Support & misc
    GET_ALL_TICKETS: '/admin/tickets',
    GET_PLATFORM_STATS: '/admin/stats',
    GET_AUDIT_LOGS: '/admin/audit-logs',
  },

  // Public pricing (no auth required — used in book form)
  PAYMENT_CONFIG: {
    GET_PUBLIC: '/payment-config/public',
  },

  // Author endpoints
  AUTHOR: {
    GET_PROFILE: '/author/profile',
    UPDATE_PROFILE: '/author/profile',
    UPLOAD_PROFILE_PICTURE: '/author/profile/picture',
    GET_DASHBOARD: '/author/dashboard',
    GET_MY_BOOKS: '/author/books',
    GET_BOOK_DETAIL: (bookId: string) => `/author/books/${bookId}`,
    GET_TRANSACTIONS: '/author/transactions',
    ADD_BANK_ACCOUNT: '/author/bank-accounts',
    GET_BANK_ACCOUNTS: '/author/bank-accounts',
    DELETE_BANK_ACCOUNT: (accountId: string) => `/author/bank-accounts/${accountId}`,
    GET_REFERRALS: '/author/referrals',
    GET_SALES_ANALYTICS: '/author/analytics/sales',
  },

  // Book endpoints
  BOOKS: {
    CREATE_BOOK: '/books',
    GET_BOOK: (bookId: string) => `/books/${bookId}`,
    UPDATE_BOOK: (bookId: string) => `/books/${bookId}`,
    UPLOAD_COVER: (bookId: string) => `/books/${bookId}/cover`,
    UPLOAD_FILES: (bookId: string) => `/books/${bookId}/files`,
    DELETE_FILE: (bookId: string) => `/books/${bookId}/files`,
    SUBMIT_FOR_REVIEW: (bookId: string) => `/books/${bookId}/submit`,
    DELETE_BOOK: (bookId: string) => `/books/${bookId}`,
    UPDATE_SALES_DATA: (bookId: string) => `/books/${bookId}/sales`,
    GET_FILE_URL: (bookId: string) => `/books/${bookId}/file-url`,
  },

  // Financial endpoints
  FINANCIAL: {
    CALCULATE_ROYALTY: '/financial/royalty/calculate',
    PROCESS_ROYALTY_PAYMENT: '/financial/royalty/process',
    UPDATE_TRANSACTION_STATUS: (transactionId: string) =>
      `/financial/transactions/${transactionId}/status`,
    GET_ALL_TRANSACTIONS: '/financial/transactions',
    GET_TRANSACTION: (transactionId: string) => `/financial/transactions/${transactionId}`,
    PROCESS_SUBSCRIPTION: '/financial/subscription/process',
    GET_AUTHOR_FINANCIAL_SUMMARY: (authorId: string) => `/financial/summary/${authorId}`,
    GET_PLATFORM_FINANCIALS: '/financial/platform/analytics',
  },

  // Support endpoints
  SUPPORT: {
    CREATE_TICKET: '/support/tickets',
    GET_MY_TICKETS: '/support/tickets',
    GET_TICKET: (ticketId: string) => `/support/tickets/${ticketId}`,
    ADD_MESSAGE: (ticketId: string) => `/support/tickets/${ticketId}/messages`,
    UPDATE_TICKET_STATUS: (ticketId: string) => `/support/tickets/${ticketId}/status`,
    SEARCH_TICKETS: '/support/admin/tickets/search',
    GET_TICKET_STATS: '/support/admin/tickets/stats',
    ASSIGN_TICKET: (ticketId: string) => `/support/admin/tickets/${ticketId}/assign`,
  },

  // Utility endpoints
  UTILITY: {
    PINCODE_LOOKUP: (pin: string) => `/utility/pincode/${pin}`,
  },

  // Admin Auth endpoints
  ADMIN_AUTH: {
    CHANGE_PASSWORD: '/admin/auth/change-password',
  },

  // Payment endpoints (Razorpay)
  PAYMENT: {
    CREATE_ORDER: '/payment/create-order',
    VERIFY: '/payment/verify',
    PENDING_REQUESTS: '/payment/pending-requests',
  },

  // Reviews endpoints
  REVIEWS: {
    MY: '/reviews/my',
    SUBMIT: '/reviews',
    UPDATE: (id: string) => `/reviews/${id}`,
    PUBLIC: '/reviews/public',
    ADMIN_ALL: '/reviews/admin',
    ADMIN_EDIT: (id: string) => `/reviews/admin/${id}`,
    ADMIN_DELETE: (id: string) => `/reviews/admin/${id}`,
  },

  // Bank account edit
  BANK_ACCOUNT: {
    EDIT: (accountId: string) => `/author/bank-accounts/${accountId}`,
  },

  // Referral endpoints
  REFERRALS: {
    VALIDATE_CODE: (code: string) => `/referrals/validate/${code}`,
    GET_MY_REFERRALS: '/referrals/my-referrals',
    GET_ALL_REFERRALS: '/referrals',
    GET_REFERRAL_STATS: '/referrals/stats',
    PROCESS_COMMISSION: (referralId: string) => `/referrals/${referralId}/process`,
    UPDATE_COMMISSION: (referralId: string) => `/referrals/${referralId}/commission`,
  },

  // Selling (Phase 4) — admin
  SELLING: {
    SUBMIT: '/admin/selling',
    PREVIEW: '/admin/selling/preview',
    GET_ALL_RECORDS: '/admin/selling',
    GET_HISTORY: (bookId: string) => `/admin/selling/${bookId}`,
  },

  // Royalty (Phase 4)
  ROYALTY: {
    // Author
    GET_MY_ROYALTIES: '/author/royalties',
    GET_MY_MONTH_DETAIL: (year: number, month: number) => `/author/royalties/${year}/${month}`,
    // Admin
    ADMIN_LISTING: '/admin/royalties',
    ADMIN_AUTHOR_DETAIL: (authorId: string) => `/admin/royalties/author/${authorId}`,
    ADMIN_BOOK_RECORDS: (bookId: string) => `/admin/royalties/book/${bookId}`,
    ADMIN_RELEASE: '/admin/royalties/release',
  },

  // Public (Phase 4) — no auth
  PUBLIC: {
    GET_AUTHORS: '/public/authors',
    GET_AUTHOR_DETAIL: (authorId: string) => `/public/authors/${authorId}`,
    GET_BOOKS: '/public/books',
    GET_BOOK_DETAIL: (bookId: string) => `/public/books/${bookId}`,
  },
};
