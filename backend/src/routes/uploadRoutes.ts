import express from 'express';
import {
  uploadEmployees,
  uploadAttendance,
} from '../controllers/uploadController';
import { extractOrganizationId, validateOrganizationAccess } from '../middleware/tenant';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication and organization context
router.use(protect);
router.use(extractOrganizationId);
router.use(validateOrganizationAccess);

// Upload employees from CSV/Excel
router.post('/employees', uploadEmployees);

// Upload attendance from CSV/Excel
router.post('/attendance', uploadAttendance);

export default router;



