import express from 'express';
import {
  getAllAttendance,
  getAttendance,
  createAttendanceHandler,
  updateAttendanceHandler,
  deleteAttendanceHandler,
  bulkCreateAttendanceHandler,
  getAttendanceSummaryHandler,
} from '../controllers/attendanceController';
import {
  validateGetAttendance,
  validateGetAttendanceById,
  validateCreateAttendance,
  validateUpdateAttendance,
  validateDeleteAttendance,
  validateBulkCreateAttendance,
} from '../validators/attendanceValidator';
import { extractOrganizationId, validateOrganizationAccess } from '../middleware/tenant';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication and organization context
router.use(protect);
router.use(extractOrganizationId);
router.use(validateOrganizationAccess);

// Get attendance summary
router.get('/summary', getAttendanceSummaryHandler);

// Get all attendance records with pagination and filters
router.get('/', validateGetAttendance, getAllAttendance);

// Get attendance record by ID
router.get('/:attendanceId', validateGetAttendanceById, getAttendance);

// Create a new attendance record
router.post('/', validateCreateAttendance, createAttendanceHandler);

// Bulk create attendance records
router.post('/bulk', validateBulkCreateAttendance, bulkCreateAttendanceHandler);

// Update an attendance record
router.put('/:attendanceId', validateUpdateAttendance, updateAttendanceHandler);
router.patch('/:attendanceId', validateUpdateAttendance, updateAttendanceHandler);

// Delete an attendance record
router.delete('/:attendanceId', validateDeleteAttendance, deleteAttendanceHandler);

export default router;



