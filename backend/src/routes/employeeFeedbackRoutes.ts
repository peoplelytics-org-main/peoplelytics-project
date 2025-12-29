import express from 'express';
import {
  getAllEmployeeFeedback,
  getEmployeeFeedbackByIdHandler,
  getEmployeeFeedbackByEmployee,
  createEmployeeFeedbackHandler,
  updateEmployeeFeedbackHandler,
  deleteEmployeeFeedbackHandler,
  getEmployeeFeedbackStatistics,
} from '../controllers/employeeFeedbackController';
import {
  validateGetEmployeeFeedback,
  validateGetEmployeeFeedbackById,
  validateGetEmployeeFeedbackByEmployee,
  validateCreateEmployeeFeedback,
  validateUpdateEmployeeFeedback,
  validateDeleteEmployeeFeedback,
} from '../validators/employeeFeedbackValidator';
import { extractOrganizationId, validateOrganizationAccess } from '../middleware/tenant';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication and organization context
router.use(protect);
router.use(extractOrganizationId);
router.use(validateOrganizationAccess);

// Get employee feedback statistics
router.get('/stats', getEmployeeFeedbackStatistics);

// Get employee feedback by employee ID (latest)
router.get('/employee/:employeeId', validateGetEmployeeFeedbackByEmployee, getEmployeeFeedbackByEmployee);

// Get all employee feedback with pagination and filters
router.get('/', validateGetEmployeeFeedback, getAllEmployeeFeedback);

// Get employee feedback by ID
router.get('/:satisId', validateGetEmployeeFeedbackById, getEmployeeFeedbackByIdHandler);

// Create a new employee feedback record
router.post('/', validateCreateEmployeeFeedback, createEmployeeFeedbackHandler);

// Update an employee feedback record
router.put('/:satisId', validateUpdateEmployeeFeedback, updateEmployeeFeedbackHandler);
router.patch('/:satisId', validateUpdateEmployeeFeedback, updateEmployeeFeedbackHandler);

// Delete an employee feedback record
router.delete('/:satisId', validateDeleteEmployeeFeedback, deleteEmployeeFeedbackHandler);

export default router;

