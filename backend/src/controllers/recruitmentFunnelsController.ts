import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Connection } from 'mongoose';
import { DatabaseService } from '../services/tenant/databaseService';
import { getRecruitmentFunnelsModel } from '../services/recruitmentFunnelsService';
import {
  getRecruitmentFunnels,
  getRecruitmentFunnelById,
  createRecruitmentFunnel,
  updateRecruitmentFunnel,
  deleteRecruitmentFunnel,
  getRecruitmentFunnelStats,
  RecruitmentFunnelQueryFilters,
  PaginationOptions,
} from '../services/recruitmentFunnelsService';
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

export const getAllRecruitmentFunnels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const RecruitmentFunnelsModel = getRecruitmentFunnelsModel(connection);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: RecruitmentFunnelQueryFilters = {};

    if (req.query.positionId) filters.positionId = req.query.positionId as string;

    const pagination: PaginationOptions = { page, limit };
    const result = await getRecruitmentFunnels(RecruitmentFunnelsModel, filters, pagination);
    return res.status(200).json({ 
      success: true, 
      data: {
        data: result.data,
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    logger.error('Error in getAllRecruitmentFunnels:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch recruitment funnels' });
  }
};

export const getRecruitmentFunnel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const RecruitmentFunnelsModel = getRecruitmentFunnelsModel(connection);

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Recruitment funnel ID is required' });
    }

    const funnel = await getRecruitmentFunnelById(RecruitmentFunnelsModel, id);
    if (!funnel) {
      return res.status(404).json({ success: false, error: 'Recruitment funnel not found' });
    }
    return res.status(200).json({ success: true, data: funnel });
  } catch (error: any) {
    logger.error('Error in getRecruitmentFunnel:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch recruitment funnel' });
  }
};

export const createRecruitmentFunnelRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const RecruitmentFunnelsModel = getRecruitmentFunnelsModel(connection);
    const orgId = req.organizationId || (req as any).user?.organizationId;

    if (!orgId) {
      return res.status(400).json({ success: false, error: 'Organization ID not found' });
    }

    const funnelData = {
      ...req.body,
      orgId,
    };

    const funnel = await createRecruitmentFunnel(RecruitmentFunnelsModel, funnelData);
    return res.status(201).json({ success: true, data: funnel });
  } catch (error: any) {
    logger.error('Error in createRecruitmentFunnelRecord:', error);
    if (error.message.includes('already exists')) {
      return res.status(409).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: error.message || 'Failed to create recruitment funnel' });
  }
};

export const updateRecruitmentFunnelRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const RecruitmentFunnelsModel = getRecruitmentFunnelsModel(connection);

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Recruitment funnel ID is required' });
    }

    const funnel = await updateRecruitmentFunnel(RecruitmentFunnelsModel, id, req.body);
    if (!funnel) {
      return res.status(404).json({ success: false, error: 'Recruitment funnel not found' });
    }
    return res.status(200).json({ success: true, data: funnel });
  } catch (error: any) {
    logger.error('Error in updateRecruitmentFunnelRecord:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update recruitment funnel' });
  }
};

export const deleteRecruitmentFunnelRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const RecruitmentFunnelsModel = getRecruitmentFunnelsModel(connection);

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Recruitment funnel ID is required' });
    }

    const deleted = await deleteRecruitmentFunnel(RecruitmentFunnelsModel, id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Recruitment funnel not found' });
    }
    return res.status(200).json({ success: true, message: 'Recruitment funnel deleted successfully' });
  } catch (error: any) {
    logger.error('Error in deleteRecruitmentFunnelRecord:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete recruitment funnel' });
  }
};

export const getRecruitmentFunnelStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const RecruitmentFunnelsModel = getRecruitmentFunnelsModel(connection);

    const stats = await getRecruitmentFunnelStats(RecruitmentFunnelsModel);
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Error in getRecruitmentFunnelStatistics:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch recruitment funnel statistics' });
  }
};

