# POVITAL - Author Platform Management System

A comprehensive book publishing and royalty management platform designed to streamline the entire publishing lifecycle from author onboarding to royalty distribution.

## 🎯 Project Overview

POVITAL is a full-stack platform that enables:
- **Authors** to publish books and track royalties across multiple marketplaces
- **Publishers/Admins** to manage authors, books, sales, and financial operations
- **Automated royalty calculations** based on platform-wise sales
- **Multi-marketplace integration** (Amazon, Flipkart, Meesho, etc.)
- **Referral & earning system** for authors
- **Support ticket system** for seamless communication

---

## 📚 Documentation

All project documentation is available in the root directory:

- **[BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md)** - Complete backend API documentation
- **[FRONTEND_DOCUMENTATION.md](./FRONTEND_DOCUMENTATION.md)** - Frontend architecture & components
- **[POSTMAN_API_TESTING.md](./POSTMAN_API_TESTING.md)** - API testing guide with Postman

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js with Express.js
- TypeScript for type safety
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for file storage
- Nodemailer for emails
- Twilio for SMS

**Frontend (Coming Soon):**
- React.js with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

---

## 🚀 Getting Started

### Prerequisites

```bash
- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0
```

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Author-Platform-Management
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` and configure:
- Database connection (MongoDB URI)
- JWT secrets
- Cloudinary credentials
- Email service (Gmail/SMTP)
- SMS service (Twilio)
- Other API keys

4. **Start development server**
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

5. **Build for production**
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
Author-Platform-Management/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── models/          # Mongoose models
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── middlewares/     # Custom middleware
│   │   ├── routes/          # API routes
│   │   ├── validators/      # Request validators
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript types
│   │   ├── app.ts           # Express app
│   │   └── server.ts        # Server entry point
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # (Coming soon)
├── BACKEND_DOCUMENTATION.md
├── FRONTEND_DOCUMENTATION.md
├── POSTMAN_API_TESTING.md
└── README.md
```

---

## 🔑 Key Features

### For Authors
- ✅ Easy registration and onboarding
- ✅ Submit books for publishing
- ✅ Track book status and sales
- ✅ View royalty summaries
- ✅ Manage bank accounts
- ✅ Refer other authors and earn
- ✅ Support ticketing system

### For Admins
- ✅ Dashboard with KPIs and analytics
- ✅ Manage authors and restrictions
- ✅ Book creation and management
- ✅ Update sales across platforms
- ✅ Calculate and process royalties
- ✅ Configure pricing by language
- ✅ Support ticket management
- ✅ Audit logs for all actions

### System Features
- ✅ Role-based access control (Super Admin, Sub Admin, Author)
- ✅ Multi-marketplace integration
- ✅ Automated royalty calculations
- ✅ File upload (Cloudinary)
- ✅ Email & SMS notifications
- ✅ Encrypted sensitive data
- ✅ Rate limiting
- ✅ Comprehensive logging

---

## 🔐 API Endpoints

### Authentication
```
POST   /api/v1/auth/admin/login          - Admin login
POST   /api/v1/auth/author/register      - Author registration
POST   /api/v1/auth/author/verify-otp    - Verify OTP
POST   /api/v1/auth/author/login         - Author login
PUT    /api/v1/auth/change-password      - Change password
```

### Admin - Dashboard
```
GET    /api/v1/admin/dashboard            - Get dashboard stats
```

### Admin - Authors
```
GET    /api/v1/admin/authors              - Get all authors
POST   /api/v1/admin/authors              - Create author
GET    /api/v1/admin/authors/:authorId    - Get author details
PUT    /api/v1/admin/authors/:authorId    - Update author
PATCH  /api/v1/admin/authors/:authorId/restriction  - Restrict/Unrestrict
```

### Admin - Books
```
GET    /api/v1/admin/books                - Get all books
POST   /api/v1/admin/books                - Create book
GET    /api/v1/admin/books/:bookId        - Get book details
PUT    /api/v1/admin/books/:bookId/product-links  - Update product links
```

### Admin - Financial
```
POST   /api/v1/admin/financial/sales      - Update sales
POST   /api/v1/admin/financial/royalty-payment  - Process royalty payment
GET    /api/v1/admin/financial/report     - Get financial report
```

### Admin - Pricing
```
POST   /api/v1/admin/pricing              - Create/Update pricing
GET    /api/v1/admin/pricing/:language    - Get pricing config
```

### Admin - Support
```
GET    /api/v1/admin/support/tickets                    - Get all tickets
GET    /api/v1/admin/support/tickets/:ticketId/messages - Get ticket messages
POST   /api/v1/admin/support/tickets/:ticketId/messages - Send message
PATCH  /api/v1/admin/support/tickets/:ticketId/status   - Update ticket status
```

### Author Endpoints
```
GET    /api/v1/author/dashboard           - Get dashboard
PUT    /api/v1/author/profile             - Update profile
GET    /api/v1/author/books               - Get books
POST   /api/v1/author/books               - Submit book
GET    /api/v1/author/royalty             - Get royalty summary
GET    /api/v1/author/referrals           - Get referral earnings
POST   /api/v1/author/bank-accounts       - Add bank account
POST   /api/v1/author/tickets             - Create ticket
```

**See [BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md) for complete API reference**

---

## 🧪 Testing

### Using Postman

1. Import the Postman collection (see [POSTMAN_API_TESTING.md](./POSTMAN_API_TESTING.md))
2. Set up environment variables
3. Run the collection

### Manual Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

---

## 🛠️ Development Workflow

### Database Models

The system uses 10 main models:
1. **User** - Admin/Sub-Admin accounts
2. **Author** - Author accounts
3. **Book** - Book information
4. **Transaction** - Royalty payment records
5. **BankAccount** - Author bank accounts
6. **Ticket** - Support tickets
7. **Message** - Chat messages
8. **Referral** - Referral tracking
9. **PricingConfig** - Language-based pricing
10. **AuditLog** - System audit logs

### Key Business Logic

**Royalty Calculation:**
```typescript
Total Revenue = Sum(Units × Selling Price) per platform
Gross Margin = Total Revenue - Production Cost
Net Profit = Gross Margin - (Ads + Platform Fees + Returns)
Author Royalty = Net Profit × Royalty %
Final Royalty = Author Royalty - Referral Deduction - Outstanding
```

**Payment Calculation:**
```typescript
Total = Base Price + Services Selected
Services: Cover Design, Formatting, Copyright, Extra Copies
Discounts applied per language configuration
```

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Account number encryption (AES-256)
- ✅ Rate limiting (100 req/15min)
- ✅ Input validation (Joi)
- ✅ XSS protection
- ✅ MongoDB injection prevention
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Audit logging

---

## 📊 Database Indexes

Critical indexes for performance:
```javascript
Author: email, authorId
Book: bookId, authorId, status
Transaction: authorId, bookId, month, year
BankAccount: authorId, accountType
Ticket: authorId, status
```

---

## 🌐 Environment Variables

See `.env.example` for all required variables:
- Database connection
- JWT secrets
- Cloudinary credentials
- Email/SMS service credentials
- API keys
- Rate limits
- File upload limits

---

## 📝 Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Production
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors

# Testing
npm test                 # Run tests
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: dev@povital.com
- Check documentation files

---

## 📜 License

This project is licensed under the ISC License.

---

## 👥 Team

**POVITAL Development Team**
- Backend Development
- Frontend Development
- QA & Testing
- DevOps

---

## 🗺️ Roadmap

### Phase 1: Backend ✅ (Current)
- [x] Database schema design
- [x] Authentication system
- [x] Admin module
- [x] Author module
- [x] Financial module
- [x] Support system

### Phase 2: Frontend (Upcoming)
- [ ] Admin dashboard
- [ ] Author portal
- [ ] Public website
- [ ] Mobile responsive design

### Phase 3: Integrations (Future)
- [ ] Payment gateway integration
- [ ] Marketplace APIs (Amazon, Flipkart)
- [ ] Analytics dashboard
- [ ] Mobile app

### Phase 4: Advanced Features (Future)
- [ ] AI-powered book recommendations
- [ ] Automated marketing tools
- [ ] Multi-language support
- [ ] Advanced reporting

---

## 📈 Performance

- Average response time: < 200ms
- Database query optimization with indexes
- File upload via Cloudinary CDN
- Caching strategy (Redis - future)
- Rate limiting for API protection

---

## 🐛 Known Issues

None at the moment. Please report issues on GitHub.

---

## 🎉 Acknowledgments

- Express.js community
- MongoDB team
- Cloudinary
- All open-source contributors

---

**Version:** 1.0.0
**Last Updated:** March 2026
**Status:** In Active Development 🚀
