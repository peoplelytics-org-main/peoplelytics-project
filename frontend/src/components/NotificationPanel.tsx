import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { X, AlertTriangle, CheckCircle, Info, Bell } from 'lucide-react';

interface NotificationPanelProps {
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
    const { notifications, markAsRead } = useNotifications();

    const icons = {
        info: <Info className="h-5 w-5 text-blue-400" />,
        success: <CheckCircle className="h-5 w-5 text-green-400" />,
        warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
        error: <AlertTriangle className="h-5 w-5 text-red-400" />,
    };

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 max-w-sm bg-card border border-border rounded-lg shadow-2xl z-50">
            <div className="flex justify-between items-center p-3 border-b border-border">
                <h3 className="font-semibold text-text-primary">Notifications</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-border">
                    <X className="h-4 w-4 text-text-secondary"/>
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`flex items-start gap-3 p-3 border-b border-border ${!notification.read ? 'bg-primary-900/20' : ''}`}
                        >
                            <div className="flex-shrink-0 mt-1">{icons[notification.type]}</div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-text-primary">{notification.title}</p>
                                <p className="text-xs text-text-secondary">{notification.message}</p>
                                <p className="text-xs text-text-secondary/70 mt-1">{formatTimeAgo(notification.timestamp)}</p>
                            </div>
                            {!notification.read && (
                                <button onClick={() => markAsRead(notification.id)} className="flex-shrink-0 p-1" title="Mark as read">
                                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-text-secondary">
                        <Bell className="h-8 w-8 mx-auto mb-2"/>
                        <p className="text-sm">You have no new notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
