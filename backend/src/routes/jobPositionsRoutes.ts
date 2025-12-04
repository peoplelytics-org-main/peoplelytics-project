import express from 'express';
import {
  getAllJobPositions,
  getJobPosition,
  createJobPositionHandler,
  updateJobPositionHandler,
  deleteJobPositionHandler,
  getJobPositionsStatistics,
} from '../controllers/jobPositionsController';
import {
  validateGetJobPositions,
  validateGetJobPosition,
  validateCreateJobPosition,
  validateUpdateJobPosition,
  validateDeleteJobPosition,
} from '../validators/jobPositionsValidator';
import { extractOrganizationId, validateOrganizationAccess } from '../middleware/tenant';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication and organization context
router.use(protect);
router.use(extractOrganizationId);
router.use(validateOrganizationAccess);

// Get job positions statistics
router.get('/stats', getJobPositionsStatistics);

// Get all job positions with pagination and filters
router.get('/', validateGetJobPositions, getAllJobPositions);

// Get job position by ID
router.get('/:positionId', validateGetJobPosition, getJobPosition);

// Create a new job position
router.post('/', validateCreateJobPosition, createJobPositionHandler);

// Update a job position
router.put('/:positionId', validateUpdateJobPosition, updateJobPositionHandler);
router.patch('/:positionId', validateUpdateJobPosition, updateJobPositionHandler);

// Delete a job position
router.delete('/:positionId', validateDeleteJobPosition, deleteJobPositionHandler);

export default router;



