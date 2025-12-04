import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './baseApi';
import type { ExitInterviewAnalysis } from '../../types';

export interface ExitInterview {
  id: string;
  employeeId: string;
  primaryReasonForLeaving: string;
  secondaryReasonForLeaving?: string;
  management: {
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    quote: string;
    summary: string;
  };
  compensation: {
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    quote: string;
    summary: string;
  };
  culture: {
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    quote: string;
    summary: string;
  };
  analyzedAt: string;
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExitInterviewFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  primaryReasonForLeaving?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

export interface ExitInterviewListResponse {
  data: ExitInterview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExitInterviewStats {
  totalInterviews: number;
  reasonsForLeaving: { [key: string]: number };
  sentimentBreakdown: {
    management: { Positive: number; Neutral: number; Negative: number };
    compensation: { Positive: number; Neutral: number; Negative: number };
    culture: { Positive: number; Neutral: number; Negative: number };
  };
  overallSentiment: { Positive: number; Neutral: number; Negative: number };
}

/**
 * Exit Interviews API service
 */
export const exitInterviewsApi = {
  /**
   * Get all exit interviews with optional filters and pagination
   */
  getAll: async (filters?: ExitInterviewFilters, organizationId?: string): Promise<ApiResponse<ExitInterviewListResponse>> => {
    return apiGet<ExitInterviewListResponse>('/exit-interviews', filters, organizationId);
  },

  /**
   * Get exit interview by ID
   */
  getById: async (interviewId: string): Promise<ApiResponse<ExitInterview>> => {
    return apiGet<ExitInterview>(`/exit-interviews/${interviewId}`);
  },

  /**
   * Create a new exit interview
   */
  create: async (interview: Partial<ExitInterview>): Promise<ApiResponse<ExitInterview>> => {
    return apiPost<ExitInterview>('/exit-interviews', interview);
  },

  /**
   * Update an exit interview
   */
  update: async (interviewId: string, updates: Partial<ExitInterview>): Promise<ApiResponse<ExitInterview>> => {
    return apiPut<ExitInterview>(`/exit-interviews/${interviewId}`, updates);
  },

  /**
   * Delete an exit interview
   */
  delete: async (interviewId: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/exit-interviews/${interviewId}`);
  },

  /**
   * Get exit interview statistics
   */
  getStats: async (): Promise<ApiResponse<ExitInterviewStats>> => {
    return apiGet<ExitInterviewStats>('/exit-interviews/stats');
  },
};

