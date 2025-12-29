import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import type { User, UserRole } from '../types';

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


interface AuthContextType {
    currentUser: User | null;
    isLoggedIn: boolean;
    login: (username: string, password: string,organizationId:string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const handleResponse = async (response: Response) => {
    if (response.ok) {
      return response.json(); // Continue if successful
    }
    
    // If the server sent a specific error message, use it
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'An error occurred');
      } else {
        // If response is not JSON, read as text
        const text = await response.text();
        throw new Error(text || `HTTP error! Status: ${response.status}`);
      }
    } catch (e) {
      // If parsing failed, throw a generic error with status
      if (e instanceof Error && e.message) {
        throw e;
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  };
// In a real app, this would be a secure HttpOnly cookie or similar token.
//const MOCK_AUTH_TOKEN_KEY = 'mock_auth_token';

// Storage key for persisting user data
const USER_STORAGE_KEY = 'app_user_data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize with stored user data if available (for page reload persistence)
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const stored = sessionStorage.getItem(USER_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Only restore if data looks valid
                if (parsed && parsed.id && parsed.username) {
                    return parsed;
                }
            }
        } catch (error) {
            console.warn('Failed to restore user from storage:', error);
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);
    const isCheckingAuthRef = React.useRef(false);
    const hasCheckedAuth = React.useRef(false);

    const checkAuthStatus = useCallback(async () => {
      // Prevent multiple simultaneous calls using ref
      if (isCheckingAuthRef.current) {
        return;
      }
      
      isCheckingAuthRef.current = true;
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include"
        });
    
        if (!response.ok) {
          // If rate limited, don't keep retrying - just set loading to false
          if (response.status === 429) {
            console.warn('Rate limited on auth check');
            setIsLoading(false);
            isCheckingAuthRef.current = false;
            // Don't update user state, keep existing state
            return;
          }
          
          // Only log out on 401 (Unauthorized) - this means the token is invalid/expired
          // For other errors (500, 503, network errors), keep the user logged in
          if (response.status === 401) {
            console.warn('Authentication failed - token invalid/expired, logging out');
            setCurrentUser(null);
            // Clear stored user data
            try {
                sessionStorage.removeItem(USER_STORAGE_KEY);
            } catch (error) {
                console.warn('Failed to clear user from storage:', error);
            }
            return;
          }
          
          // For other errors (500, 503, etc.), keep user logged in but log the error
          // Use stored user data if available (for page reload resilience)
          console.warn('Auth check failed with status:', response.status, '- keeping user logged in with stored data');
          // Don't update user state, keep existing state (or restore from storage)
          if (!currentUser) {
              try {
                  const stored = sessionStorage.getItem(USER_STORAGE_KEY);
                  if (stored) {
                      const parsed = JSON.parse(stored);
                      if (parsed && parsed.id && parsed.username) {
                          setCurrentUser(parsed);
                      }
                  }
              } catch (error) {
                  console.warn('Failed to restore user from storage:', error);
              }
          }
          return;
        }
    
        const data = await response.json();
        const userData = data.user || null;
        setCurrentUser(userData);
        
        // Persist user data to sessionStorage for page reload persistence
        if (userData) {
            try {
                sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
            } catch (error) {
                console.warn('Failed to save user to storage:', error);
            }
        } else {
            // Clear storage if no user
            try {
                sessionStorage.removeItem(USER_STORAGE_KEY);
            } catch (error) {
                console.warn('Failed to clear user from storage:', error);
            }
        }
        
        hasCheckedAuth.current = true;
      } catch (error) {
        // Network errors or other exceptions - don't log out, just log the error
        // Only log out if we explicitly get a 401 response
        console.warn('Auth check error (network/server issue) - keeping user logged in:', error);
        // Don't set currentUser to null on network errors
        // Try to restore from storage if currentUser is null
        if (!currentUser) {
            try {
                const stored = sessionStorage.getItem(USER_STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed && parsed.id && parsed.username) {
                        setCurrentUser(parsed);
                    }
                }
            } catch (e) {
                console.warn('Failed to restore user from storage:', e);
            }
        }
      } finally {
        setIsLoading(false);
        isCheckingAuthRef.current = false;
      }
    }, []);
    

    useEffect(() => {
        // Only check auth status once on mount
        if (!hasCheckedAuth.current && !isCheckingAuthRef.current) {
            checkAuthStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run once on mount


    const login = useCallback(async (username: string, password: string,organizationId?:string) => {
        // This function now calls the real API using fetch
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password ,organizationId}),
            // ❗️ This is critical for receiving the httpOnly cookie
            credentials: 'include',
          });
    
          const data = await handleResponse(response);
          
          // We get the user data from the API response
          const userData = data.user;
          setCurrentUser(userData);
          
          // Persist user data to sessionStorage for page reload persistence
          if (userData) {
              try {
                  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
              } catch (error) {
                  console.warn('Failed to save user to storage:', error);
              }
          }
          
          // No token handling needed! The browser stores the httpOnly cookie automatically.
        } catch (error) {
          // Re-throw the error to be caught by the LoginPage component
          throw error; 
        }
      }, []);

      const logout = useCallback(async () => {
        // This calls the backend to clear the httpOnly cookie
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            // ❗️ This is critical for sending the cookie to be cleared
            credentials: 'include',
          });
        } catch (error) {
          console.error("Logout request failed:", error);
        } finally {
          // Always clear the user from the client state
          setCurrentUser(null);
          // Clear stored user data
          try {
              sessionStorage.removeItem(USER_STORAGE_KEY);
          } catch (error) {
              console.warn('Failed to clear user from storage:', error);
          }
        }
      }, []);

    const value = useMemo(() => ({
        currentUser,
        isLoggedIn: !!currentUser,
        login,
        logout,
        isLoading,
    }), [currentUser, login, logout, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};