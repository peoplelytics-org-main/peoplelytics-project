import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Connection } from 'mongoose';
import {
  getAttendanceModel,
  getAttendanceRecords,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  bulkCreateAttendance,
  getAttendanceSummary,
  AttendanceQueryFilters,
  PaginationOptions,
} from '../services/attendanceService';
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
 * Get all attendance records with pagination and filters
 * GET /api/attendance
 */
export const getAllAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const AttendanceModel = getAttendanceModel(connection);

    // Extract query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: AttendanceQueryFilters = {};
    if (req.query.employeeId) filters.employeeId = req.query.employeeId as string;
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.startDate) filters.startDate = req.query.startDate as string;
    if (req.query.endDate) filters.endDate = req.query.endDate as string;

    const pagination: PaginationOptions = { page, limit };

    const result = await getAttendanceRecords(AttendanceModel, filters, pagination);

    return res.status(200).json({
      success: true,
      data: {
        data: result.data,
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    logger.error('Error in getAllAttendance:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch attendance records',
    });
  }
};

/**
 * Get attendance record by ID
 * GET /api/attendance/:attendanceId
 */
export const getAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { attendanceId } = req.params;
    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        error: 'Attendance ID is required',
      });
    }
    const connection = getOrgConnection(req);
    const AttendanceModel = getAttendanceModel(connection);

    const attendance = await getAttendanceById(AttendanceModel, attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    logger.error('Error in getAttendance:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch attendance record',
    });
  }
};

/**
 * Create a new attendance record
 * POST /api/attendance
 */
export const createAttendanceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getOrgConnection(req);
    const AttendanceModel = getAttendanceModel(connection);

    const attendance = await createAttendance(AttendanceModel, req.body);

    return res.status(201).json({
      success: true,
      data: attendance,
      message: 'Attendance record created successfully',
    });
  } catch (error: any) {
    logger.error('Error in createAttendanceHandler:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create attendance record',
    });
  }
};

/**
 * Update an attendance record
 * PUT /api/attendance/:attendanceId
 */
export const updateAttendanceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { attendanceId } = req.params;
    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        error: 'Attendance ID is required',
      });
    }
    const connection = getOrgConnection(req);
    const AttendanceModel = getAttendanceModel(connection);

    const attendance = await updateAttendance(AttendanceModel, attendanceId, req.body);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: attendance,
      message: 'Attendance record updated successfully',
    });
  } catch (error: any) {
    logger.error('Error in updateAttendanceHandler:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update attendance record',
    });
  }
};

/**
 * Delete an attendance record
 * DELETE /api/attendance/:attendanceId
 */
export const deleteAttendanceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { attendanceId } = req.params;
    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        error: 'Attendance ID is required',
      });
    }
    const connection = getOrgConnection(req);
    const AttendanceModel = getAttendanceModel(connection);

    const deleted = await deleteAttendance(AttendanceModel, attendanceId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error in deleteAttendanceHandler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete attendance record',
    });
  }
};

/**
 * Bulk create attendance records
 * POST /api/attendance/bulk
 */
export const bulkCreateAttendanceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { attendanceRecords } = req.body;
    const connection = getOrgConnection(req);
    const AttendanceModel = getAttendanceModel(connection);

    const result = await bulkCreateAttendance(AttendanceModel, attendanceRecords);

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
    logger.error('Error in bulkCreateAttendanceHandler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to bulk create attendance records',
    });
  }
};

/**
 * Get attendance summary statistics
 * GET /api/attendance/summary
 */
export const getAttendanceSummaryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: AttendanceQueryFilters = {};
    if (req.query.employeeId) filters.employeeId = req.query.employeeId as string;
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.startDate) filters.startDate = req.query.startDate as string;
    if (req.query.endDate) filters.endDate = req.query.endDate as string;

    const connection = getOrgConnection(req);
    const AttendanceModel = getAttendanceModel(connection);

    const summary = await getAttendanceSummary(AttendanceModel, filters);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    logger.error('Error in getAttendanceSummaryHandler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch attendance summary',
    });
  }
};

