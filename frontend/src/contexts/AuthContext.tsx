import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';


interface AuthContextType {
    currentUser: User | null;
    isLoggedIn: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In a real app, this would be a secure HttpOnly cookie or similar token.
const MOCK_AUTH_TOKEN_KEY = 'mock_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            // Simulate an API call to verify a token
            await new Promise(res => setTimeout(res, 500));
            const token = localStorage.getItem(MOCK_AUTH_TOKEN_KEY);
            if (token) {
                const { userId } = JSON.parse(token);
                const user = MOCK_USERS.find(u => u.id === userId);
                if (user) {
                    setCurrentUser(user);
                } else {
                    localStorage.removeItem(MOCK_AUTH_TOKEN_KEY);
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
        } catch (error) {
            console.error("Auth check failed", error);
            localStorage.removeItem(MOCK_AUTH_TOKEN_KEY);
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);


    const login = useCallback(async (username: string, password: string) => {
        // Simulate a login API call
        await new Promise(res => setTimeout(res, 1000));
        
        const user = MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (user && user.password === password) {
            localStorage.setItem(MOCK_AUTH_TOKEN_KEY, JSON.stringify({ userId: user.id }));
            setCurrentUser(user);
        } else {
            throw new Error("Invalid username or password.");
        }
    }, []);

    const logout = useCallback(() => {
        // Simulate a logout API call
        localStorage.removeItem(MOCK_AUTH_TOKEN_KEY);
        setCurrentUser(null);
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