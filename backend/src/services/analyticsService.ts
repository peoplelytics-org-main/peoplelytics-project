import { Connection, Model } from 'mongoose';
import { IAnalytics, AnalyticsSchema } from '../models/tenant/Analytics';
import { IEmployee, EmployeeSchema } from '../models/tenant/Employee';
import { IAttendance, AttendanceSchema } from '../models/tenant/Attendance';
import { logger } from '../utils/helpers/logger';

/**
 * Get Analytics model for a specific organization connection
 */
export const getAnalyticsModel = (connection: Connection): Model<IAnalytics> => {
  if (connection.models.Analytics) {
    return connection.models.Analytics as Model<IAnalytics>;
  }
  return connection.model<IAnalytics>('Analytics', AnalyticsSchema);
};

/**
 * Get Employee model for a specific organization connection
 */
export const getEmployeeModel = (connection: Connection): Model<IEmployee> => {
  if (connection.models.Employee) {
    return connection.models.Employee as Model<IEmployee>;
  }
  return connection.model<IEmployee>('Employee', EmployeeSchema);
};

/**
 * Get Attendance model for a specific organization connection
 */
export const getAttendanceModel = (connection: Connection): Model<IAttendance> => {
  if (connection.models.Attendance) {
    return connection.models.Attendance as Model<IAttendance>;
  }
  return connection.model<IAttendance>('Attendance', AttendanceSchema);
};

/**
 * Calculate turnover rate
 */
export const calculateTurnoverRate = async (
  EmployeeModel: Model<IEmployee>,
  period: string
): Promise<number> => {
  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [totalEmployees, terminated] = await Promise.all([
      EmployeeModel.countDocuments({ hireDate: { $lte: now } }),
      EmployeeModel.countDocuments({
        terminationDate: { $gte: startDate, $lte: now }
      }),
    ]);

    if (totalEmployees === 0) return 0;
    return (terminated / totalEmployees) * 100;
  } catch (error) {
    logger.error('Error calculating turnover rate:', error);
    throw error;
  }
};

/**
 * Calculate average tenure
 */
export const calculateAverageTenure = async (
  EmployeeModel: Model<IEmployee>
): Promise<number> => {
  try {
    const employees = await EmployeeModel.find({
      terminationDate: { $exists: false }
    }).lean();

    if (employees.length === 0) return 0;

    const now = new Date();
    const totalTenure = employees.reduce((sum, emp) => {
      const hireDate = new Date(emp.hireDate);
      const diffTime = now.getTime() - hireDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return sum + diffDays;
    }, 0);

    return totalTenure / employees.length / 365.25; // Convert to years
  } catch (error) {
    logger.error('Error calculating average tenure:', error);
    throw error;
  }
};

/**
 * Calculate attendance rate
 */
export const calculateAttendanceRate = async (
  AttendanceModel: Model<IAttendance>,
  period: string
): Promise<number> => {
  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [total, present] = await Promise.all([
      AttendanceModel.countDocuments({
        date_time_in: { $gte: startDate, $lte: now }
      }),
      AttendanceModel.countDocuments({
        date_time_in: { $gte: startDate, $lte: now },
        status: 'Present'
      }),
    ]);

    if (total === 0) return 0;
    return (present / total) * 100;
  } catch (error) {
    logger.error('Error calculating attendance rate:', error);
    throw error;
  }
};

/**
 * Get analytics breakdown by department
 */
export const getBreakdownByDepartment = async (
  EmployeeModel: Model<IEmployee>
): Promise<Record<string, number>> => {
  try {
    const breakdown = await EmployeeModel.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    const result: Record<string, number> = {};
    breakdown.forEach((item: any) => {
      result[item._id] = item.count;
    });

    return result;
  } catch (error) {
    logger.error('Error getting breakdown by department:', error);
    throw error;
  }
};

/**
 * Get analytics breakdown by gender
 */
export const getBreakdownByGender = async (
  EmployeeModel: Model<IEmployee>
): Promise<Record<string, number>> => {
  try {
    const breakdown = await EmployeeModel.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ]);

    const result: Record<string, number> = {};
    breakdown.forEach((item: any) => {
      result[item._id] = item.count;
    });

    return result;
  } catch (error) {
    logger.error('Error getting breakdown by gender:', error);
    throw error;
  }
};

/**
 * Get analytics breakdown by location
 */
export const getBreakdownByLocation = async (
  EmployeeModel: Model<IEmployee>
): Promise<Record<string, number>> => {
  try {
    const breakdown = await EmployeeModel.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
    ]);

    const result: Record<string, number> = {};
    breakdown.forEach((item: any) => {
      result[item._id] = item.count;
    });

    return result;
  } catch (error) {
    logger.error('Error getting breakdown by location:', error);
    throw error;
  }
};

/**
 * Calculate and store analytics metric
 */
export const calculateAndStoreMetric = async (
  AnalyticsModel: Model<IAnalytics>,
  EmployeeModel: Model<IEmployee>,
  AttendanceModel: Model<IAttendance>,
  metricType: string,
  period: string
): Promise<IAnalytics> => {
  try {
    let value = 0;
    const breakdown: any = {};

    switch (metricType) {
      case 'turnover_rate':
        value = await calculateTurnoverRate(EmployeeModel, period);
        breakdown.byDepartment = await getBreakdownByDepartment(EmployeeModel);
        break;
      case 'average_tenure':
        value = await calculateAverageTenure(EmployeeModel);
        breakdown.byDepartment = await getBreakdownByDepartment(EmployeeModel);
        breakdown.byLocation = await getBreakdownByLocation(EmployeeModel);
        break;
      case 'attendance_rate':
        value = await calculateAttendanceRate(AttendanceModel, period);
        breakdown.byDepartment = await getBreakdownByDepartment(EmployeeModel);
        break;
      case 'headcount':
        value = await EmployeeModel.countDocuments({ terminationDate: { $exists: false } });
        breakdown.byDepartment = await getBreakdownByDepartment(EmployeeModel);
        breakdown.byGender = await getBreakdownByGender(EmployeeModel);
        breakdown.byLocation = await getBreakdownByLocation(EmployeeModel);
        break;
      default:
        throw new Error(`Unknown metric type: ${metricType}`);
    }

    // Store or update analytics
    const analytics = await AnalyticsModel.findOneAndUpdate(
      { metricType, period },
      {
        metricType,
        period,
        value,
        breakdown,
        calculatedAt: new Date(),
        dataSource: 'calculated',
      },
      { upsert: true, new: true }
    );

    return analytics;
  } catch (error) {
    logger.error(`Error calculating metric ${metricType}:`, error);
    throw error;
  }
};

/**
 * Get analytics metrics
 */
export const getAnalytics = async (
  AnalyticsModel: Model<IAnalytics>,
  metricType?: string,
  period?: string
): Promise<IAnalytics[]> => {
  try {
    const query: any = {};
    if (metricType) query.metricType = metricType;
    if (period) query.period = period;

    return await AnalyticsModel.find(query)
      .sort({ calculatedAt: -1 })
      .lean() as unknown as IAnalytics[];
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    throw error;
  }
};

/**
 * Calculate predictive analytics - forecast turnover
 */
export const predictTurnover = async (
  EmployeeModel: Model<IEmployee>,
  months: number = 6
): Promise<{
  predictedTurnover: number;
  confidence: number;
  factors: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}> => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);

    // Get historical turnover data
    const [recentTerminations, olderTerminations, totalEmployees] = await Promise.all([
      EmployeeModel.countDocuments({
        terminationDate: { $gte: sixMonthsAgo, $lte: now }
      }),
      EmployeeModel.countDocuments({
        terminationDate: { $gte: twelveMonthsAgo, $lt: sixMonthsAgo }
      }),
      EmployeeModel.countDocuments({ hireDate: { $lte: now } })
    ]);

    // Calculate recent vs older turnover rate
    const recentRate = totalEmployees > 0 ? (recentTerminations / totalEmployees) * 100 : 0;
    const olderRate = totalEmployees > 0 ? (olderTerminations / totalEmployees) * 100 : 0;

    // Simple trend analysis
    const trend = recentRate > olderRate * 1.1 ? 'increasing' : 
                  recentRate < olderRate * 0.9 ? 'decreasing' : 'stable';

    // Predict future turnover (simple linear projection)
    const predictedTurnover = recentRate * (months / 6);
    const confidence = totalEmployees > 50 ? 0.75 : 0.60; // Higher confidence with more data

    const factors: string[] = [];
    if (trend === 'increasing') factors.push('Increasing termination trend detected');
    if (recentRate > 10) factors.push('High current turnover rate');
    if (totalEmployees < 20) factors.push('Small sample size - lower confidence');

    return {
      predictedTurnover: Math.round(predictedTurnover * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      factors,
      trend,
    };
  } catch (error) {
    logger.error('Error predicting turnover:', error);
    throw error;
  }
};

/**
 * Calculate trend analysis for metrics
 */
export const calculateTrend = async (
  AnalyticsModel: Model<IAnalytics>,
  metricType: string,
  periods: number = 6
): Promise<{
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  dataPoints: Array<{ period: string; value: number }>;
}> => {
  try {
    const analytics = await AnalyticsModel.find({ metricType })
      .sort({ calculatedAt: -1 })
      .limit(periods)
      .lean() as unknown as IAnalytics[];

    if (analytics.length < 2) {
      return {
        current: analytics[0]?.value || 0,
        previous: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable',
        dataPoints: analytics.map(a => ({ period: a.period, value: a.value })),
      };
    }

    const current = analytics[0]?.value || 0;
    const previous = analytics[1]?.value || 0;
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 5) {
      trend = changePercent > 0 ? 'up' : 'down';
    }

    return {
      current,
      previous,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      trend,
      dataPoints: analytics.reverse().map(a => ({ period: a.period, value: a.value })),
    };
  } catch (error) {
    logger.error('Error calculating trend:', error);
    throw error;
  }
};

/**
 * Calculate forecast for headcount
 */
export const forecastHeadcount = async (
  EmployeeModel: Model<IEmployee>,
  months: number = 6
): Promise<{
  current: number;
  forecasted: number;
  confidence: number;
  factors: string[];
}> => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Get current headcount
    const current = await EmployeeModel.countDocuments({ terminationDate: { $exists: false } });

    // Get historical hires and terminations
    const [recentHires, recentTerminations] = await Promise.all([
      EmployeeModel.countDocuments({
        hireDate: { $gte: sixMonthsAgo, $lte: now }
      }),
      EmployeeModel.countDocuments({
        terminationDate: { $gte: sixMonthsAgo, $lte: now }
      }),
    ]);

    // Calculate average monthly change
    const netChange = recentHires - recentTerminations;
    const monthlyChange = netChange / 6;

    // Forecast
    const forecasted = Math.max(0, current + (monthlyChange * months));
    const confidence = current > 20 ? 0.70 : 0.50;

    const factors: string[] = [];
    if (monthlyChange > 0) factors.push('Positive growth trend');
    if (monthlyChange < 0) factors.push('Declining headcount trend');
    if (current < 20) factors.push('Small sample size - lower confidence');

    return {
      current,
      forecasted: Math.round(forecasted),
      confidence: Math.round(confidence * 100) / 100,
      factors,
    };
  } catch (error) {
    logger.error('Error forecasting headcount:', error);
    throw error;
  }
};

/**
 * Get comprehensive analytics with predictions
 */
export const getAdvancedAnalytics = async (
  AnalyticsModel: Model<IAnalytics>,
  EmployeeModel: Model<IEmployee>,
  AttendanceModel: Model<IAttendance>
): Promise<{
  currentMetrics: {
    turnoverRate: number;
    averageTenure: number;
    attendanceRate: number;
    headcount: number;
  };
  predictions: {
    turnover: {
      predictedTurnover: number;
      confidence: number;
      trend: string;
    };
    headcount: {
      current: number;
      forecasted: number;
      confidence: number;
    };
  };
  trends: {
    turnover: {
      current: number;
      previous: number;
      changePercent: number;
      trend: string;
    };
    headcount: {
      current: number;
      previous: number;
      changePercent: number;
      trend: string;
    };
  };
}> => {
  try {
    // Get current metrics
    const [turnoverRate, averageTenure, attendanceRate, headcount] = await Promise.all([
      calculateTurnoverRate(EmployeeModel, 'monthly'),
      calculateAverageTenure(EmployeeModel),
      calculateAttendanceRate(AttendanceModel, 'monthly'),
      EmployeeModel.countDocuments({ terminationDate: { $exists: false } }),
    ]);

    // Get predictions
    const turnoverPrediction = await predictTurnover(EmployeeModel, 6);
    const headcountForecast = await forecastHeadcount(EmployeeModel, 6);

    // Get trends
    const turnoverTrend = await calculateTrend(AnalyticsModel, 'turnover_rate', 6);
    const headcountTrend = await calculateTrend(AnalyticsModel, 'headcount', 6);

    return {
      currentMetrics: {
        turnoverRate: Math.round(turnoverRate * 100) / 100,
        averageTenure: Math.round(averageTenure * 100) / 100,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        headcount,
      },
      predictions: {
        turnover: {
          predictedTurnover: turnoverPrediction.predictedTurnover,
          confidence: turnoverPrediction.confidence,
          trend: turnoverPrediction.trend,
        },
        headcount: {
          current: headcountForecast.current,
          forecasted: headcountForecast.forecasted,
          confidence: headcountForecast.confidence,
        },
      },
      trends: {
        turnover: {
          current: turnoverTrend.current,
          previous: turnoverTrend.previous,
          changePercent: turnoverTrend.changePercent,
          trend: turnoverTrend.trend,
        },
        headcount: {
          current: headcountTrend.current,
          previous: headcountTrend.previous,
          changePercent: headcountTrend.changePercent,
          trend: headcountTrend.trend,
        },
      },
    };
  } catch (error) {
    logger.error('Error getting advanced analytics:', error);
    throw error;
  }
};

