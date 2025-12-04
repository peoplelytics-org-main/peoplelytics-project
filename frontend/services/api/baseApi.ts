/**
 * Base API configuration and utilities
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

/**
 * Base fetch wrapper with error handling
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit & { organizationId?: string } = {}
): Promise<ApiResponse<T>> => {
  try {
    const { organizationId, ...fetchOptions } = options;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };
    
    // Add organization ID header if provided (for Super Admin viewing other orgs)
    if (organizationId) {
      headers['X-Organization-ID'] = organizationId;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      credentials: 'include', // Important for cookies
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP error! status: ${response.status}`,
        errors: data.errors,
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error: any) {
    console.error(`API request failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error.message || 'Network error occurred',
    };
  }
};

/**
 * GET request helper
 */
export const apiGet = <T>(endpoint: string, params?: Record<string, any>, organizationId?: string): Promise<ApiResponse<T>> => {
  const queryString = params
    ? '?' + new URLSearchParams(params as any).toString()
    : '';
  return apiRequest<T>(endpoint + queryString, { method: 'GET', organizationId });
};

/**
 * POST request helper
 */
export const apiPost = <T>(endpoint: string, body?: any, organizationId?: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    organizationId,
  } as RequestInit & { organizationId?: string });
};

/**
 * PUT request helper
 */
export const apiPut = <T>(endpoint: string, body?: any, organizationId?: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    organizationId,
  } as RequestInit & { organizationId?: string });
};

/**
 * PATCH request helper
 */
export const apiPatch = <T>(endpoint: string, body?: any, organizationId?: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    organizationId,
  });
};

/**
 * DELETE request helper
 */
export const apiDelete = <T>(endpoint: string, organizationId?: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, { method: 'DELETE', organizationId } as RequestInit & { organizationId?: string });
};

