import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Connection } from 'mongoose';
import { DatabaseService } from '../services/tenant/databaseService';
import { getExitInterviewModel } from '../services/exitInterviewsService';
import {
  getExitInterviews,
  getExitInterviewById,
  createExitInterview,
  updateExitInterview,
  deleteExitInterview,
  getExitInterviewStats,
  ExitInterviewQueryFilters,
  PaginationOptions,
} from '../services/exitInterviewsService';
import { logger } from '../utils/helpers/logger';

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

export const getAllExitInterviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const ExitInterviewModel = getExitInterviewModel(connection);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: ExitInterviewQueryFilters = {};

    if (req.query.employeeId) filters.employeeId = req.query.employeeId as string;
    if (req.query.primaryReasonForLeaving) filters.primaryReasonForLeaving = req.query.primaryReasonForLeaving as string;
    if (req.query.sentiment) filters.sentiment = req.query.sentiment as 'Positive' | 'Neutral' | 'Negative';

    const pagination: PaginationOptions = { page, limit };
    const result = await getExitInterviews(ExitInterviewModel, filters, pagination);
    return res.status(200).json({ 
      success: true, 
      data: {
        data: result.data,
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    logger.error('Error in getAllExitInterviews:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch exit interviews' });
  }
};

export const getExitInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const ExitInterviewModel = getExitInterviewModel(connection);

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Exit interview ID is required' });
    }

    const interview = await getExitInterviewById(ExitInterviewModel, id);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Exit interview not found' });
    }
    return res.status(200).json({ success: true, data: interview });
  } catch (error: any) {
    logger.error('Error in getExitInterview:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch exit interview' });
  }
};

export const createExitInterviewRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const ExitInterviewModel = getExitInterviewModel(connection);
    const orgId = req.organizationId || (req as any).user?.organizationId;

    if (!orgId) {
      return res.status(400).json({ success: false, error: 'Organization ID not found' });
    }

    const interviewData = {
      ...req.body,
      orgId,
    };

    const interview = await createExitInterview(ExitInterviewModel, interviewData);
    return res.status(201).json({ success: true, data: interview });
  } catch (error: any) {
    logger.error('Error in createExitInterviewRecord:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create exit interview' });
  }
};

export const updateExitInterviewRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const ExitInterviewModel = getExitInterviewModel(connection);

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Exit interview ID is required' });
    }

    const interview = await updateExitInterview(ExitInterviewModel, id, req.body);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Exit interview not found' });
    }
    return res.status(200).json({ success: true, data: interview });
  } catch (error: any) {
    logger.error('Error in updateExitInterviewRecord:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update exit interview' });
  }
};

export const deleteExitInterviewRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const ExitInterviewModel = getExitInterviewModel(connection);

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Exit interview ID is required' });
    }

    const deleted = await deleteExitInterview(ExitInterviewModel, id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Exit interview not found' });
    }
    return res.status(200).json({ success: true, message: 'Exit interview deleted successfully' });
  } catch (error: any) {
    logger.error('Error in deleteExitInterviewRecord:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete exit interview' });
  }
};

export const getExitInterviewStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const ExitInterviewModel = getExitInterviewModel(connection);

    const stats = await getExitInterviewStats(ExitInterviewModel);
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Error in getExitInterviewStatistics:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch exit interview statistics' });
  }
};

