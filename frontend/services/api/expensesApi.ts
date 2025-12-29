import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './baseApi';

export interface Expense {
  expenseId: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  expenseDate: string;
  receiptUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpensesFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  department?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ExpensesListResponse {
  data: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExpensesStats {
  total: number;
  totalAmount: number;
  averageAmount: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byDepartment: Record<string, number>;
}

export const expensesApi = {
  getAll: async (filters?: ExpensesFilters, organizationId?: string): Promise<ApiResponse<ExpensesListResponse>> => {
    return apiGet<ExpensesListResponse>('/expenses', filters, organizationId);
  },
  getById: async (expenseId: string, organizationId?: string): Promise<ApiResponse<Expense>> => {
    return apiGet<Expense>(`/expenses/${expenseId}`, undefined, organizationId);
  },
  create: async (expense: Partial<Expense>, organizationId?: string): Promise<ApiResponse<Expense>> => {
    return apiPost<Expense>('/expenses', expense, organizationId);
  },
  update: async (expenseId: string, expense: Partial<Expense>, organizationId?: string): Promise<ApiResponse<Expense>> => {
    return apiPut<Expense>(`/expenses/${expenseId}`, expense, organizationId);
  },
  delete: async (expenseId: string, organizationId?: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/expenses/${expenseId}`, organizationId);
  },
  getStats: async (organizationId?: string): Promise<ApiResponse<ExpensesStats>> => {
    return apiGet<ExpensesStats>('/expenses/stats', undefined, organizationId);
  },
};



