import express from 'express';
import {
  getAllSkills,
  getSkill,
  createSkillHandler,
  updateSkillHandler,
  deleteSkillHandler,
  bulkCreateSkillsHandler,
  getSkillsSummaryHandler,
} from '../controllers/skillsController';
import {
  validateGetSkills,
  validateGetSkill,
  validateCreateSkill,
  validateUpdateSkill,
  validateDeleteSkill,
  validateBulkCreateSkills,
} from '../validators/skillsValidator';
import { extractOrganizationId, validateOrganizationAccess } from '../middleware/tenant';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication and organization context
router.use(protect);
router.use(extractOrganizationId);
router.use(validateOrganizationAccess);

// Get skills summary
router.get('/summary', getSkillsSummaryHandler);

// Get all skills with pagination and filters
router.get('/', validateGetSkills, getAllSkills);

// Get skill by ID
router.get('/:skillLevelId', validateGetSkill, getSkill);

// Create a new skill
router.post('/', validateCreateSkill, createSkillHandler);

// Bulk create skills
router.post('/bulk', validateBulkCreateSkills, bulkCreateSkillsHandler);

// Update a skill
router.put('/:skillLevelId', validateUpdateSkill, updateSkillHandler);
router.patch('/:skillLevelId', validateUpdateSkill, updateSkillHandler);

// Delete a skill
router.delete('/:skillLevelId', validateDeleteSkill, deleteSkillHandler);

export default router;



