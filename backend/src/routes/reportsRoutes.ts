import express from 'express';
import {
  getAllReports,
  getReport,
  generateReport,
  deleteReportHandler,
} from '../controllers/reportsController';
import { extractOrganizationId, validateOrganizationAccess } from '../middleware/tenant';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication and organization context
router.use(protect);
router.use(extractOrganizationId);
router.use(validateOrganizationAccess);

// Generate a new report
router.post('/generate', generateReport);

// Get all reports
router.get('/', getAllReports);

// Get report by ID
router.get('/:reportId', getReport);

// Delete a report
router.delete('/:reportId', deleteReportHandler);

export default router;



