import { apiGet, apiPost, apiPut, apiPatch, apiDelete, ApiResponse } from './baseApi';
import type { Employee } from '../../types';

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  department?: string;
  location?: string;
  jobTitle?: string;
  isActive?: boolean;
  search?: string;
  managerId?: string;
}

export interface EmployeeListResponse {
  data: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EmployeeStats {
  total: number;
  active: number;
  terminated: number;
  byDepartment: Record<string, number>;
  byLocation: Record<string, number>;
}

/**
 * Employee API service
 */
export const employeeApi = {
  /**
   * Get all employees with optional filters and pagination
   */
  getAll: async (filters?: EmployeeFilters, organizationId?: string): Promise<ApiResponse<EmployeeListResponse>> => {
    return apiGet<EmployeeListResponse>('/employees', filters, organizationId);
  },

  /**
   * Get employee by ID
   */
  getById: async (employeeId: string): Promise<ApiResponse<Employee>> => {
    return apiGet<Employee>(`/employees/${employeeId}`);
  },

  /**
   * Create a new employee
   */
  create: async (employee: Partial<Employee>): Promise<ApiResponse<Employee>> => {
    return apiPost<Employee>('/employees', employee);
  },

  /**
   * Update an employee
   */
  update: async (employeeId: string, employee: Partial<Employee>): Promise<ApiResponse<Employee>> => {
    return apiPut<Employee>(`/employees/${employeeId}`, employee);
  },

  /**
   * Delete an employee
   */
  delete: async (employeeId: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/employees/${employeeId}`);
  },

  /**
   * Bulk create employees
   */
  bulkCreate: async (employees: Partial<Employee>[]): Promise<ApiResponse<{
    created: number;
    failed: number;
    errors: string[];
  }>> => {
    return apiPost('/employees/bulk', { employees });
  },

  /**
   * Get employee statistics
   */
  getStats: async (): Promise<ApiResponse<EmployeeStats>> => {
    return apiGet<EmployeeStats>('/employees/stats');
  },
};

