import { Router } from 'express';
import {
  getAllRecruitmentFunnels,
  getRecruitmentFunnel,
  createRecruitmentFunnelRecord,
  updateRecruitmentFunnelRecord,
  deleteRecruitmentFunnelRecord,
  getRecruitmentFunnelStatistics,
} from '../controllers/recruitmentFunnelsController';
import {
  validateCreateRecruitmentFunnel,
  validateUpdateRecruitmentFunnel,
  validateGetRecruitmentFunnels,
  validateGetRecruitmentFunnelById,
  validateDeleteRecruitmentFunnel,
} from '../validators/recruitmentFunnelsValidator';

const router = Router();

router.get('/', validateGetRecruitmentFunnels, getAllRecruitmentFunnels);
router.get('/stats', getRecruitmentFunnelStatistics);
router.get('/:id', validateGetRecruitmentFunnelById, getRecruitmentFunnel);
router.post('/', validateCreateRecruitmentFunnel, createRecruitmentFunnelRecord);
router.put('/:id', validateUpdateRecruitmentFunnel, updateRecruitmentFunnelRecord);
router.delete('/:id', validateDeleteRecruitmentFunnel, deleteRecruitmentFunnelRecord);

export default router;



