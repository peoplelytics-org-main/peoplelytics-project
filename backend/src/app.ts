import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import orgRoutes from "./routes/orgRoutes";
import employeeRoutes from './routes/employeeRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import skillsRoutes from './routes/skillsRoutes';
import jobPositionsRoutes from './routes/jobPositionsRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import reportsRoutes from './routes/reportsRoutes';
import uploadRoutes from './routes/uploadRoutes';
import recruitmentFunnelsRoutes from './routes/recruitmentFunnelsRoutes';
import performanceReviewsRoutes from './routes/performanceReviewsRoutes';
import exitInterviewsRoutes from './routes/exitInterviewsRoutes';
import departmentsRoutes from './routes/departmentsRoutes';
import salaryRoutes from './routes/salaryRoutes';
import accountsRoutes from './routes/accountsRoutes';
import expensesRoutes from './routes/expensesRoutes';
import leavesRoutes from './routes/leavesRoutes';
import employeeFeedbackRoutes from './routes/employeeFeedbackRoutes';
import searchRoutes from "./routes/searchRoutes";

//import { errorHandler } from './middleware/errorHandler';
//import { logging } from './middleware/logging';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration for production (supports multiple origins)
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL]
    : process.env.NODE_ENV === 'production'
      ? [] // Production requires explicit CORS_ORIGIN
      : ['http://localhost:3000']; // Development fallback

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-ID'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit']
}));

// Rate limiting - General limiter (more lenient)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});

// Rate limiting - Stricter for login/logout routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many login attempts from this IP, please try again later.',
      message: 'Too many login attempts from this IP, please try again later.'
    });
  }
});

// Rate limiting - More lenient for auth status checks
const authStatusLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 status checks per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many status checks from this IP, please try again later.',
      message: 'Too many status checks from this IP, please try again later.'
    });
  }
});

app.use(limiter);

// Cookie parser middleware (must be before routes)
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

//app.use(logging);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Import middleware
import { protect, restrictTo } from './middleware/authMiddleware';
import { extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess } from './middleware/tenant';

// API routes will be added here
// Apply rate limiters conditionally based on route
app.use('/api/auth', (req, res, next) => {
  // Apply strict limiter for login/logout
  if (req.path === '/login' || req.path === '/logout') {
    return authLimiter(req, res, next);
  }
  // Apply lenient limiter for /me status checks
  if (req.path === '/me') {
    return authStatusLimiter(req, res, next);
  }
  // Default to general limiter for other auth routes
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/organizations', protect, orgRoutes);
app.use("/api/search-org",searchRoutes);
app.use('/api/employees', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, employeeRoutes);
app.use('/api/attendance', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, attendanceRoutes);
app.use('/api/skills', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, skillsRoutes);
app.use('/api/job-positions', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, jobPositionsRoutes);
app.use('/api/analytics', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, analyticsRoutes);
app.use('/api/reports', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, reportsRoutes);
app.use('/api/upload', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, uploadRoutes);
app.use('/api/recruitment-funnels', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, recruitmentFunnelsRoutes);
app.use('/api/performance-reviews', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, performanceReviewsRoutes);
app.use('/api/exit-interviews', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, exitInterviewsRoutes);
app.use('/api/departments', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, departmentsRoutes);
app.use('/api/salary', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, salaryRoutes);
app.use('/api/accounts', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, accountsRoutes);
app.use('/api/expenses', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, expensesRoutes);
app.use('/api/leaves', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, leavesRoutes);
app.use('/api/employee-feedback', protect, extractOrganizationId, validateOrganizationAccess, checkOrganizationAccess, employeeFeedbackRoutes);

// Error handling middleware (must be last)
import { errorHandler } from './middleware/errorHandler';
app.use(errorHandler);

export default app;
