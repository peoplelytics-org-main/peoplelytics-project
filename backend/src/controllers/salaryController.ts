import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Connection } from 'mongoose';
import { 
  getSalaryModel, 
  getSalaryRecords, 
  getSalaryById, 
  getSalaryByEmployeeId,
  createSalary, 
  updateSalary, 
  deleteSalary, 
  getSalaryStats,
  SalaryQueryFilters,
  PaginationOptions
} from '../services/salaryService';
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
 * Get all salary records with pagination and filters
 * GET /api/salary
 */
export const getAllSalaries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const SalaryModel = getSalaryModel(connection);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: SalaryQueryFilters = {};
    
    if (req.query.employeeId) filters.employeeId = req.query.employeeId as string;
    if (req.query.name) filters.name = req.query.name as string;
    if (req.query.search) filters.search = req.query.search as string;

    const pagination: PaginationOptions = { page, limit };
    const result = await getSalaryRecords(SalaryModel, filters, pagination);
    return res.status(200).json({ success: true, data: { data: result.data, pagination: result.pagination } });
  } catch (error: any) {
    logger.error('Error in getAllSalaries:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch salary records' });
  }
};

/**
 * Get salary by ID
 * GET /api/salary/:salaryId
 */
export const getSalary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const SalaryModel = getSalaryModel(connection);
    const salary = await getSalaryById(SalaryModel, req.params.salaryId);

    if (!salary) {
      return res.status(404).json({ success: false, error: 'Salary record not found' });
    }

    return res.status(200).json({ success: true, data: salary });
  } catch (error: any) {
    logger.error('Error in getSalary:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch salary record' });
  }
};

/**
 * Get salary by employee ID
 * GET /api/salary/employee/:employeeId
 */
export const getSalaryByEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const SalaryModel = getSalaryModel(connection);
    const salary = await getSalaryByEmployeeId(SalaryModel, req.params.employeeId);

    if (!salary) {
      return res.status(404).json({ success: false, error: 'Salary record not found for this employee' });
    }

    return res.status(200).json({ success: true, data: salary });
  } catch (error: any) {
    logger.error('Error in getSalaryByEmployee:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch salary record' });
  }
};

/**
 * Create a new salary record
 * POST /api/salary
 */
export const createSalaryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const SalaryModel = getSalaryModel(connection);
    const salary = await createSalary(SalaryModel, req.body);

    return res.status(201).json({ success: true, data: salary });
  } catch (error: any) {
    logger.error('Error in createSalary:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: 'Salary ID already exists' });
    }
    return res.status(500).json({ success: false, error: error.message || 'Failed to create salary record' });
  }
};

/**
 * Update a salary record
 * PUT /api/salary/:salaryId
 */
export const updateSalaryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const SalaryModel = getSalaryModel(connection);
    const salary = await updateSalary(SalaryModel, req.params.salaryId, req.body);

    if (!salary) {
      return res.status(404).json({ success: false, error: 'Salary record not found' });
    }

    return res.status(200).json({ success: true, data: salary });
  } catch (error: any) {
    logger.error('Error in updateSalary:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update salary record' });
  }
};

/**
 * Delete a salary record
 * DELETE /api/salary/:salaryId
 */
export const deleteSalaryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const SalaryModel = getSalaryModel(connection);
    const deleted = await deleteSalary(SalaryModel, req.params.salaryId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Salary record not found' });
    }

    return res.status(200).json({ success: true, message: 'Salary record deleted successfully' });
  } catch (error: any) {
    logger.error('Error in deleteSalary:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete salary record' });
  }
};

/**
 * Get salary statistics
 * GET /api/salary/stats
 */
export const getSalaryStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const SalaryModel = getSalaryModel(connection);
    const stats = await getSalaryStats(SalaryModel);

    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Error in getSalaryStats:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch salary statistics' });
  }
};



