# FRONTEND DOCUMENTATION
## Author Platform Management System - POVITAL

**Version:** 1.0.0
**Tech Stack:** React.js, TypeScript, Tailwind CSS, React Router, Redux Toolkit, Axios

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Tech Stack & Libraries](#tech-stack--libraries)
3. [Page Components](#page-components)
4. [Reusable Components](#reusable-components)
5. [State Management](#state-management)
6. [Routing](#routing)
7. [API Integration](#api-integration)
8. [Forms & Validation](#forms--validation)
9. [Styling Guidelines](#styling-guidelines)

---

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       ├── logo.png
│       └── images/
├── src/
│   ├── api/
│   │   ├── axios.config.ts
│   │   ├── endpoints.ts
│   │   └── interceptors.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Loader.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx
│   │   │   ├── MonthlyChart.tsx
│   │   │   ├── TopAuthorCard.tsx
│   │   │   └── StatsCard.tsx
│   │   ├── forms/
│   │   │   ├── AuthorForm.tsx
│   │   │   ├── BookForm.tsx
│   │   │   ├── BankAccountForm.tsx
│   │   │   ├── TicketForm.tsx
│   │   │   └── SalesUpdateForm.tsx
│   │   └── layout/
│   │       ├── AdminLayout.tsx
│   │       ├── AuthorLayout.tsx
│   │       └── PublicLayout.tsx
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Home.tsx
│   │   │   ├── Books.tsx
│   │   │   ├── Authors.tsx
│   │   │   ├── BookDetails.tsx
│   │   │   └── AuthorDetails.tsx
│   │   ├── auth/
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── AuthorLogin.tsx
│   │   │   ├── AuthorRegister.tsx
│   │   │   ├── VerifyOTP.tsx
│   │   │   └── ChangePassword.tsx
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AuthorListing.tsx
│   │   │   ├── AuthorDetails.tsx
│   │   │   ├── CreateAuthor.tsx
│   │   │   ├── EditAuthor.tsx
│   │   │   ├── BookListing.tsx
│   │   │   ├── BookDetails.tsx
│   │   │   ├── CreateBook.tsx
│   │   │   ├── SalesUpdate.tsx
│   │   │   ├── RoyaltyPayment.tsx
│   │   │   ├── PricingConfig.tsx
│   │   │   ├── TicketListing.tsx
│   │   │   ├── TicketDetails.tsx
│   │   │   └── ChatWindow.tsx
│   │   └── author/
│   │       ├── Dashboard.tsx
│   │       ├── Profile.tsx
│   │       ├── EditProfile.tsx
│   │       ├── BookListing.tsx
│   │       ├── BookDetails.tsx
│   │       ├── SubmitBook.tsx
│   │       ├── RoyaltySummary.tsx
│   │       ├── ReferralEarnings.tsx
│   │       ├── BankAccounts.tsx
│   │       ├── TicketListing.tsx
│   │       ├── CreateTicket.tsx
│   │       └── ChatWindow.tsx
│   ├── redux/
│   │   ├── store.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── adminSlice.ts
│   │   │   ├── authorSlice.ts
│   │   │   ├── bookSlice.ts
│   │   │   ├── financialSlice.ts
│   │   │   └── supportSlice.ts
│   │   └── hooks.ts
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   ├── adminService.ts
│   │   ├── authorService.ts
│   │   ├── bookService.ts
│   │   └── supportService.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── author.types.ts
│   │   ├── book.types.ts
│   │   └── common.types.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   └── useFileUpload.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## Tech Stack & Libraries

### Core
- **React** 18.x - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool

### State Management
- **Redux Toolkit** - Global state management
- **React Query** - Server state management (optional)

### Routing
- **React Router Dom** v6 - Client-side routing

### UI & Styling
- **Tailwind CSS** - Utility-first CSS
- **Headless UI** - Accessible components
- **Heroicons** - Icons
- **Chart.js** / **Recharts** - Data visualization

### Forms & Validation
- **React Hook Form** - Form management
- **Zod** / **Yup** - Schema validation

### HTTP Client
- **Axios** - API requests

### Utilities
- **date-fns** - Date manipulation
- **react-toastify** - Toast notifications
- **react-hot-toast** - Alternative toast
- **clsx** - Conditional className

---

## Page Components

### PUBLIC PAGES

#### 1. Home Page (`/`)
**File:** `src/pages/public/Home.tsx`

**Sections:**
- Hero section with CTA
- Stats display (257+ Authors, 1.5k+ Books Published, etc.)
- Featured books carousel
- Featured authors grid
- Call-to-action for author enrollment
- Testimonials section
- FAQ accordion

**Key Features:**
- Responsive design
- Smooth scroll animations
- Book filtering by category

#### 2. Books Listing (`/books`)
**File:** `src/pages/public/Books.tsx`

**Features:**
- Filter sidebar:
  - Author Name (autocomplete)
  - Book Name (autocomplete)
  - Book Type (dropdown)
  - Language (dropdown)
  - Rating (dropdown)
- Grid/List view toggle
- Pagination
- Sort options (Name, Price, Rating, Sold Units)

**Book Card Display:**
- Cover image
- Book name & subtitle
- Author name
- Price (discounted & original)
- Rating (stars)
- Units sold
- "Order Now" button

#### 3. Book Details (`/books/:bookId`)
**File:** `src/pages/public/BookDetails.tsx`

**Sections:**
- Book cover & image gallery
- Book information
- Author information
- Available on platforms (Amazon, Flipkart, etc.)
- Ratings & reviews
- Related books

#### 4. Authors Listing (`/authors`)
**File:** `src/pages/public/Authors.tsx`

**Features:**
- Search by name
- Filter by qualification
- Author cards showing:
  - Profile picture
  - Name & qualification
  - Books published
  - Net royalty earned
  - "Explore" button

#### 5. Author Details (`/authors/:authorId`)
**File:** `src/pages/public/AuthorDetails.tsx`

**Sections:**
- Author profile
- Books written
- Stats (Total Books, Royalty, etc.)
- Contact button

---

### AUTHENTICATION PAGES

#### 6. Admin Login (`/admin/login`)
**File:** `src/pages/auth/AdminLogin.tsx`

**Form Fields:**
- Email
- Password
- Remember me (checkbox)
- Forgot password link

**Validation:**
- Email format
- Password required

#### 7. Author Registration (`/author/register`)
**File:** `src/pages/auth/AuthorRegister.tsx`

**Form Fields:**
- Profile picture (optional)
- First name
- Last name
- Mobile number (10 digits)
- Email
- Qualification
- University
- Referral code (optional)

**Features:**
- Google Sign Up option
- Form validation
- OTP verification redirect

#### 8. Verify OTP (`/author/verify-otp`)
**File:** `src/pages/auth/VerifyOTP.tsx`

**Features:**
- 6-digit OTP input
- Resend OTP button (30s countdown)
- Auto-submit on 6 digits

#### 9. Author Login (`/author/login`)
**File:** `src/pages/auth/AuthorLogin.tsx`

**Form Fields:**
- Email
- Password
- Remember me
- Forgot password link

---

### ADMIN PAGES

#### 10. Admin Dashboard (`/admin/dashboard`)
**File:** `src/pages/admin/Dashboard.tsx`

**Components:**
- Header with search & notifications
- KPI Cards (6 cards):
  - Active Authors (with % change)
  - Published Books
  - Ongoing Books
  - Total Selling Units
  - Net Profit Margin
  - Monthly Revenue
- Month filter (dropdown)
- Monthly activity chart (bar chart)
- Best Seller Authors table
- Recent transactions

**Features:**
- Real-time stats
- Interactive charts
- Quick actions

#### 11. Author Listing (`/admin/authors`)
**File:** `src/pages/admin/AuthorListing.tsx`

**Filters:**
- Author Name/ID (search with autocomplete)
- Location (dropdown)
- Earnings (Highest/Lowest radio)
- From Date - To Date

**Table Columns:**
- No.
- Author ID
- Author Name
- Location (State, District)
- Total Books
- Payment Completion %
- Net Earnings
- Actions (View, Edit, Restrict)

**Actions:**
- Add New Author button
- Export to Excel
- Pagination

#### 12. Author Details (`/admin/authors/:authorId`)
**File:** `src/pages/admin/AuthorDetails.tsx`

**Sections:**
- Author profile card
- Stats overview
- Books list
- Royalty history
- Bank accounts
- Support tickets
- Edit/Restrict buttons

#### 13. Create/Edit Author (`/admin/authors/create`, `/admin/authors/:authorId/edit`)
**File:** `src/pages/admin/CreateAuthor.tsx`, `EditAuthor.tsx`

**Form:**
- Same fields as author registration
- Additional: Status (Active/Restricted)
- Address fields with PIN code auto-fill

#### 14. Book Listing (`/admin/books`)
**File:** `src/pages/admin/BookListing.tsx`

**Filters:**
- Author Name (autocomplete)
- Book Name (autocomplete)
- Selling Units (Highest/Lowest)
- From Date - To Date

**Table Columns:**
- No.
- Author Name
- Book Name
- Type
- Status
- Selling Units
- Net Earnings
- Date
- Payment Status
- Actions (View, Edit, Update Sales, Add Product Links)

#### 15. Book Details (`/admin/books/:bookId`)
**File:** `src/pages/admin/BookDetails.tsx`

**Sections:**
- Book information
- Author information
- Platform-wise selling data
- Financial breakdown:
  - Net Revenue
  - Production Cost
  - Gross Margin
  - Expenses
  - Net Profit
  - Author Royalty
- Platform product links (clickable)
- Upload/Update product links button

#### 16. Create Book (`/admin/books/create`)
**File:** `src/pages/admin/CreateBook.tsx`

**Form Steps:**
1. **Basic Information:**
   - Author ID (autocomplete)
   - Book Name
   - Subtitle
   - Book Type
   - Target Audience
   - Language

2. **Services:**
   - Need Cover Design? (Yes/No)
   - Need Formatting? (Yes/No)
   - Need Copyright? (Yes/No)
   - Physical Copies (number input)

3. **Marketplace Authorization:**
   - Checkboxes for platforms
   - Amazon, Flipkart, Meesho, Snapdeal, Myntra, 150+ Others, 1200 Offline Channels

4. **Royalty & Launch:**
   - Royalty % (slider/input)
   - Expected Launch Date (date picker)

5. **Upload Files:**
   - Cover Page (if not using design service)
   - Book Files (PDF, Word, Images)

**Features:**
- Price breakdown sidebar (real-time calculation)
- Installment options
- Payment request generation

#### 17. Sales Update (`/admin/financial/sales-update`)
**File:** `src/pages/admin/SalesUpdate.tsx`

**Form:**
- Search Book (autocomplete)
- Month & Year selector
- Platform-wise input:
  - Amazon: Units, Selling Price, Production Cost
  - Flipkart: Units, Selling Price, Production Cost
  - Meesho: ...
  - Offline: ...
- Expenses:
  - Ads Cost
  - Platform Fees
  - Returns & Exchanges
- Auto-calculated summary panel

#### 18. Royalty Payment (`/admin/financial/royalty-payment`)
**File:** `src/pages/admin/RoyaltyPayment.tsx`

**Steps:**
1. Select Transaction (pending transactions list)
2. View Calculation Breakdown
3. Select Author Bank Account
4. Upload Payment Proof
5. Enter UTR Number
6. Confirm Payment

**Features:**
- Transaction search & filter
- Calculation preview
- Bank account selection
- Payment confirmation

#### 19. Pricing Configuration (`/admin/pricing`)
**File:** `src/pages/admin/PricingConfig.tsx`

**Features:**
- Language tabs (English, Hindi, Odia, etc.)
- Pricing grid for each service:
  - Publishing
  - Cover Design
  - Distribution
  - Copyright
  - Formatting
  - Per Copy
- Each has: Main Price, Discount %
- Installment options (checkboxes)
- Benefits list (editable)
- Save & Preview button

#### 20. Ticket Listing (`/admin/support/tickets`)
**File:** `src/pages/admin/TicketListing.tsx`

**Filters:**
- Author Name/ID
- Status (Pending, Working, Solved)
- From Date - To Date

**Table:**
- Ticket ID
- Author Name
- Title
- Discussion Time
- Date
- Status
- Actions (View, Chat, Update Status)

#### 21. Chat Window (`/admin/support/tickets/:ticketId/chat`)
**File:** `src/pages/admin/ChatWindow.tsx`

**Features:**
- Ticket information header
- Message thread (scrollable)
- Message input with attachment
- Send button
- Status update dropdown

---

### AUTHOR PAGES

#### 22. Author Dashboard (`/author/dashboard`)
**File:** `src/pages/author/Dashboard.tsx`

**Sections:**
- Welcome header with profile picture
- Stats cards:
  - Net Royalty Earning
  - Total Books
  - Ongoing Books
  - Last Month Royalty
- Recent books
- Pending payments
- Quick actions (New Book, Help Desk)

#### 23. Profile (`/author/profile`)
**File:** `src/pages/author/Profile.tsx`

**Display:**
- Profile picture
- Personal information
- Academic information
- Address
- Account stats
- Edit Profile button

#### 24. Edit Profile (`/author/profile/edit`)
**File:** `src/pages/author/EditProfile.tsx`

**Form:**
- All editable fields from registration
- Profile picture upload
- Address with PIN auto-fill
- Submit button

#### 25. Book Listing (`/author/books`)
**File:** `src/pages/author/BookListing.tsx`

**Features:**
- Filter by status
- Book cards showing:
  - Cover image
  - Book name
  - Status
  - Selling units
  - Net earnings
  - Launch date
  - Payment status
- "New Book" button

#### 26. Book Details (`/author/books/:bookId`)
**File:** `src/pages/author/BookDetails.tsx`

**Sections:**
- Book information
- Status timeline
- Platform selling links (clickable)
- Selling stats
- Royalty summary

#### 27. Submit Book (`/author/books/submit`)
**File:** `src/pages/author/SubmitBook.tsx`

**Same as Admin Create Book form**

#### 28. Royalty Summary (`/author/royalty`)
**File:** `src/pages/author/RoyaltySummary.tsx`

**Features:**
- Month/Year filter
- Summary card:
  - Total Selling Units
  - Net Royalty
  - Payment Date
  - Payment Status
- Book-wise breakdown table
- Platform-wise breakdown
- Payment details (if paid):
  - Bank account
  - UTR number
  - Payment proof (downloadable)

#### 29. Referral Earnings (`/author/referrals`)
**File:** `src/pages/author/ReferralEarnings.tsx`

**Sections:**
- Referral code display (with copy button)
- Earnings summary:
  - Available Balance
  - Utilized Balance
- Referrals table:
  - Author Name
  - Author ID
  - Enrollment Date
  - Payment Status
  - Earning

#### 30. Bank Accounts (`/author/bank-accounts`)
**File:** `src/pages/author/BankAccounts.tsx`

**Features:**
- Bank account cards
- Add New Account button
- Edit/Delete actions
- Primary account badge

**Add/Edit Bank Account Modal:**
- Form with validation
- Account number confirmation
- IFSC code validation

#### 31. Ticket Listing (`/author/tickets`)
**File:** `src/pages/author/TicketListing.tsx`

**Features:**
- Create Ticket button
- Tickets table
- Status filter
- Click to open chat

#### 32. Create Ticket (`/author/tickets/create`)
**File:** `src/pages/author/CreateTicket.tsx`

**Form:**
- Title
- Description
- Category
- Discussion Time (time picker)
- Discussion Day (date picker)
- Attachments (file upload)

#### 33. Chat Window (`/author/tickets/:ticketId/chat`)
**File:** `src/pages/author/ChatWindow.tsx`

**Features:**
- Ticket information
- Message thread
- Message input
- Attachment support

---

## Reusable Components

### 1. Button Component
**File:** `src/components/common/Button.tsx`

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}
```

### 2. Input Component
**File:** `src/components/common/Input.tsx`

**Props:**
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
}
```

### 3. Select Component
**File:** `src/components/common/Select.tsx`

**Props:**
```typescript
interface SelectProps {
  label?: string;
  options: { label: string; value: string | number }[];
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}
```

### 4. Table Component
**File:** `src/components/common/Table.tsx`

**Props:**
```typescript
interface TableProps<T> {
  columns: {
    key: string;
    label: string;
    render?: (row: T) => React.ReactNode;
  }[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
}
```

### 5. Modal Component
**File:** `src/components/common/Modal.tsx`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}
```

### 6. KPI Card Component
**File:** `src/components/dashboard/KPICard.tsx`

**Props:**
```typescript
interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'blue' | 'green' | 'yellow' | 'red';
}
```

### 7. Pagination Component
**File:** `src/components/common/Pagination.tsx`

**Props:**
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}
```

---

## State Management (Redux Toolkit)

### Auth Slice
**File:** `src/redux/slices/authSlice.ts`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Actions
- login
- logout
- register
- verifyOTP
- changePassword
```

### Admin Slice
**File:** `src/redux/slices/adminSlice.ts`

```typescript
interface AdminState {
  dashboard: {
    kpis: KPIData;
    monthlyStats: MonthlyStats;
    topAuthors: Author[];
  };
  authors: {
    list: Author[];
    pagination: Pagination;
    selectedAuthor: Author | null;
  };
  loading: boolean;
  error: string | null;
}

// Actions
- fetchDashboard
- fetchAuthors
- createAuthor
- updateAuthor
- restrictAuthor
```

### Author Slice
**File:** `src/redux/slices/authorSlice.ts`

```typescript
interface AuthorState {
  profile: AuthorProfile | null;
  stats: AuthorStats;
  books: Book[];
  royalty: RoyaltySummary[];
  referrals: Referral[];
  loading: boolean;
  error: string | null;
}

// Actions
- fetchProfile
- updateProfile
- fetchBooks
- fetchRoyalty
- fetchReferrals
```

### Book Slice
**File:** `src/redux/slices/bookSlice.ts`

```typescript
interface BookState {
  books: Book[];
  selectedBook: Book | null;
  pagination: Pagination;
  filters: BookFilters;
  loading: boolean;
  error: string | null;
}

// Actions
- fetchBooks
- fetchBookDetails
- createBook
- updateBook
- updateSales
```

---

## Routing

### Route Configuration
**File:** `src/routes/AppRoutes.tsx`

```typescript
// Public Routes
/ - Home
/books - Books Listing
/books/:bookId - Book Details
/authors - Authors Listing
/authors/:authorId - Author Details

// Auth Routes
/admin/login - Admin Login
/author/login - Author Login
/author/register - Author Registration
/author/verify-otp - Verify OTP

// Admin Routes (Protected)
/admin/dashboard - Dashboard
/admin/authors - Author Listing
/admin/authors/create - Create Author
/admin/authors/:authorId - Author Details
/admin/authors/:authorId/edit - Edit Author
/admin/books - Book Listing
/admin/books/create - Create Book
/admin/books/:bookId - Book Details
/admin/financial/sales - Sales Update
/admin/financial/royalty - Royalty Payment
/admin/pricing - Pricing Configuration
/admin/support - Support Tickets

// Author Routes (Protected)
/author/dashboard - Dashboard
/author/profile - Profile
/author/profile/edit - Edit Profile
/author/books - Book Listing
/author/books/submit - Submit Book
/author/books/:bookId - Book Details
/author/royalty - Royalty Summary
/author/referrals - Referral Earnings
/author/bank-accounts - Bank Accounts
/author/tickets - Support Tickets
/author/tickets/create - Create Ticket
/author/tickets/:ticketId/chat - Chat Window
```

### Protected Route Component
```typescript
const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};
```

---

## API Integration

### Axios Configuration
**File:** `src/api/axios.config.ts`

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Logout user
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);
```

### Service Example
**File:** `src/services/authService.ts`

```typescript
export const authService = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/admin/login', { email, password }),

  register: (data: AuthorRegisterData) =>
    apiClient.post('/auth/author/register', data),

  verifyOTP: (email: string, otp: string) =>
    apiClient.post('/auth/author/verify-otp', { email, otp }),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.put('/auth/change-password', { oldPassword, newPassword })
};
```

---

## Forms & Validation

### React Hook Form + Zod Example

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = (data: LoginFormData) => {
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('email')}
        error={errors.email?.message}
        label="Email"
      />
      <Input
        {...register('password')}
        type="password"
        error={errors.password?.message}
        label="Password"
      />
      <Button type="submit">Login</Button>
    </form>
  );
};
```

---

## Styling Guidelines

### Tailwind CSS Classes

**Color Palette:**
```
Primary: bg-blue-600, text-blue-600
Secondary: bg-gray-600, text-gray-600
Success: bg-green-600, text-green-600
Danger: bg-red-600, text-red-600
Warning: bg-yellow-500, text-yellow-500
```

**Button Styles:**
```tsx
// Primary Button
className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"

// Secondary Button
className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"

// Danger Button
className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
```

**Card Styles:**
```tsx
className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
```

**Input Styles:**
```tsx
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
```

---

## Responsive Design

### Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Mobile-First Approach
```tsx
<div className="flex flex-col md:flex-row gap-4">
  {/* Stacks vertically on mobile, horizontal on desktop */}
</div>
```

---

## Performance Optimization

1. **Code Splitting:**
```typescript
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
```

2. **Memoization:**
```typescript
const MemoizedTable = memo(Table);
```

3. **Image Optimization:**
```tsx
<img loading="lazy" src={url} alt="..." />
```

4. **Debouncing Search:**
```typescript
const debouncedSearch = useDebounce(searchTerm, 500);
```

---

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

---

**Last Updated:** March 2026
**Maintained By:** Frontend Team
**Contact:** frontend@povital.com
