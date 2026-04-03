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
    GET_ALL_BOOKS: '/admin/books',
    UPDATE_BOOK_STATUS: (bookId: string) => `/admin/books/${bookId}/status`,
    GET_ALL_TICKETS: '/admin/tickets',
    GET_PLATFORM_STATS: '/admin/stats',
    UPDATE_PRICING: '/admin/pricing',
    GET_AUDIT_LOGS: '/admin/audit-logs',
  },

  // Author endpoints
  AUTHOR: {
    GET_PROFILE: '/author/profile',
    UPDATE_PROFILE: '/author/profile',
    UPLOAD_PROFILE_PICTURE: '/author/profile/picture',
    GET_DASHBOARD: '/author/dashboard',
    GET_MY_BOOKS: '/author/books',
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
    GET_PRICING_SUGGESTIONS: '/books/pricing-suggestions',
    UPDATE_SALES_DATA: (bookId: string) => `/books/${bookId}/sales`,
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

  // Referral endpoints
  REFERRALS: {
    VALIDATE_CODE: (code: string) => `/referrals/validate/${code}`,
    GET_MY_REFERRALS: '/referrals/my-referrals',
    GET_ALL_REFERRALS: '/referrals',
    GET_REFERRAL_STATS: '/referrals/stats',
    PROCESS_COMMISSION: (referralId: string) => `/referrals/${referralId}/process`,
    UPDATE_COMMISSION: (referralId: string) => `/referrals/${referralId}/commission`,
  },
};
