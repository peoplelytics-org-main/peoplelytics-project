// src/services/api/usersApi.ts
import { User } from '../../types';

const TOKEN_STORAGE_KEY = 'app_auth_token';

// Helper to get the token from sessionStorage (matching AuthContext)
const getAuthToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/organizations';

export const usersApi = {
  /**
   * Fetch all users from all organizations (Super Admin)
   */
  getAllGlobalUsers: async (): Promise<User[]> => {
    const token = getAuthToken();
    console.log('usersApi.getAllGlobalUsers - token:', token ? 'Present' : 'Not Present');

    const response = await fetch(`${API_BASE_URL}/users/global/all`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    // Fetch doesn't throw on 404/500, so we check manually
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const jsonResponse = await response.json();
    
    // Return the data array (matches your backend response structure: { success: true, data: [...] })
    return jsonResponse.data;
  },
};