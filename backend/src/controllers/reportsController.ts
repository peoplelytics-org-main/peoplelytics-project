import { Request, Response, NextFunction } from 'express';
import { Connection } from 'mongoose';
import {
  getReportsModel,
  getEmployeeModel,
  getAttendanceModel,
  createReport,
  getReports,
  getReportById,
  deleteReport,
} from '../services/reportsService';
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
 * Get all reports
 * GET /api/reports
 */
export const getAllReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const ReportsModel = getReportsModel(connection);

    const type = req.query.type as string;
    const generatedBy = (req as any).user?.id || req.query.generatedBy as string;

    const reports = await getReports(ReportsModel, type, generatedBy);

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error: any) {
    logger.error('Error in getAllReports:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch reports',
    });
  }
};

/**
 * Get report by ID
 * GET /api/reports/:reportId
 */
export const getReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;
    if (!reportId) {
      return res.status(400).json({
        success: false,
        error: 'Report ID is required',
      });
    }

    const connection = getOrgConnection(req);
    const ReportsModel = getReportsModel(connection);

    const report = await getReportById(ReportsModel, reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    logger.error('Error in getReport:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch report',
    });
  }
};

/**
 * Generate a new report
 * POST /api/reports/generate
 */
export const generateReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, parameters } = req.body;

    if (!name || !type || !parameters || !parameters.dateRange) {
      return res.status(400).json({
        success: false,
        error: 'Name, type, and parameters with dateRange are required',
      });
    }

    const connection = getOrgConnection(req);
    const ReportsModel = getReportsModel(connection);
    const EmployeeModel = getEmployeeModel(connection);
    const AttendanceModel = getAttendanceModel(connection);

    const user = (req as any).user;
    const reportId = `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const report = await createReport(
      ReportsModel,
      EmployeeModel,
      AttendanceModel,
      {
        reportId,
        name,
        type,
        generatedBy: user?.id || 'system',
        parameters: {
          dateRange: {
            start: new Date(parameters.dateRange.start),
            end: new Date(parameters.dateRange.end),
          },
          departments: parameters.departments,
          employeeId: parameters.employeeId,
        },
      }
    );

    return res.status(201).json({
      success: true,
      data: report,
      message: 'Report generated successfully',
    });
  } catch (error: any) {
    logger.error('Error in generateReport:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate report',
    });
  }
};

/**
 * Delete a report
 * DELETE /api/reports/:reportId
 */
export const deleteReportHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;
    if (!reportId) {
      return res.status(400).json({
        success: false,
        error: 'Report ID is required',
      });
    }

    const connection = getOrgConnection(req);
    const ReportsModel = getReportsModel(connection);

    const deleted = await deleteReport(ReportsModel, reportId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error in deleteReportHandler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete report',
    });
  }
};



