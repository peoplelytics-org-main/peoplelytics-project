import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Connection } from 'mongoose';
import { 
  getLeavesModel, 
  getLeaves, 
  getLeaveById, 
  createLeave, 
  updateLeave, 
  deleteLeave, 
  getLeavesStats,
  LeavesQueryFilters,
  PaginationOptions
} from '../services/leavesService';
import { logger } from '../utils/helpers/logger';
import { DatabaseService } from '../services/tenant/databaseService';

const getOrgConnection = (req: Request): Connection => {
  const orgId = req.organizationId || (req as any).user?.organizationId;
  if (!orgId) throw new Error('Organization ID not found in request');
  const dbService = DatabaseService.getInstance();
  return dbService.getOrganizationConnection(orgId);
};

export const getAllLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const LeavesModel = getLeavesModel(connection);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: LeavesQueryFilters = {};
    if (req.query.employeeId) filters.employeeId = req.query.employeeId as string;
    if (req.query.leaveType) filters.leaveType = req.query.leaveType as string;
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.startDate) filters.startDate = req.query.startDate as string;
    if (req.query.endDate) filters.endDate = req.query.endDate as string;
    if (req.query.search) filters.search = req.query.search as string;
    const pagination: PaginationOptions = { page, limit };
    const result = await getLeaves(LeavesModel, filters, pagination);
    return res.status(200).json({ success: true, data: { data: result.data, pagination: result.pagination } });
  } catch (error: any) {
    logger.error('Error in getAllLeaves:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch leaves' });
  }
};

export const getLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const LeavesModel = getLeavesModel(connection);
    const leave = await getLeaveById(LeavesModel, req.params.leaveId);
    if (!leave) return res.status(404).json({ success: false, error: 'Leave not found' });
    return res.status(200).json({ success: true, data: leave });
  } catch (error: any) {
    logger.error('Error in getLeave:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch leave' });
  }
};

export const createLeaveController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const LeavesModel = getLeavesModel(connection);
    const leave = await createLeave(LeavesModel, req.body);
    return res.status(201).json({ success: true, data: leave });
  } catch (error: any) {
    logger.error('Error in createLeave:', error);
    if (error.code === 11000) return res.status(409).json({ success: false, error: 'Leave ID already exists' });
    return res.status(500).json({ success: false, error: error.message || 'Failed to create leave' });
  }
};

export const updateLeaveController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const LeavesModel = getLeavesModel(connection);
    const leave = await updateLeave(LeavesModel, req.params.leaveId, req.body);
    if (!leave) return res.status(404).json({ success: false, error: 'Leave not found' });
    return res.status(200).json({ success: true, data: leave });
  } catch (error: any) {
    logger.error('Error in updateLeave:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update leave' });
  }
};

export const deleteLeaveController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const LeavesModel = getLeavesModel(connection);
    const deleted = await deleteLeave(LeavesModel, req.params.leaveId);
    if (!deleted) return res.status(404).json({ success: false, error: 'Leave not found' });
    return res.status(200).json({ success: true, message: 'Leave deleted successfully' });
  } catch (error: any) {
    logger.error('Error in deleteLeave:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete leave' });
  }
};

export const getLeavesStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const LeavesModel = getLeavesModel(connection);
    const stats = await getLeavesStats(LeavesModel);
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Error in getLeavesStats:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch leaves statistics' });
  }
};



