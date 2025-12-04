import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Connection } from 'mongoose';
import {
  getJobPositionsModel,
  getJobPositions,
  getJobPositionById,
  createJobPosition,
  updateJobPosition,
  deleteJobPosition,
  getJobPositionsStats,
  JobPositionsQueryFilters,
  PaginationOptions,
} from '../services/jobPositionsService';
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
 * Get all job positions with pagination and filters
 * GET /api/job-positions
 */
export const getAllJobPositions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const JobPositionsModel = getJobPositionsModel(connection);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: JobPositionsQueryFilters = {};
    if (req.query.department) filters.department = req.query.department as string;
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.positionType) filters.positionType = req.query.positionType as string;
    if (req.query.budgetStatus) filters.budgetStatus = req.query.budgetStatus as string;

    const pagination: PaginationOptions = { page, limit };

    const result = await getJobPositions(JobPositionsModel, filters, pagination);

    return res.status(200).json({
      success: true,
      data: {
        data: result.data,
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    logger.error('Error in getAllJobPositions:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch job positions',
    });
  }
};

/**
 * Get job position by ID
 * GET /api/job-positions/:positionId
 */
export const getJobPosition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { positionId } = req.params;
    if (!positionId) {
      return res.status(400).json({
        success: false,
        error: 'Position ID is required',
      });
    }

    const connection = getOrgConnection(req);
    const JobPositionsModel = getJobPositionsModel(connection);

    const position = await getJobPositionById(JobPositionsModel, positionId);

    if (!position) {
      return res.status(404).json({
        success: false,
        error: 'Job position not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: position,
    });
  } catch (error: any) {
    logger.error('Error in getJobPosition:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch job position',
    });
  }
};

/**
 * Create a new job position
 * POST /api/job-positions
 */
export const createJobPositionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const JobPositionsModel = getJobPositionsModel(connection);

    const position = await createJobPosition(JobPositionsModel, req.body);

    return res.status(201).json({
      success: true,
      data: position,
      message: 'Job position created successfully',
    });
  } catch (error: any) {
    logger.error('Error in createJobPositionHandler:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create job position',
    });
  }
};

/**
 * Update a job position
 * PUT /api/job-positions/:positionId
 */
export const updateJobPositionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { positionId } = req.params;
    if (!positionId) {
      return res.status(400).json({
        success: false,
        error: 'Position ID is required',
      });
    }

    const connection = getOrgConnection(req);
    const JobPositionsModel = getJobPositionsModel(connection);

    const position = await updateJobPosition(JobPositionsModel, positionId, req.body);

    if (!position) {
      return res.status(404).json({
        success: false,
        error: 'Job position not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: position,
      message: 'Job position updated successfully',
    });
  } catch (error: any) {
    logger.error('Error in updateJobPositionHandler:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update job position',
    });
  }
};

/**
 * Delete a job position
 * DELETE /api/job-positions/:positionId
 */
export const deleteJobPositionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { positionId } = req.params;
    if (!positionId) {
      return res.status(400).json({
        success: false,
        error: 'Position ID is required',
      });
    }

    const connection = getOrgConnection(req);
    const JobPositionsModel = getJobPositionsModel(connection);

    const deleted = await deleteJobPosition(JobPositionsModel, positionId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Job position not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job position deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error in deleteJobPositionHandler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete job position',
    });
  }
};

/**
 * Get job positions statistics
 * GET /api/job-positions/stats
 */
export const getJobPositionsStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const JobPositionsModel = getJobPositionsModel(connection);

    const stats = await getJobPositionsStats(JobPositionsModel);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Error in getJobPositionsStatistics:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch job positions statistics',
    });
  }
};

