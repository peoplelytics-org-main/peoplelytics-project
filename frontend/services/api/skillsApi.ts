import { apiGet, apiPost, apiPut, apiPatch, apiDelete, ApiResponse } from './baseApi';

export interface Skill {
  skillLevelId: string;
  employeeId: string;
  employeeName: string;
  skillName: string;
  skillLevel: 'Novice' | 'Beginner' | 'Competent' | 'Proficient' | 'Expert';
}

export interface SkillsFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  skillName?: string;
  skillLevel?: string;
}

export interface SkillsListResponse {
  data: Skill[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SkillsSummary {
  total: number;
  bySkillLevel: Record<string, number>;
  bySkillName: Record<string, number>;
  topSkills: Array<{ skillName: string; count: number }>;
}

/**
 * Skills API service
 */
export const skillsApi = {
  /**
   * Get all skills with optional filters and pagination
   */
  getAll: async (filters?: SkillsFilters, organizationId?: string): Promise<ApiResponse<SkillsListResponse>> => {
    return apiGet<SkillsListResponse>('/skills', filters, organizationId);
  },

  /**
   * Get skill by ID
   */
  getById: async (skillLevelId: string): Promise<ApiResponse<Skill>> => {
    return apiGet<Skill>(`/skills/${skillLevelId}`);
  },

  /**
   * Create a new skill
   */
  create: async (skill: Partial<Skill>): Promise<ApiResponse<Skill>> => {
    return apiPost<Skill>('/skills', skill);
  },

  /**
   * Update a skill
   */
  update: async (skillLevelId: string, skill: Partial<Skill>): Promise<ApiResponse<Skill>> => {
    return apiPut<Skill>(`/skills/${skillLevelId}`, skill);
  },

  /**
   * Delete a skill
   */
  delete: async (skillLevelId: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/skills/${skillLevelId}`);
  },

  /**
   * Bulk create skills
   */
  bulkCreate: async (skills: Partial<Skill>[]): Promise<ApiResponse<{
    created: number;
    failed: number;
    errors: string[];
  }>> => {
    return apiPost('/skills/bulk', { skills });
  },

  /**
   * Get skills summary statistics
   */
  getSummary: async (): Promise<ApiResponse<SkillsSummary>> => {
    return apiGet<SkillsSummary>('/skills/summary');
  },
};

