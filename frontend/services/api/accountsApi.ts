import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './baseApi';

export interface Account {
  accountId: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountsFilters {
  page?: number;
  limit?: number;
  accountType?: string;
  currency?: string;
  isActive?: boolean;
  search?: string;
}

export interface AccountsListResponse {
  data: Account[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AccountsStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
  totalBalance: number;
  byCurrency: Record<string, number>;
}

export const accountsApi = {
  getAll: async (filters?: AccountsFilters, organizationId?: string): Promise<ApiResponse<AccountsListResponse>> => {
    return apiGet<AccountsListResponse>('/accounts', filters, organizationId);
  },
  getById: async (accountId: string, organizationId?: string): Promise<ApiResponse<Account>> => {
    return apiGet<Account>(`/accounts/${accountId}`, undefined, organizationId);
  },
  create: async (account: Partial<Account>, organizationId?: string): Promise<ApiResponse<Account>> => {
    return apiPost<Account>('/accounts', account, organizationId);
  },
  update: async (accountId: string, account: Partial<Account>, organizationId?: string): Promise<ApiResponse<Account>> => {
    return apiPut<Account>(`/accounts/${accountId}`, account, organizationId);
  },
  delete: async (accountId: string, organizationId?: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/accounts/${accountId}`, organizationId);
  },
  getStats: async (organizationId?: string): Promise<ApiResponse<AccountsStats>> => {
    return apiGet<AccountsStats>('/accounts/stats', undefined, organizationId);
  },
};



