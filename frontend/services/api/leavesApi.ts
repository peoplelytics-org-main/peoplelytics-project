import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './baseApi';

export interface Leave {
  leaveId: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Other';
  startDate: string;
  endDate: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeavesFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  leaveType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface LeavesListResponse {
  data: Leave[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LeavesStats {
  total: number;
  totalDays: number;
  averageDays: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  pendingApproval: number;
}

export const leavesApi = {
  getAll: async (filters?: LeavesFilters, organizationId?: string): Promise<ApiResponse<LeavesListResponse>> => {
    return apiGet<LeavesListResponse>('/leaves', filters, organizationId);
  },
  getById: async (leaveId: string, organizationId?: string): Promise<ApiResponse<Leave>> => {
    return apiGet<Leave>(`/leaves/${leaveId}`, undefined, organizationId);
  },
  create: async (leave: Partial<Leave>, organizationId?: string): Promise<ApiResponse<Leave>> => {
    return apiPost<Leave>('/leaves', leave, organizationId);
  },
  update: async (leaveId: string, leave: Partial<Leave>, organizationId?: string): Promise<ApiResponse<Leave>> => {
    return apiPut<Leave>(`/leaves/${leaveId}`, leave, organizationId);
  },
  delete: async (leaveId: string, organizationId?: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/leaves/${leaveId}`, organizationId);
  },
  getStats: async (organizationId?: string): Promise<ApiResponse<LeavesStats>> => {
    return apiGet<LeavesStats>('/leaves/stats', undefined, organizationId);
  },
};



