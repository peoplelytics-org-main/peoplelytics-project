import { ApiResponse } from './baseApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'app_auth_token';

// Helper to get auth token
const getAuthToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

// Helper to build headers with auth (for FormData, don't set Content-Type)
const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface UploadResponse {
  created: number;
  failed: number;
  errors: string[];
}

/**
 * Upload API service
 */
export const uploadApi = {
  /**
   * Upload employees from CSV/Excel file
   */
  uploadEmployees: async (file: File): Promise<ApiResponse<UploadResponse>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload/employees`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: formData,
      });

      // Handle non-JSON responses
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // If response is not JSON, read as text
        const text = await response.text();
        return {
          success: false,
          error: text || `HTTP error! status: ${response.status}`,
          errors: [],
        };
      }

      if (!response.ok) {
        // Don't throw errors - just return failure response
        // This prevents errors from bubbling up and triggering logout
        return {
          success: false,
          error: data.error || data.message || `HTTP error! status: ${response.status}`,
          errors: data.errors || [],
        };
      }

      return {
        success: true,
        ...data,
      };
    } catch (error: any) {
      console.error('Upload employees failed:', error);
      // Don't re-throw - just return error response
      return {
        success: false,
        error: error.message || 'Network error occurred',
        errors: [],
      };
    }
  },

  /**
   * Upload attendance from CSV/Excel file
   */
  uploadAttendance: async (file: File): Promise<ApiResponse<UploadResponse>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload/attendance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: formData,
      });

      // Handle non-JSON responses
      let data;
      try {
        data = await response.json();
      } catch (e) {
        const text = await response.text();
        return {
          success: false,
          error: text || `HTTP error! status: ${response.status}`,
          errors: [],
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP error! status: ${response.status}`,
          errors: data.errors || [],
        };
      }

      return {
        success: true,
        ...data,
      };
    } catch (error: any) {
      console.error('Upload attendance failed:', error);
      // Don't re-throw - just return error response
      return {
        success: false,
        error: error.message || 'Network error occurred',
        errors: [],
      };
    }

  },
  uploadRecruitmentFunnels: async (file: File): Promise<ApiResponse<UploadResponse>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Assumes your backend endpoint is /upload/recruitment-funnels
      const response = await fetch(`${API_BASE_URL}/upload/recruitment-funnels`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: formData,
      });

      // Handle non-JSON responses
      let data;
      try {
        data = await response.json();
      } catch (e) {
        const text = await response.text();
        return {
          success: false,
          error: text || `HTTP error! status: ${response.status}`,
          errors: [],
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP error! status: ${response.status}`,
          errors: data.errors || [],
        };
      }

      return {
        success: true,
        ...data,
      };
    } catch (error: any) {
      console.error('Upload recruitment funnels failed:', error);
      // Don't re-throw - just return error response
      return {
        success: false,
        error: error.message || 'Network error occurred',
        errors: [],
      };
    }
  },
};



