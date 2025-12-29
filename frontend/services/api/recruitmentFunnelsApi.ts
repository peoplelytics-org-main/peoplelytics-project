import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './baseApi';
import type { RecruitmentFunnel } from '../../types';

export interface RecruitmentFunnelFilters {
  page?: number;
  limit?: number;
  positionId?: string;
}

export interface RecruitmentFunnelListResponse {
  data: RecruitmentFunnel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RecruitmentFunnelStats {
  totalFunnels: number;
  totalShortlisted: number;
  totalInterviewed: number;
  totalOffersExtended: number;
  totalOffersAccepted: number;
  totalJoined: number;
  averageConversionRate: number;
}

/**
 * Recruitment Funnels API service
 */
export const recruitmentFunnelsApi = {
  /**
   * Get all recruitment funnels with optional filters and pagination
   */
  getAll: async (filters?: RecruitmentFunnelFilters, organizationId?: string): Promise<ApiResponse<RecruitmentFunnelListResponse>> => {
    return apiGet<RecruitmentFunnelListResponse>('/recruitment-funnels', filters, organizationId);
  },

  /**
   * Get recruitment funnel by ID
   */
  getById: async (funnelId: string): Promise<ApiResponse<RecruitmentFunnel>> => {
    return apiGet<RecruitmentFunnel>(`/recruitment-funnels/${funnelId}`);
  },

  /**
   * Create a new recruitment funnel
   */
  create: async (funnel: Partial<RecruitmentFunnel>): Promise<ApiResponse<RecruitmentFunnel>> => {
    return apiPost<RecruitmentFunnel>('/recruitment-funnels', funnel);
  },

  /**
   * Update a recruitment funnel
   */
  update: async (funnelId: string, updates: Partial<RecruitmentFunnel>): Promise<ApiResponse<RecruitmentFunnel>> => {
    return apiPut<RecruitmentFunnel>(`/recruitment-funnels/${funnelId}`, updates);
  },

  /**
   * Delete a recruitment funnel
   */
  delete: async (funnelId: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/recruitment-funnels/${funnelId}`);
  },

  /**
   * Get recruitment funnel statistics
   */
  getStats: async (): Promise<ApiResponse<RecruitmentFunnelStats>> => {
    return apiGet<RecruitmentFunnelStats>('/recruitment-funnels/stats');
  },
};

