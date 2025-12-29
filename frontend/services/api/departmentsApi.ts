import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './baseApi';

export interface Department {
  departmentId: string;
  name: string;
  description: string;
  headOfDepartment: string;
  budget: number;
  location: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentsFilters {
  page?: number;
  limit?: number;
  name?: string;
  location?: string;
  headOfDepartment?: string;
  isActive?: boolean;
  search?: string;
}

export interface DepartmentsListResponse {
  data: Department[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DepartmentsStats {
  total: number;
  active: number;
  inactive: number;
  totalBudget: number;
  byLocation: Record<string, number>;
}

/**
 * Departments API service
 */
export const departmentsApi = {
  /**
   * Get all departments with optional filters and pagination
   */
  getAll: async (filters?: DepartmentsFilters, organizationId?: string): Promise<ApiResponse<DepartmentsListResponse>> => {
    return apiGet<DepartmentsListResponse>('/departments', filters, organizationId);
  },

  /**
   * Get department by ID
   */
  getById: async (departmentId: string, organizationId?: string): Promise<ApiResponse<Department>> => {
    return apiGet<Department>(`/departments/${departmentId}`, undefined, organizationId);
  },

  /**
   * Create a new department
   */
  create: async (department: Partial<Department>, organizationId?: string): Promise<ApiResponse<Department>> => {
    return apiPost<Department>('/departments', department, organizationId);
  },

  /**
   * Update a department
   */
  update: async (departmentId: string, department: Partial<Department>, organizationId?: string): Promise<ApiResponse<Department>> => {
    return apiPut<Department>(`/departments/${departmentId}`, department, organizationId);
  },

  /**
   * Delete a department
   */
  delete: async (departmentId: string, organizationId?: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/departments/${departmentId}`, organizationId);
  },

  /**
   * Get departments statistics
   */
  getStats: async (organizationId?: string): Promise<ApiResponse<DepartmentsStats>> => {
    return apiGet<DepartmentsStats>('/departments/stats', undefined, organizationId);
  },
};



