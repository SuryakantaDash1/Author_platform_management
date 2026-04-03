export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    maxBooks: 3,
    platformFee: 5,
    features: ['3 Books', '5% Platform Fee', 'Basic Support'],
  },
  basic: {
    name: 'Basic',
    price: 499,
    maxBooks: 20,
    platformFee: 3,
    features: ['20 Books', '3% Platform Fee', 'Email Support', 'Sales Analytics'],
  },
  pro: {
    name: 'Pro',
    price: 1499,
    maxBooks: Infinity,
    platformFee: 2,
    features: [
      'Unlimited Books',
      '2% Platform Fee',
      'Priority Support',
      'Advanced Analytics',
      'API Access',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 4999,
    maxBooks: Infinity,
    platformFee: 1.5,
    features: [
      'Unlimited Books',
      '1.5% Platform Fee',
      'Multi-Author Support',
      'Dedicated Account Manager',
      'Custom Integration',
      'White Label Options',
    ],
  },
};

export const BOOK_TYPES = [
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'poetry', label: 'Poetry' },
  { value: 'children', label: "Children's" },
  { value: 'academic', label: 'Academic' },
  { value: 'other', label: 'Other' },
];

export const BOOK_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'pending', label: 'Pending Review', color: 'yellow' },
  { value: 'published', label: 'Published', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
];

export const TICKET_CATEGORIES = [
  { value: 'book_publishing', label: 'Need Support for Book Publishing?' },
  { value: 'royalty_query', label: 'Royalty Query' },
  { value: 'account_issue', label: 'Account Issue' },
  { value: 'other', label: 'Other' },
];

export const DISCUSSION_DAYS = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'day_after_tomorrow', label: 'Day After Tomorrow' },
];

export const TIME_SLOTS = [
  { value: '09:00 AM - 10:00 AM', label: '09:00 AM - 10:00 AM' },
  { value: '10:00 AM - 11:00 AM', label: '10:00 AM - 11:00 AM' },
  { value: '11:00 AM - 12:00 PM', label: '11:00 AM - 12:00 PM' },
  { value: '12:00 PM - 01:00 PM', label: '12:00 PM - 01:00 PM' },
  { value: '02:00 PM - 03:00 PM', label: '02:00 PM - 03:00 PM' },
  { value: '03:00 PM - 04:00 PM', label: '03:00 PM - 04:00 PM' },
  { value: '04:00 PM - 05:00 PM', label: '04:00 PM - 05:00 PM' },
  { value: '05:00 PM - 06:00 PM', label: '05:00 PM - 06:00 PM' },
];

export const TICKET_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

export const TICKET_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'resolved', label: 'Resolved', color: 'green' },
  { value: 'closed', label: 'Closed', color: 'gray' },
];

export const TRANSACTION_TYPES = [
  { value: 'royalty_payment', label: 'Royalty Payment' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'referral_commission', label: 'Referral Commission' },
];

export const TRANSACTION_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
];

export const USER_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'sub_admin', label: 'Sub Admin' },
  { value: 'author', label: 'Author' },
];

export const MARKETPLACES = [
  'Amazon',
  'Flipkart',
  'Barnes & Noble',
  'Kobo',
  'Apple Books',
  'Google Play Books',
  'Own Website',
  'Other',
];

export const DATE_FORMAT = 'MMM DD, YYYY';
export const DATETIME_FORMAT = 'MMM DD, YYYY hh:mm A';

export const OTP_EXPIRY_MINUTES = 10;
export const OTP_LENGTH = 6;
export const MAX_OTP_ATTEMPTS = 3;

export const FILE_SIZE_LIMITS = {
  profilePicture: 5 * 1024 * 1024, // 5MB
  coverPage: 10 * 1024 * 1024, // 10MB
  bookFiles: 50 * 1024 * 1024, // 50MB per file
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
