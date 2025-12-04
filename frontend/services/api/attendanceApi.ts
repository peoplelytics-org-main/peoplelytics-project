import { apiGet, apiPost, apiPut, apiPatch, apiDelete, ApiResponse } from './baseApi';
import type { AttendanceRecord } from '../../types';

export interface AttendanceFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  status?: 'Present' | 'Unscheduled Absence' | 'PTO' | 'Sick Leave';
  startDate?: string;
  endDate?: string;
}

export interface AttendanceListResponse {
  data: AttendanceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  pto: number;
  sickLeave: number;
  unscheduledAbsence: number;
  byStatus: Record<string, number>;
}

/**
 * Attendance API service
 */
export const attendanceApi = {
  /**
   * Get all attendance records with optional filters and pagination
   */
  getAll: async (filters?: AttendanceFilters, organizationId?: string): Promise<ApiResponse<AttendanceListResponse>> => {
    return apiGet<AttendanceListResponse>('/attendance', filters, organizationId);
  },

  /**
   * Get attendance record by ID
   */
  getById: async (attendanceId: string): Promise<ApiResponse<AttendanceRecord>> => {
    return apiGet<AttendanceRecord>(`/attendance/${attendanceId}`);
  },

  /**
   * Create a new attendance record
   */
  create: async (attendance: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> => {
    return apiPost<AttendanceRecord>('/attendance', attendance);
  },

  /**
   * Update an attendance record
   */
  update: async (attendanceId: string, attendance: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> => {
    return apiPut<AttendanceRecord>(`/attendance/${attendanceId}`, attendance);
  },

  /**
   * Delete an attendance record
   */
  delete: async (attendanceId: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/attendance/${attendanceId}`);
  },

  /**
   * Bulk create attendance records
   */
  bulkCreate: async (records: Partial<AttendanceRecord>[]): Promise<ApiResponse<{
    created: number;
    failed: number;
    errors: string[];
  }>> => {
    return apiPost('/attendance/bulk', { attendanceRecords: records });
  },

  /**
   * Get attendance summary statistics
   */
  getSummary: async (filters?: AttendanceFilters): Promise<ApiResponse<AttendanceSummary>> => {
    return apiGet<AttendanceSummary>('/attendance/summary', filters);
  },
};

