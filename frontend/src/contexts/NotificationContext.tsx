import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import type { Notification } from '../types';

interface NotificationContextType {
    notifications: Notification[];
    toast: Notification | null;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
    markAsRead: (id: number) => void;
    clearToast: () => void;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [toast, setToast] = useState<Notification | null>(null);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now(),
            read: false,
            timestamp: new Date(),
        };
        setNotifications(prev => [newNotification, ...prev]);
        setToast(newNotification);
    }, []);

    const markAsRead = useCallback((id: number) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    }, []);

    const clearToast = useCallback(() => {
        setToast(null);
    }, []);

    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const value = useMemo(() => ({
        notifications,
        toast,
        addNotification,
        markAsRead,
        clearToast,
        unreadCount,
    }), [notifications, toast, addNotification, markAsRead, clearToast, unreadCount]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
