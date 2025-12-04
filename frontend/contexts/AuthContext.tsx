import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import type { User, UserRole } from '../types';


interface AuthContextType {
    currentUser: User | null;
    isLoggedIn: boolean;
    login: (username: string, password: string) => Promise<void>;
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
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    } catch (e) {
      // If the error response wasn't JSON, throw a generic error
      throw new Error((e as Error).message || `HTTP error! Status: ${response.status}`);
    }
  };
// In a real app, this would be a secure HttpOnly cookie or similar token.
//const MOCK_AUTH_TOKEN_KEY = 'mock_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = useCallback(async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          credentials: "include"
        });
    
        if (!response.ok) throw new Error();
    
        const data = await response.json();
        setCurrentUser(data.user||null);
      } catch (_) {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }, []);
    

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);


    const login = useCallback(async (username: string, password: string) => {
        // This function now calls the real API using fetch
        try {
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
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