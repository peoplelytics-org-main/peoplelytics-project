import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Connection } from 'mongoose';
import { DatabaseService } from '../services/tenant/databaseService';
import { getPerformanceReviewModel } from '../services/performanceReviewsService';
import {
  getPerformanceReviews,
  getPerformanceReviewById,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
  getPerformanceReviewStats,
  PerformanceReviewQueryFilters,
  PaginationOptions,
} from '../services/performanceReviewsService';
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

export const getAllPerformanceReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const PerformanceReviewModel = getPerformanceReviewModel(connection);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: PerformanceReviewQueryFilters = {};

    if (req.query.employeeId) filters.employeeId = req.query.employeeId as string;
    if (req.query.performanceRating) filters.performanceRating = parseInt(req.query.performanceRating as string);
    if (req.query.potentialRating) filters.potentialRating = parseInt(req.query.potentialRating as string);

    const pagination: PaginationOptions = { page, limit };
    const result = await getPerformanceReviews(PerformanceReviewModel, filters, pagination);
    return res.status(200).json({ 
      success: true, 
      data: {
        data: result.data,
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    logger.error('Error in getAllPerformanceReviews:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch performance reviews' });
  }
};

export const getPerformanceReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const PerformanceReviewModel = getPerformanceReviewModel(connection);

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Performance review ID is required' });
    }

    const review = await getPerformanceReviewById(PerformanceReviewModel, id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Performance review not found' });
    }
    return res.status(200).json({ success: true, data: review });
  } catch (error: any) {
    logger.error('Error in getPerformanceReview:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch performance review' });
  }
};

export const createPerformanceReviewRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const PerformanceReviewModel = getPerformanceReviewModel(connection);

    const review = await createPerformanceReview(PerformanceReviewModel, req.body);
    return res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    logger.error('Error in createPerformanceReviewRecord:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create performance review' });
  }
};

export const updatePerformanceReviewRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const PerformanceReviewModel = getPerformanceReviewModel(connection);

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Performance review ID is required' });
    }

    const review = await updatePerformanceReview(PerformanceReviewModel, id, req.body);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Performance review not found' });
    }
    return res.status(200).json({ success: true, data: review });
  } catch (error: any) {
    logger.error('Error in updatePerformanceReviewRecord:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update performance review' });
  }
};

export const deletePerformanceReviewRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const PerformanceReviewModel = getPerformanceReviewModel(connection);

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Performance review ID is required' });
    }

    const deleted = await deletePerformanceReview(PerformanceReviewModel, id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Performance review not found' });
    }
    return res.status(200).json({ success: true, message: 'Performance review deleted successfully' });
  } catch (error: any) {
    logger.error('Error in deletePerformanceReviewRecord:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete performance review' });
  }
};

export const getPerformanceReviewStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const PerformanceReviewModel = getPerformanceReviewModel(connection);

    const stats = await getPerformanceReviewStats(PerformanceReviewModel);
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Error in getPerformanceReviewStatistics:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch performance review statistics' });
  }
};

