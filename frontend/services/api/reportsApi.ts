import { apiGet, apiPost, apiDelete, ApiResponse } from './baseApi';

export interface Report {
  reportId: string;
  name: string;
  type: string;
  generatedBy: string;
  parameters: {
    dateRange: {
      start: string;
      end: string;
    };
    departments?: string[];
    employeeId?: string;
  };
  data: any;
  status: 'generating' | 'completed' | 'failed';
  filePath?: string;
  createdAt: string;
  expiresAt: string;
}

export interface GenerateReportRequest {
  name: string;
  type: 'employee' | 'attendance';
  parameters: {
    dateRange: {
      start: string;
      end: string;
    };
    departments?: string[];
    employeeId?: string;
  };
}

/**
 * Reports API service
 */
export const reportsApi = {
  /**
   * Get all reports
   */
  getAll: async (type?: string, organizationId?: string): Promise<ApiResponse<Report[]>> => {
    return apiGet<Report[]>('/reports', { type }, organizationId);
  },

  /**
   * Get report by ID
   */
  getById: async (reportId: string): Promise<ApiResponse<Report>> => {
    return apiGet<Report>(`/reports/${reportId}`);
  },

  /**
   * Generate a new report
   */
  generate: async (reportData: GenerateReportRequest): Promise<ApiResponse<Report>> => {
    return apiPost<Report>('/reports/generate', reportData);
  },

  /**
   * Delete a report
   */
  delete: async (reportId: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/reports/${reportId}`);
  },
};

