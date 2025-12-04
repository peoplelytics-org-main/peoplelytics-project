import express from 'express';
import {
  getAnalyticsMetrics,
  calculateAnalyticsMetric,
  getDashboardAnalytics,
  getAdvancedAnalyticsEndpoint,
  getPredictiveAnalytics,
  getTrendAnalysis,
  getForecast,
} from '../controllers/analyticsController';
import { extractOrganizationId, validateOrganizationAccess } from '../middleware/tenant';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication and organization context
router.use(protect);
router.use(extractOrganizationId);
router.use(validateOrganizationAccess);

// Get dashboard analytics (all key metrics)
router.get('/dashboard', getDashboardAnalytics);

// Advanced analytics endpoints
router.get('/advanced', getAdvancedAnalyticsEndpoint);
router.get('/predictive', getPredictiveAnalytics);
router.get('/trends', getTrendAnalysis);
router.get('/forecast', getForecast);

// Calculate and store analytics metric
router.post('/calculate', calculateAnalyticsMetric);

// Get analytics metrics
router.get('/', getAnalyticsMetrics);

export default router;

