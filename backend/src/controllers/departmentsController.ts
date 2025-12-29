import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Connection } from 'mongoose';
import { 
  getDepartmentsModel, 
  getDepartments, 
  getDepartmentById, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment, 
  getDepartmentsStats,
  DepartmentsQueryFilters,
  PaginationOptions
} from '../services/departmentsService';
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
 * Get all departments with pagination and filters
 * GET /api/departments
 */
export const getAllDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const DepartmentsModel = getDepartmentsModel(connection);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: DepartmentsQueryFilters = {};
    
    if (req.query.name) filters.name = req.query.name as string;
    if (req.query.location) filters.location = req.query.location as string;
    if (req.query.headOfDepartment) filters.headOfDepartment = req.query.headOfDepartment as string;
    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    }
    if (req.query.search) filters.search = req.query.search as string;

    const pagination: PaginationOptions = { page, limit };
    const result = await getDepartments(DepartmentsModel, filters, pagination);
    return res.status(200).json({ success: true, data: { data: result.data, pagination: result.pagination } });
  } catch (error: any) {
    logger.error('Error in getAllDepartments:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch departments' });
  }
};

/**
 * Get department by ID
 * GET /api/departments/:departmentId
 */
export const getDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const DepartmentsModel = getDepartmentsModel(connection);
    const department = await getDepartmentById(DepartmentsModel, req.params.departmentId);

    if (!department) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    return res.status(200).json({ success: true, data: department });
  } catch (error: any) {
    logger.error('Error in getDepartment:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch department' });
  }
};

/**
 * Create a new department
 * POST /api/departments
 */
export const createDepartmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const DepartmentsModel = getDepartmentsModel(connection);
    const department = await createDepartment(DepartmentsModel, req.body);

    return res.status(201).json({ success: true, data: department });
  } catch (error: any) {
    logger.error('Error in createDepartment:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: 'Department ID already exists' });
    }
    return res.status(500).json({ success: false, error: error.message || 'Failed to create department' });
  }
};

/**
 * Update a department
 * PUT /api/departments/:departmentId
 */
export const updateDepartmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const DepartmentsModel = getDepartmentsModel(connection);
    const department = await updateDepartment(DepartmentsModel, req.params.departmentId, req.body);

    if (!department) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    return res.status(200).json({ success: true, data: department });
  } catch (error: any) {
    logger.error('Error in updateDepartment:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update department' });
  }
};

/**
 * Delete a department
 * DELETE /api/departments/:departmentId
 */
export const deleteDepartmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const DepartmentsModel = getDepartmentsModel(connection);
    const deleted = await deleteDepartment(DepartmentsModel, req.params.departmentId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    return res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error: any) {
    logger.error('Error in deleteDepartment:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete department' });
  }
};

/**
 * Get departments statistics
 * GET /api/departments/stats
 */
export const getDepartmentsStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const DepartmentsModel = getDepartmentsModel(connection);
    const stats = await getDepartmentsStats(DepartmentsModel);

    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Error in getDepartmentsStats:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch departments statistics' });
  }
};



