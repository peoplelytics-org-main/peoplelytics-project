import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Connection } from 'mongoose';
import {
  getSkillsModel,
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  bulkCreateSkills,
  getSkillsSummary,
  SkillsQueryFilters,
  PaginationOptions,
} from '../services/skillsService';
import { logger } from '../utils/helpers/logger';
import { DatabaseService } from '../services/tenant/databaseService';

/**
 * Helper to get organization connection from request
 */
const getOrgConnection = (req: Request): Connection => {
  const orgId = req.organizationId || (req as any).user?.organizationId;
  
  if (!orgId) {
    throw new Error('Organization ID not found in request');
  }

  const dbService = DatabaseService.getInstance();
  return dbService.getOrganizationConnection(orgId);
};

/**
 * Get all skills with pagination and filters
 * GET /api/skills
 */
export const getAllSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const SkillsModel = getSkillsModel(connection);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: SkillsQueryFilters = {};
    if (req.query.employeeId) filters.employeeId = req.query.employeeId as string;
    if (req.query.skillName) filters.skillName = req.query.skillName as string;
    if (req.query.skillLevel) filters.skillLevel = req.query.skillLevel as string;

    const pagination: PaginationOptions = { page, limit };

    const result = await getSkills(SkillsModel, filters, pagination);

    return res.status(200).json({
      success: true,
      data: {
        data: result.data,
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    logger.error('Error in getAllSkills:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch skills',
    });
  }
};

/**
 * Get skill by ID
 * GET /api/skills/:skillLevelId
 */
export const getSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skillLevelId } = req.params;
    if (!skillLevelId) {
      return res.status(400).json({
        success: false,
        error: 'Skill level ID is required',
      });
    }

    const connection = getOrgConnection(req);
    const SkillsModel = getSkillsModel(connection);

    const skill = await getSkillById(SkillsModel, skillLevelId);

    if (!skill) {
      return res.status(404).json({
        success: false,
        error: 'Skill not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: skill,
    });
  } catch (error: any) {
    logger.error('Error in getSkill:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch skill',
    });
  }
};

/**
 * Create a new skill
 * POST /api/skills
 */
export const createSkillHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const SkillsModel = getSkillsModel(connection);

    const skill = await createSkill(SkillsModel, req.body);

    return res.status(201).json({
      success: true,
      data: skill,
      message: 'Skill created successfully',
    });
  } catch (error: any) {
    logger.error('Error in createSkillHandler:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create skill',
    });
  }
};

/**
 * Update a skill
 * PUT /api/skills/:skillLevelId
 */
export const updateSkillHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skillLevelId } = req.params;
    if (!skillLevelId) {
      return res.status(400).json({
        success: false,
        error: 'Skill level ID is required',
      });
    }

    const connection = getOrgConnection(req);
    const SkillsModel = getSkillsModel(connection);

    const skill = await updateSkill(SkillsModel, skillLevelId, req.body);

    if (!skill) {
      return res.status(404).json({
        success: false,
        error: 'Skill not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: skill,
      message: 'Skill updated successfully',
    });
  } catch (error: any) {
    logger.error('Error in updateSkillHandler:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update skill',
    });
  }
};

/**
 * Delete a skill
 * DELETE /api/skills/:skillLevelId
 */
export const deleteSkillHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skillLevelId } = req.params;
    if (!skillLevelId) {
      return res.status(400).json({
        success: false,
        error: 'Skill level ID is required',
      });
    }

    const connection = getOrgConnection(req);
    const SkillsModel = getSkillsModel(connection);

    const deleted = await deleteSkill(SkillsModel, skillLevelId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Skill not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error in deleteSkillHandler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete skill',
    });
  }
};

/**
 * Bulk create skills
 * POST /api/skills/bulk
 */
export const bulkCreateSkillsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skills } = req.body;
    const connection = getOrgConnection(req);
    const SkillsModel = getSkillsModel(connection);

    const result = await bulkCreateSkills(SkillsModel, skills);

    return res.status(201).json({
      success: true,
      data: {
        created: result.created,
        failed: result.failed,
        errors: result.errors,
      },
      message: `Bulk create completed: ${result.created} created, ${result.failed} failed`,
    });
  } catch (error: any) {
    logger.error('Error in bulkCreateSkillsHandler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to bulk create skills',
    });
  }
};

/**
 * Get skills summary statistics
 * GET /api/skills/summary
 */
export const getSkillsSummaryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const SkillsModel = getSkillsModel(connection);

    const summary = await getSkillsSummary(SkillsModel);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    logger.error('Error in getSkillsSummaryHandler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch skills summary',
    });
  }
};

