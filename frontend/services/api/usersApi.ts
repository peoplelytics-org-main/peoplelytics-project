// src/services/api/usersApi.ts
import { User } from '../../types';

// Helper to get the token (adjust based on how you store your auth token)
const getAuthToken = () => localStorage.getItem('token'); 

const API_BASE_URL = 'http://localhost:5000/api/organizations'; // Replace with your actual backend URL

export const usersApi = {
  /**
   * Fetch all users from all organizations (Super Admin)
   */
  getAllGlobalUsers: async (): Promise<User[]> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/users/global/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add Authorization header if your backend requires it
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