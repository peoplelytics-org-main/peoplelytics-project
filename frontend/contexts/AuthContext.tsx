import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import type { User, UserRole } from '../types';


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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
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
        const response = await fetch("http://localhost:5000/api/auth/me", {
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
          // For other errors, set user to null
          setCurrentUser(null);
          return;
        }
    
        const data = await response.json();
        setCurrentUser(data.user||null);
        hasCheckedAuth.current = true;
      } catch (error) {
        // Only set to null if it's not a rate limit error
        if (error instanceof Error && !error.message.includes('429')) {
          setCurrentUser(null);
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
          const response = await fetch('http://localhost:5000/api/auth/login', {
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
          setCurrentUser(data.user);
          
          // No token handling needed! The browser stores the httpOnly cookie automatically.
        } catch (error) {
          // Re-throw the error to be caught by the LoginPage component
          throw error; 
        }
      }, []);

      const logout = useCallback(async () => {
        // This calls the backend to clear the httpOnly cookie
        try {
          await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            // ❗️ This is critical for sending the cookie to be cleared
            credentials: 'include',
          });
        } catch (error) {
          console.error("Logout request failed:", error);
        } finally {
          // Always clear the user from the client state
          setCurrentUser(null);
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