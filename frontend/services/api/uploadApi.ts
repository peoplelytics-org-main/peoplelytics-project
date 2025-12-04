import { ApiResponse } from './baseApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
        credentials: 'include',
        body: formData,
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
      console.error('Upload employees failed:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred',
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
        credentials: 'include',
        body: formData,
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
      console.error('Upload attendance failed:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred',
      };
    }
  },
};



