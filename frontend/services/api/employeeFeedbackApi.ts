import { apiGet, apiPost, apiPut, apiPatch, apiDelete, ApiResponse } from './baseApi';

export interface EmployeeFeedback {
  satisId: string;
  employeeId: string;
  engagementScore: number; // 1-100
  compensationSatisfaction?: number; // 1-100
  benefitsSatisfaction?: number; // 1-100
  managementSatisfaction?: number; // 1-100
  trainingSatisfaction?: number; // 1-100
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeFeedbackFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  minEngagementScore?: number;
  maxEngagementScore?: number;
}

export interface EmployeeFeedbackListResponse {
  data: EmployeeFeedback[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EmployeeFeedbackStats {
  total: number;
  averageEngagementScore: number;
  averageCompensationSatisfaction: number;
  averageBenefitsSatisfaction: number;
  averageManagementSatisfaction: number;
  averageTrainingSatisfaction: number;
}

/**
 * Employee Feedback API service
 */
export const employeeFeedbackApi = {
  /**
   * Get all employee feedback records with optional filters and pagination
   */
  getAll: async (filters?: EmployeeFeedbackFilters, organizationId?: string): Promise<ApiResponse<EmployeeFeedbackListResponse>> => {
    return apiGet<EmployeeFeedbackListResponse>('/employee-feedback', filters, organizationId);
  },

  /**
   * Get employee feedback by satisfaction ID
   */
  getById: async (satisId: string): Promise<ApiResponse<EmployeeFeedback>> => {
    return apiGet<EmployeeFeedback>(`/employee-feedback/${satisId}`);
  },

  /**
   * Get employee feedback by employee ID (latest)
   */
  getByEmployeeId: async (employeeId: string): Promise<ApiResponse<EmployeeFeedback>> => {
    return apiGet<EmployeeFeedback>(`/employee-feedback/employee/${employeeId}`);
  },

  /**
   * Create a new employee feedback record
   */
  create: async (feedback: Partial<EmployeeFeedback>): Promise<ApiResponse<EmployeeFeedback>> => {
    return apiPost<EmployeeFeedback>('/employee-feedback', feedback);
  },

  /**
   * Update an employee feedback record
   */
  update: async (satisId: string, feedback: Partial<EmployeeFeedback>): Promise<ApiResponse<EmployeeFeedback>> => {
    return apiPut<EmployeeFeedback>(`/employee-feedback/${satisId}`, feedback);
  },

  /**
   * Delete an employee feedback record
   */
  delete: async (satisId: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/employee-feedback/${satisId}`);
  },

  /**
   * Get employee feedback statistics
   */
  getStats: async (): Promise<ApiResponse<EmployeeFeedbackStats>> => {
    return apiGet<EmployeeFeedbackStats>('/employee-feedback/stats');
  },
};

