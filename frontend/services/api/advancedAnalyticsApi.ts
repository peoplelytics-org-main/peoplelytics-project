import { apiGet, ApiResponse } from './baseApi';

export interface PredictiveAnalytics {
  predictedTurnover: number;
  confidence: number;
  factors: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface TrendAnalysis {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  dataPoints: Array<{ period: string; value: number }>;
}

export interface Forecast {
  current: number;
  forecasted: number;
  confidence: number;
  factors: string[];
}

export interface AdvancedAnalytics {
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
}

/**
 * Advanced Analytics API service
 */
export const advancedAnalyticsApi = {
  /**
   * Get comprehensive advanced analytics
   */
  getAdvanced: async (): Promise<ApiResponse<AdvancedAnalytics>> => {
    return apiGet<AdvancedAnalytics>('/analytics/advanced');
  },

  /**
   * Get predictive analytics (turnover prediction)
   */
  getPredictive: async (months?: number): Promise<ApiResponse<PredictiveAnalytics>> => {
    return apiGet<PredictiveAnalytics>('/analytics/predictive', months ? { months } : undefined);
  },

  /**
   * Get trend analysis for a metric
   */
  getTrends: async (metricType?: string, periods?: number): Promise<ApiResponse<TrendAnalysis>> => {
    const params: any = {};
    if (metricType) params.metricType = metricType;
    if (periods) params.periods = periods;
    return apiGet<TrendAnalysis>('/analytics/trends', Object.keys(params).length > 0 ? params : undefined);
  },

  /**
   * Get forecast (headcount forecast)
   */
  getForecast: async (months?: number): Promise<ApiResponse<Forecast>> => {
    return apiGet<Forecast>('/analytics/forecast', months ? { months } : undefined);
  },
};



