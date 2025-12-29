import { Router } from 'express';
import {
  getAllExitInterviews,
  getExitInterview,
  createExitInterviewRecord,
  updateExitInterviewRecord,
  deleteExitInterviewRecord,
  getExitInterviewStatistics,
} from '../controllers/exitInterviewsController';
import {
  validateCreateExitInterview,
  validateUpdateExitInterview,
  validateGetExitInterviews,
  validateGetExitInterviewById,
  validateDeleteExitInterview,
} from '../validators/exitInterviewsValidator';

const router = Router();

router.get('/', validateGetExitInterviews, getAllExitInterviews);
router.get('/stats', getExitInterviewStatistics);
router.get('/:id', validateGetExitInterviewById, getExitInterview);
router.post('/', validateCreateExitInterview, createExitInterviewRecord);
router.put('/:id', validateUpdateExitInterview, updateExitInterviewRecord);
router.delete('/:id', validateDeleteExitInterview, deleteExitInterviewRecord);

export default router;



