import { Request, Response, NextFunction } from 'express';
import { Connection } from 'mongoose';
import {
  getAnalyticsModel,
  getEmployeeModel,
  getAttendanceModel,
  calculateAndStoreMetric,
  getAnalytics,
  getAdvancedAnalytics,
  predictTurnover,
  calculateTrend,
  forecastHeadcount,
} from '../services/analyticsService';
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
 * Get analytics metrics
 * GET /api/analytics
 */
export const getAnalyticsMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const AnalyticsModel = getAnalyticsModel(connection);

    const metricType = req.query.metricType as string;
    const period = req.query.period as string;

    const analytics = await getAnalytics(AnalyticsModel, metricType, period);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    logger.error('Error in getAnalyticsMetrics:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analytics',
    });
  }
};

/**
 * Calculate and store analytics metric
 * POST /api/analytics/calculate
 */
export const calculateAnalyticsMetric = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { metricType, period } = req.body;

    if (!metricType || !period) {
      return res.status(400).json({
        success: false,
        error: 'Metric type and period are required',
      });
    }

    const connection = getOrgConnection(req);
    const AnalyticsModel = getAnalyticsModel(connection);
    const EmployeeModel = getEmployeeModel(connection);
    const AttendanceModel = getAttendanceModel(connection);

    const analytics = await calculateAndStoreMetric(
      AnalyticsModel,
      EmployeeModel,
      AttendanceModel,
      metricType,
      period
    );

    return res.status(200).json({
      success: true,
      data: analytics,
      message: 'Analytics metric calculated and stored successfully',
    });
  } catch (error: any) {
    logger.error('Error in calculateAnalyticsMetric:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate analytics metric',
    });
  }
};

/**
 * Get dashboard analytics (all key metrics)
 * GET /api/analytics/dashboard
 */
export const getDashboardAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const AnalyticsModel = getAnalyticsModel(connection);
    const EmployeeModel = getEmployeeModel(connection);
    const AttendanceModel = getAttendanceModel(connection);

    const period = (req.query.period as string) || 'monthly';

    // Calculate all key metrics
    const [turnoverRate, averageTenure, attendanceRate, headcount] = await Promise.all([
      calculateAndStoreMetric(AnalyticsModel, EmployeeModel, AttendanceModel, 'turnover_rate', period),
      calculateAndStoreMetric(AnalyticsModel, EmployeeModel, AttendanceModel, 'average_tenure', period),
      calculateAndStoreMetric(AnalyticsModel, EmployeeModel, AttendanceModel, 'attendance_rate', period),
      calculateAndStoreMetric(AnalyticsModel, EmployeeModel, AttendanceModel, 'headcount', period),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        turnoverRate: turnoverRate.value,
        averageTenure: averageTenure.value,
        attendanceRate: attendanceRate.value,
        headcount: headcount.value,
        breakdown: {
          byDepartment: headcount.breakdown.byDepartment,
          byGender: headcount.breakdown.byGender,
          byLocation: headcount.breakdown.byLocation,
        },
      },
    });
  } catch (error: any) {
    logger.error('Error in getDashboardAnalytics:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch dashboard analytics',
    });
  }
};

/**
 * Get advanced analytics with predictions and trends
 * GET /api/analytics/advanced
 */
export const getAdvancedAnalyticsEndpoint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const AnalyticsModel = getAnalyticsModel(connection);
    const EmployeeModel = getEmployeeModel(connection);
    const AttendanceModel = getAttendanceModel(connection);

    const analytics = await getAdvancedAnalytics(AnalyticsModel, EmployeeModel, AttendanceModel);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    logger.error('Error in getAdvancedAnalyticsEndpoint:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch advanced analytics',
    });
  }
};

/**
 * Get predictive analytics
 * GET /api/analytics/predictive
 */
export const getPredictiveAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const EmployeeModel = getEmployeeModel(connection);
    const months = parseInt(req.query.months as string) || 6;

    const prediction = await predictTurnover(EmployeeModel, months);

    return res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error: any) {
    logger.error('Error in getPredictiveAnalytics:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch predictive analytics',
    });
  }
};

/**
 * Get trend analysis
 * GET /api/analytics/trends
 */
export const getTrendAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const AnalyticsModel = getAnalyticsModel(connection);
    const metricType = req.query.metricType as string || 'turnover_rate';
    const periods = parseInt(req.query.periods as string) || 6;

    const trend = await calculateTrend(AnalyticsModel, metricType, periods);

    return res.status(200).json({
      success: true,
      data: trend,
    });
  } catch (error: any) {
    logger.error('Error in getTrendAnalysis:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch trend analysis',
    });
  }
};

/**
 * Get forecast
 * GET /api/analytics/forecast
 */
export const getForecast = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const EmployeeModel = getEmployeeModel(connection);
    const months = parseInt(req.query.months as string) || 6;

    const forecast = await forecastHeadcount(EmployeeModel, months);

    return res.status(200).json({
      success: true,
      data: forecast,
    });
  } catch (error: any) {
    logger.error('Error in getForecast:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch forecast',
    });
  }
};

