import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './baseApi';

export interface Salary {
  salaryId: string;
  employeeId: string;
  name: string;
  salary: number;
  bonus: number;
  lastRaiseAmount?: number;
  lastRaiseDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  name?: string;
  search?: string;
}

export interface SalaryListResponse {
  data: Salary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SalaryStats {
  total: number;
  totalSalary: number;
  averageSalary: number;
  totalBonus: number;
  averageBonus: number;
  employeesWithRaises: number;
}

/**
 * Salary & Compensation API service
 */
export const salaryApi = {
  /**
   * Get all salary records with optional filters and pagination
   */
  getAll: async (filters?: SalaryFilters, organizationId?: string): Promise<ApiResponse<SalaryListResponse>> => {
    return apiGet<SalaryListResponse>('/salary', filters, organizationId);
  },

  /**
   * Get salary by ID
   */
  getById: async (salaryId: string, organizationId?: string): Promise<ApiResponse<Salary>> => {
    return apiGet<Salary>(`/salary/${salaryId}`, undefined, organizationId);
  },

  /**
   * Get salary by employee ID
   */
  getByEmployeeId: async (employeeId: string, organizationId?: string): Promise<ApiResponse<Salary>> => {
    return apiGet<Salary>(`/salary/employee/${employeeId}`, undefined, organizationId);
  },

  /**
   * Create a new salary record
   */
  create: async (salary: Partial<Salary>, organizationId?: string): Promise<ApiResponse<Salary>> => {
    return apiPost<Salary>('/salary', salary, organizationId);
  },

  /**
   * Update a salary record
   */
  update: async (salaryId: string, salary: Partial<Salary>, organizationId?: string): Promise<ApiResponse<Salary>> => {
    return apiPut<Salary>(`/salary/${salaryId}`, salary, organizationId);
  },

  /**
   * Delete a salary record
   */
  delete: async (salaryId: string, organizationId?: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/salary/${salaryId}`, organizationId);
  },

  /**
   * Get salary statistics
   */
  getStats: async (organizationId?: string): Promise<ApiResponse<SalaryStats>> => {
    return apiGet<SalaryStats>('/salary/stats', undefined, organizationId);
  },
};



