import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Connection } from 'mongoose';
import {
  getEmployeeFeedbackModel,
  getEmployeeFeedback,
  getEmployeeFeedbackById,
  getEmployeeFeedbackByEmployeeId,
  createEmployeeFeedback,
  updateEmployeeFeedback,
  deleteEmployeeFeedback,
  getEmployeeFeedbackStats,
  EmployeeFeedbackQueryFilters,
  PaginationOptions,
} from '../services/employeeFeedbackService';
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
 * Get all employee feedback records with pagination and filters
 * GET /api/employee-feedback
 */
export const getAllEmployeeFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const EmployeeFeedbackModel = getEmployeeFeedbackModel(connection);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: EmployeeFeedbackQueryFilters = {};
    if (req.query.employeeId) filters.employeeId = req.query.employeeId as string;
    if (req.query.minEngagementScore) filters.minEngagementScore = parseInt(req.query.minEngagementScore as string);
    if (req.query.maxEngagementScore) filters.maxEngagementScore = parseInt(req.query.maxEngagementScore as string);

    const pagination: PaginationOptions = { page, limit };

    const result = await getEmployeeFeedback(EmployeeFeedbackModel, filters, pagination);

    return res.status(200).json({
      success: true,
      data: {
        data: result.data,
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    logger.error('Error in getAllEmployeeFeedback:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch employee feedback',
    });
  }
};

/**
 * Get employee feedback by ID
 * GET /api/employee-feedback/:satisId
 */
export const getEmployeeFeedbackByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { satisId } = req.params;
    if (!satisId) {
      return res.status(400).json({
        success: false,
        error: 'Satisfaction ID is required',
      });
    }

    const connection = getOrgConnection(req);
    const EmployeeFeedbackModel = getEmployeeFeedbackModel(connection);

    const feedback = await getEmployeeFeedbackById(EmployeeFeedbackModel, satisId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Employee feedback not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error: any) {
    logger.error('Error in getEmployeeFeedback:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch employee feedback',
    });
  }
};

/**
 * Get employee feedback by employee ID (latest)
 * GET /api/employee-feedback/employee/:employeeId
 */
export const getEmployeeFeedbackByEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId } = req.params;
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required',
      });
    }

    const connection = getOrgConnection(req);
    const EmployeeFeedbackModel = getEmployeeFeedbackModel(connection);

    const feedback = await getEmployeeFeedbackByEmployeeId(EmployeeFeedbackModel, employeeId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Employee feedback not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error: any) {
    logger.error('Error in getEmployeeFeedbackByEmployee:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch employee feedback',
    });
  }
};

/**
 * Create a new employee feedback record
 * POST /api/employee-feedback
 */
export const createEmployeeFeedbackHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const EmployeeFeedbackModel = getEmployeeFeedbackModel(connection);

    const feedback = await createEmployeeFeedback(EmployeeFeedbackModel, req.body);

    return res.status(201).json({
      success: true,
      data: feedback,
      message: 'Employee feedback created successfully',
    });
  } catch (error: any) {
    logger.error('Error in createEmployeeFeedbackHandler:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create employee feedback',
    });
  }
};

/**
 * Update an employee feedback record
 * PUT /api/employee-feedback/:satisId
 */
export const updateEmployeeFeedbackHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { satisId } = req.params;
    if (!satisId) {
      return res.status(400).json({
        success: false,
        error: 'Satisfaction ID is required',
      });
    }

    const connection = getOrgConnection(req);
    const EmployeeFeedbackModel = getEmployeeFeedbackModel(connection);

    const feedback = await updateEmployeeFeedback(EmployeeFeedbackModel, satisId, req.body);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Employee feedback not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: feedback,
      message: 'Employee feedback updated successfully',
    });
  } catch (error: any) {
    logger.error('Error in updateEmployeeFeedbackHandler:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update employee feedback',
    });
  }
};

/**
 * Delete an employee feedback record
 * DELETE /api/employee-feedback/:satisId
 */
export const deleteEmployeeFeedbackHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { satisId } = req.params;
    if (!satisId) {
      return res.status(400).json({
        success: false,
        error: 'Satisfaction ID is required',
      });
    }

    const connection = getOrgConnection(req);
    const EmployeeFeedbackModel = getEmployeeFeedbackModel(connection);

    const deleted = await deleteEmployeeFeedback(EmployeeFeedbackModel, satisId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Employee feedback not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Employee feedback deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error in deleteEmployeeFeedbackHandler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete employee feedback',
    });
  }
};

/**
 * Get employee feedback statistics
 * GET /api/employee-feedback/stats
 */
export const getEmployeeFeedbackStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const EmployeeFeedbackModel = getEmployeeFeedbackModel(connection);

    const stats = await getEmployeeFeedbackStats(EmployeeFeedbackModel);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Error in getEmployeeFeedbackStatistics:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch employee feedback statistics',
    });
  }
};

