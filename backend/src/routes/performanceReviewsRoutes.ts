import { Router } from 'express';
import {
  getAllPerformanceReviews,
  getPerformanceReview,
  createPerformanceReviewRecord,
  updatePerformanceReviewRecord,
  deletePerformanceReviewRecord,
  getPerformanceReviewStatistics,
} from '../controllers/performanceReviewsController';
import {
  validateCreatePerformanceReview,
  validateUpdatePerformanceReview,
  validateGetPerformanceReviews,
  validateGetPerformanceReviewById,
  validateDeletePerformanceReview,
} from '../validators/performanceReviewsValidator';

const router = Router();

router.get('/', validateGetPerformanceReviews, getAllPerformanceReviews);
router.get('/stats', getPerformanceReviewStatistics);
router.get('/:id', validateGetPerformanceReviewById, getPerformanceReview);
router.post('/', validateCreatePerformanceReview, createPerformanceReviewRecord);
router.put('/:id', validateUpdatePerformanceReview, updatePerformanceReviewRecord);
router.delete('/:id', validateDeletePerformanceReview, deletePerformanceReviewRecord);

export default router;



