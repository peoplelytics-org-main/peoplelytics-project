import { apiGet, apiPost, ApiResponse } from './baseApi';

export interface AnalyticsMetric {
  metricType: string;
  period: string;
  value: number;
  breakdown: {
    byDepartment?: Record<string, number>;
    byTenure?: Record<string, number>;
    byGender?: Record<string, number>;
    byLocation?: Record<string, number>;
    [key: string]: any;
  };
  calculatedAt: string;
  dataSource: string;
}

export interface DashboardAnalytics {
  turnoverRate: number;
  averageTenure: number;
  attendanceRate: number;
  headcount: number;
  breakdown: {
    byDepartment: Record<string, number>;
    byGender: Record<string, number>;
    byLocation: Record<string, number>;
  };
}

/**
 * Analytics API service
 */
export const analyticsApi = {
  /**
   * Get analytics metrics
   */
  getMetrics: async (metricType?: string, period?: string, organizationId?: string): Promise<ApiResponse<AnalyticsMetric[]>> => {
    return apiGet<AnalyticsMetric[]>('/analytics', { metricType, period }, organizationId);
  },

  /**
   * Calculate and store analytics metric
   */
  calculateMetric: async (metricType: string, period: string): Promise<ApiResponse<AnalyticsMetric>> => {
    return apiPost<AnalyticsMetric>('/analytics/calculate', { metricType, period });
  },

  /**
   * Get dashboard analytics (all key metrics)
   */
  getDashboard: async (period?: string): Promise<ApiResponse<DashboardAnalytics>> => {
    return apiGet<DashboardAnalytics>('/analytics/dashboard', { period });
  },
};

