import { Request, Response, NextFunction } from 'express';
import { Connection } from 'mongoose';
import { upload } from '../middleware/upload';
import { parseUploadedFile, mapRowToEmployee, mapRowToAttendance, validateEmployeeData, validateAttendanceData, validateRecruitmentFunnelData, mapRowToRecruitmentFunnel } from '../services/fileUploadService';
import { 
  getRecruitmentFunnelsModel, 
  bulkCreateRecruitmentFunnels
} from '../services/recruitmentFunnelsService';
import { getEmployeeModel } from '../services/employeeService';
import { getAttendanceModel } from '../services/attendanceService';
import { bulkCreateEmployees } from '../services/employeeService';
import { bulkCreateAttendance } from '../services/attendanceService';
import { DatabaseService } from '../services/tenant/databaseService';
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

/**
 * Upload employees from CSV/Excel file
 * POST /api/upload/employees
 */
export const uploadEmployees = [
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      const connection = getOrgConnection(req);
      const EmployeeModel = getEmployeeModel(connection);

      // Parse file
      const rows = await parseUploadedFile(req.file.path, req.file.mimetype);

      // Map and validate rows
      const employees: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const employeeData = mapRowToEmployee(row);
        const validation = validateEmployeeData(employeeData);

        if (validation.valid) {
          // Convert hireDate to Date if it's a string
          if (typeof employeeData.hireDate === 'string') {
            employeeData.hireDate = new Date(employeeData.hireDate);
          }
          if (employeeData.terminationDate && typeof employeeData.terminationDate === 'string') {
            employeeData.terminationDate = new Date(employeeData.terminationDate);
          }
          employees.push(employeeData);
        } else {
          errors.push(`Row ${i + 2}: ${validation.errors.join(', ')}`);
        }
      }

      if (employees.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid employee data found in file',
          errors,
        });
      }

      // Bulk create employees
      const result = await bulkCreateEmployees(EmployeeModel, employees);

      return res.status(201).json({
        success: true,
        data: {
          created: result.created,
          failed: result.failed,
          errors: [...errors, ...result.errors],
        },
        message: `Upload completed: ${result.created} employees created, ${result.failed} failed`,
      });
    } catch (error: any) {
      logger.error('Error in uploadEmployees:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload employees',
      });
    }
  },
];

/**
 * Upload attendance from CSV/Excel file
 * POST /api/upload/attendance
 */
export const uploadAttendance = [
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      const connection = getOrgConnection(req);
      const AttendanceModel = getAttendanceModel(connection);

      // Parse file
      const rows = await parseUploadedFile(req.file.path, req.file.mimetype);

      // Map and validate rows
      const attendanceRecords: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const attendanceData = mapRowToAttendance(row);
        const validation = validateAttendanceData(attendanceData);

        if (validation.valid) {
          attendanceRecords.push(attendanceData);
        } else {
          errors.push(`Row ${i + 2}: ${validation.errors.join(', ')}`);
        }
      }

      if (attendanceRecords.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid attendance data found in file',
          errors,
        });
      }

      // Bulk create attendance records
      const result = await bulkCreateAttendance(AttendanceModel, attendanceRecords);

      return res.status(201).json({
        success: true,
        data: {
          created: result.created,
          failed: result.failed,
          errors: [...errors, ...result.errors],
        },
        message: `Upload completed: ${result.created} attendance records created, ${result.failed} failed`,
      });
    } catch (error: any) {
      logger.error('Error in uploadAttendance:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload attendance',
      });
    }
  },
];


export const uploadRecruitmentFunnels = [
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

      const connection = getOrgConnection(req);
      const RecruitmentFunnelModel = getRecruitmentFunnelsModel(connection); // Ensure this matches your Service export name

      // 1. Validate Org ID exists on Request
      const currentOrgId = req.organizationId || (req as any).user?.organizationId;
      if (!currentOrgId) {
        return res.status(400).json({ success: false, error: 'User is not associated with an Organization' });
      }

      const rows = await parseUploadedFile(req.file.path, req.file.mimetype);
      const funnels: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const funnelData = mapRowToRecruitmentFunnel(row);
        
        // 2. Explicitly attach Org ID
        funnelData.organizationId = currentOrgId;

        const validation = validateRecruitmentFunnelData(funnelData);

        if (validation.valid) {
          funnels.push(funnelData);
        } else {
          errors.push(`Row ${i + 2}: ${validation.errors.join(', ')}`);
        }
      }

      if (funnels.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid recruitment funnel data found',
          errors,
        });
      }

      const result = await bulkCreateRecruitmentFunnels(RecruitmentFunnelModel, funnels);

      return res.status(201).json({
        success: true,
        data: {
          created: result.created,
          failed: result.failed,
          errors: [...errors, ...result.errors],
        },
        message: `Upload completed: ${result.created} created, ${result.failed} failed`,
      });

    } catch (error: any) {
      logger.error('Error in uploadRecruitmentFunnels:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload recruitment funnels',
      });
    }
  },
];