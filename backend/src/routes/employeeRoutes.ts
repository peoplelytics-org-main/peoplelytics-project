import express from 'express';
import {
  getAllEmployees,
  getEmployee,
  createEmployeeHandler,
  updateEmployeeHandler,
  deleteEmployeeHandler,
  bulkCreateEmployeesHandler,
  getEmployeeStatistics,
} from '../controllers/employeeController';
import {
  validateGetEmployees,
  validateGetEmployee,
  validateCreateEmployee,
  validateUpdateEmployee,
  validateDeleteEmployee,
  validateBulkCreateEmployees,
} from '../validators/employeeValidator';
import { extractOrganizationId, validateOrganizationAccess } from '../middleware/tenant';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication and organization context
router.use(protect);
router.use(extractOrganizationId);
router.use(validateOrganizationAccess);

// Get employee statistics
router.get('/stats', getEmployeeStatistics);

// Get all employees with pagination and filters
router.get('/', validateGetEmployees, getAllEmployees);

// Get employee by ID
router.get('/:employeeId', validateGetEmployee, getEmployee);

// Create a new employee
router.post('/', validateCreateEmployee, createEmployeeHandler);

// Bulk create employees
router.post('/bulk', validateBulkCreateEmployees, bulkCreateEmployeesHandler);

// Update an employee
router.put('/:employeeId', validateUpdateEmployee, updateEmployeeHandler);
router.patch('/:employeeId', validateUpdateEmployee, updateEmployeeHandler);

// Delete an employee
router.delete('/:employeeId', validateDeleteEmployee, deleteEmployeeHandler);

export default router;



