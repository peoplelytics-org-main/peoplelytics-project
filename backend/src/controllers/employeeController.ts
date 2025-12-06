import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Organization } from "../models/shared/Organization";
import { Connection } from 'mongoose';
import { 
  getEmployeeModel, 
  getEmployees, 
  getEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee, 
  bulkCreateEmployees,
  getEmployeeStats,
  EmployeeQueryFilters,
  PaginationOptions
} from '../services/employeeService';
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
 * Get all employees with pagination and filters
 * GET /api/employees
 */
export const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const EmployeeModel = getEmployeeModel(connection);

    // Extract query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: EmployeeQueryFilters = {};
    
    if (req.query.department) filters.department = req.query.department as string;
    if (req.query.location) filters.location = req.query.location as string;
    if (req.query.jobTitle) filters.jobTitle = req.query.jobTitle as string;
    if (req.query.isActive !== undefined) {
      const isActiveValue = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      if (isActiveValue !== undefined) {
        filters.isActive = isActiveValue;
      }
    }
    if (req.query.search) filters.search = req.query.search as string;
    if (req.query.managerId) filters.managerId = req.query.managerId as string;

    const pagination: PaginationOptions = { page, limit };

    const result = await getEmployees(EmployeeModel, filters, pagination);

    return res.status(200).json({
      success: true,
      data: {
        data: result.data,
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    logger.error('Error in getAllEmployees:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch employees',
    });
  }
};

/**
 * Get employee by ID
 * GET /api/employees/:employeeId
 */
export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
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
    const EmployeeModel = getEmployeeModel(connection);

    const employee = await getEmployeeById(EmployeeModel, employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    logger.error('Error in getEmployee:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch employee',
    });
  }
};

/**
 * Create a new employee
 * POST /api/employees
 */
export const createEmployeeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const EmployeeModel = getEmployeeModel(connection);

    const employee = await createEmployee(EmployeeModel, req.body);

    return res.status(201).json({
      success: true,
      data: employee,
      message: 'Employee created successfully',
    });
  } catch (error: any) {
    logger.error('Error in createEmployeeHandler:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create employee',
    });
  }
};

/**
 * Update an employee
 * PUT /api/employees/:employeeId
 */
export const updateEmployeeHandler = async (req: Request, res: Response, next: NextFunction) => {
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
    const EmployeeModel = getEmployeeModel(connection);

    const employee = await updateEmployee(EmployeeModel, employeeId, req.body);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
      message: 'Employee updated successfully',
    });
  } catch (error: any) {
    logger.error('Error in updateEmployeeHandler:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update employee',
    });
  }
};

/**
 * Delete an employee
 * DELETE /api/employees/:employeeId
 */
export const deleteEmployeeHandler = async (req: Request, res: Response, next: NextFunction) => {
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
    const EmployeeModel = getEmployeeModel(connection);

    const deleted = await deleteEmployee(EmployeeModel, employeeId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error in deleteEmployeeHandler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete employee',
    });
  }
};

/**
 * Bulk create employees
 * POST /api/employees/bulk
 */
export const bulkCreateEmployeesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employees } = req.body;
    const connection = getOrgConnection(req);
    const EmployeeModel = getEmployeeModel(connection);

    const result = await bulkCreateEmployees(EmployeeModel, employees);

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
    logger.error('Error in bulkCreateEmployeesHandler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to bulk create employees',
    });
  }
};

/**
 * Get employee statistics
 * GET /api/employees/stats
 */
export const getEmployeeStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const EmployeeModel = getEmployeeModel(connection);

    const stats = await getEmployeeStats(EmployeeModel);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Error in getEmployeeStatistics:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch employee statistics',
    });
  }
};

export const getAllEmployeesFromAllOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    // FIX 1: Initialize the DatabaseService instance
    const dbService = DatabaseService.getInstance();

    // 2. Fetch all registered organizations from Master DB
    const organizations = await Organization.find({});

    if (!organizations || organizations.length === 0) {
      res.json({ success: true, count: 0, data: [] });
      return;
    }

    // 3. Create an array of promises to fetch employees from each Tenant DB
    const employeePromises = organizations.map(async (org) => {
      try {
        // FIX 2: Use the existing pattern to get the model
        // A. Get the connection for this specific org
        const connection = dbService.getOrganizationConnection(org.orgId);
        
        // B. Use the helper imported at the top of this file to get the Model
        const EmployeeModel = getEmployeeModel(connection);
        
        // 4. Fetch all employees (using .lean() for performance)
        const employees = await EmployeeModel.find({}).lean();
        
        // 5. Attach source org ID
        return employees.map((emp: any) => ({
          ...emp,
          _sourceOrgId: org.orgId,
          organizationId: emp.organizationId || org.orgId 
        }));

      } catch (err) {
        // Log specific tenant failure but allow others to succeed
        logger.warn(`Failed to fetch employees for org: ${org.orgId}`, err);
        return []; 
      }
    });

    // 6. Wait for all DB queries to finish
    const results = await Promise.all(employeePromises);

    // 7. Flatten the array of arrays into a single list
    const allEmployees = results.flat();

    logger.info(`Fetched ${allEmployees.length} employees across ${organizations.length} organizations.`);

    res.json({ 
      success: true, 
      totalOrganizations: organizations.length,
      totalEmployees: allEmployees.length, 
      data: allEmployees 
    });

  } catch (error) {
    logger.error("Error fetching global employees:", error);
    res.status(500).json({ success: false, message: "Failed to fetch global employees" });
  }
};

