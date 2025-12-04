import { apiGet, apiPost, apiPut, apiPatch, apiDelete, ApiResponse } from './baseApi';
import type { Organization } from '../../types';

export interface OrganizationFilters {
  status?: 'Active' | 'Inactive';
  package?: 'Basic' | 'Intermediate' | 'Pro' | 'Enterprise';
}

export interface OrganizationListResponse {
  success: boolean;
  count: number;
  data: Organization[];
}

export interface OrganizationStats {
  databaseSize: number;
  collectionCount: number;
  documentCounts: { [collection: string]: number };
}

export interface OrganizationHealth {
  organizationName: string;
  orgId: string;
  status: string;
  databaseExists: boolean;
  databaseHealth: 'healthy' | 'not_found';
}

/**
 * Organizations API service
 */
export const organizationsApi = {
  /**
   * Get all organizations with optional filters
   */
  getAll: async (filters?: OrganizationFilters): Promise<ApiResponse<OrganizationListResponse>> => {
    return apiGet<OrganizationListResponse>('/organizations', filters);
  },

  /**
   * Get organization by ID
   */
  getById: async (orgId: string): Promise<ApiResponse<Organization & { databaseStats?: OrganizationStats }>> => {
    return apiGet<Organization & { databaseStats?: OrganizationStats }>(`/organizations/${orgId}`);
  },

  /**
   * Get organization statistics
   */
  getStats: async (orgId: string): Promise<ApiResponse<OrganizationStats>> => {
    return apiGet<OrganizationStats>(`/organizations/${orgId}/stats`);
  },

  /**
   * Check organization health
   */
  getHealth: async (orgId: string): Promise<ApiResponse<OrganizationHealth>> => {
    return apiGet<OrganizationHealth>(`/organizations/${orgId}/health`);
  },

  /**
   * Create a new organization
   */
  create: async (organization: Partial<Organization & { duration?: number }>): Promise<ApiResponse<Organization>> => {
    return apiPost<Organization>('/organizations/add-organization', organization);
  },

  /**
   * Update an organization
   */
  update: async (orgId: string, updates: Partial<Organization>): Promise<ApiResponse<Organization>> => {
    return apiPut<Organization>(`/organizations/${orgId}`, updates);
  },

  /**
   * Deactivate an organization (soft delete)
   */
  deactivate: async (orgId: string): Promise<ApiResponse<Organization>> => {
    return apiPatch<Organization>(`/organizations/${orgId}/deactivate`, {});
  },

  /**
   * Activate an organization (restore)
   */
  activate: async (orgId: string): Promise<ApiResponse<Organization>> => {
    return apiPatch<Organization>(`/organizations/${orgId}/activate`, {});
  },

  /**
   * Delete an organization permanently (hard delete)
   */
  delete: async (orgId: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/organizations/${orgId}/hard`, { confirm: 'DELETE' });
  },

  /**
   * List all organization databases
   */
  listDatabases: async (): Promise<ApiResponse<{ count: number; data: string[] }>> => {
    return apiGet<{ count: number; data: string[] }>('/organizations/databases/list');
  },
};



