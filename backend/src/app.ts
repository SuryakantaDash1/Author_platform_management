import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './middlewares/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import adminAuthRoutes from './routes/admin-auth.routes';
import authorAuthRoutes from './routes/author-auth.routes';
import adminRoutes from './routes/admin.routes';
import authorRoutes from './routes/author.routes';
import bookRoutes from './routes/book.routes';
import financialRoutes from './routes/financial.routes';
import supportRoutes from './routes/support.routes';
import referralRoutes from './routes/referral.routes';
import utilityRoutes from './routes/utility.routes';
import paymentConfigRoutes from './routes/payment-config.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes); // General auth routes (OAuth, etc.)
app.use('/api/admin/auth', adminAuthRoutes); // Admin authentication
app.use('/api/author/auth', authorAuthRoutes); // Author authentication
app.use('/api/admin', adminRoutes);
app.use('/api/author', authorRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/utility', utilityRoutes);
app.use('/api/payment-config', paymentConfigRoutes);  // Public pricing route
app.use('/api/admin/payment-config', paymentConfigRoutes);  // Admin CRUD routes

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to POVITAL Author Platform API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// 404 handler - must be after all routes
app.use(notFound);

// Error handling middleware - must be last
app.use(errorHandler);

export default app;
