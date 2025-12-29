import express from 'express';
import {
  getAllLeaves,
  getLeave,
  createLeaveController,
  updateLeaveController,
  deleteLeaveController,
  getLeavesStatsController,
} from '../controllers/leavesController';
import {
  validateGetLeaves,
  validateGetLeave,
  validateCreateLeave,
  validateUpdateLeave,
  validateDeleteLeave,
} from '../validators/leavesValidator';

const router = express.Router();

router.get('/', validateGetLeaves, getAllLeaves);
router.get('/stats', getLeavesStatsController);
router.get('/:leaveId', validateGetLeave, getLeave);
router.post('/', validateCreateLeave, createLeaveController);
router.put('/:leaveId', validateUpdateLeave, updateLeaveController);
router.delete('/:leaveId', validateDeleteLeave, deleteLeaveController);

export default router;



