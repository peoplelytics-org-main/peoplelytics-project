import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell } from 'lucide-react';
import NotificationPanel from './NotificationPanel';

const NotificationBell: React.FC = () => {
    const { unreadCount } = useNotifications();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsPanelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={panelRef}>
            <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="relative p-2 text-text-secondary hover:text-white rounded-full hover:bg-border">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </button>
            {isPanelOpen && <NotificationPanel onClose={() => setIsPanelOpen(false)} />}
        </div>
    );
};

export default NotificationBell;
