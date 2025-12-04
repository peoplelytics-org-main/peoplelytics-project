import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './baseApi';

export interface PerformanceReview {
  id: string;
  employeeId: string;
  name: string;
  performanceRating: number; // 1-5
  potentialRating: number; // 1-3
  flightRiskScore: number; // 0-5
  impactScore: number; // 0-10
  trainingCompleted: number;
  trainingTotal: number;
  weeklyHours: number;
  hasGrievance: boolean;
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PerformanceReviewFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  performanceRating?: number;
  potentialRating?: number;
}

export interface PerformanceReviewListResponse {
  data: PerformanceReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PerformanceReviewStats {
  totalReviews: number;
  averagePerformanceRating: number;
  averagePotentialRating: number;
  averageFlightRiskScore: number;
  averageImpactScore: number;
  highPerformers: number;
  highPotential: number;
  atRiskEmployees: number;
}

/**
 * Performance Reviews API service
 */
export const performanceReviewsApi = {
  /**
   * Get all performance reviews with optional filters and pagination
   */
  getAll: async (filters?: PerformanceReviewFilters, organizationId?: string): Promise<ApiResponse<PerformanceReviewListResponse>> => {
    return apiGet<PerformanceReviewListResponse>('/performance-reviews', filters, organizationId);
  },

  /**
   * Get performance review by ID
   */
  getById: async (reviewId: string): Promise<ApiResponse<PerformanceReview>> => {
    return apiGet<PerformanceReview>(`/performance-reviews/${reviewId}`);
  },

  /**
   * Create a new performance review
   */
  create: async (review: Partial<PerformanceReview>): Promise<ApiResponse<PerformanceReview>> => {
    return apiPost<PerformanceReview>('/performance-reviews', review);
  },

  /**
   * Update a performance review
   */
  update: async (reviewId: string, updates: Partial<PerformanceReview>): Promise<ApiResponse<PerformanceReview>> => {
    return apiPut<PerformanceReview>(`/performance-reviews/${reviewId}`, updates);
  },

  /**
   * Delete a performance review
   */
  delete: async (reviewId: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/performance-reviews/${reviewId}`);
  },

  /**
   * Get performance review statistics
   */
  getStats: async (): Promise<ApiResponse<PerformanceReviewStats>> => {
    return apiGet<PerformanceReviewStats>('/performance-reviews/stats');
  },
};

