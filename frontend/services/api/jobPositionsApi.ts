import { apiGet, apiPost, apiPut, apiPatch, apiDelete, ApiResponse } from './baseApi';
import type { JobPosition } from '../../types';

export interface JobPositionsFilters {
  page?: number;
  limit?: number;
  department?: string;
  status?: 'Open' | 'Closed' | 'On Hold';
  positionType?: 'Replacement' | 'New';
  budgetStatus?: 'Budgeted' | 'Non-Budgeted';
}

export interface JobPositionsListResponse {
  data: JobPosition[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface JobPositionsStats {
  total: number;
  open: number;
  closed: number;
  onHold: number;
  byDepartment: Record<string, number>;
  byPositionType: Record<string, number>;
  byBudgetStatus: Record<string, number>;
}

/**
 * Job Positions API service
 */
export const jobPositionsApi = {
  /**
   * Get all job positions with optional filters and pagination
   */
  getAll: async (filters?: JobPositionsFilters, organizationId?: string): Promise<ApiResponse<JobPositionsListResponse>> => {
    return apiGet<JobPositionsListResponse>('/job-positions', filters, organizationId);
  },

  /**
   * Get job position by ID
   */
  getById: async (positionId: string): Promise<ApiResponse<JobPosition>> => {
    return apiGet<JobPosition>(`/job-positions/${positionId}`);
  },

  /**
   * Create a new job position
   */
  create: async (position: Partial<JobPosition>): Promise<ApiResponse<JobPosition>> => {
    return apiPost<JobPosition>('/job-positions', position);
  },

  /**
   * Update a job position
   */
  update: async (positionId: string, position: Partial<JobPosition>): Promise<ApiResponse<JobPosition>> => {
    return apiPut<JobPosition>(`/job-positions/${positionId}`, position);
  },

  /**
   * Delete a job position
   */
  delete: async (positionId: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/job-positions/${positionId}`);
  },

  /**
   * Get job positions statistics
   */
  getStats: async (): Promise<ApiResponse<JobPositionsStats>> => {
    return apiGet<JobPositionsStats>('/job-positions/stats');
  },
};

