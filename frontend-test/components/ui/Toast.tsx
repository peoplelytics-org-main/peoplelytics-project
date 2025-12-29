import React, { useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
    const { toast, clearToast } = useNotifications();

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                clearToast();
            }, 5000); // Auto-dismiss after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [toast, clearToast]);

    if (!toast) return null;

    const icons = {
        info: <Info className="h-5 w-5" />,
        success: <CheckCircle className="h-5 w-5" />,
        warning: <AlertTriangle className="h-5 w-5" />,
        error: <AlertTriangle className="h-5 w-5" />,
    };

    const colors = {
        info: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        error: 'bg-red-600',
    };

    return (
        <div className="fixed top-5 right-5 z-50">
            <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg text-white ${colors[toast.type]} animate-fade-in-right`}>
                <div className="flex-shrink-0">{icons[toast.type]}</div>
                <div className="flex-1">
                    <p className="font-bold">{toast.title}</p>
                    <p className="text-sm">{toast.message}</p>
                </div>
                <button onClick={clearToast} className="ml-4 -mr-2 -mt-2 p-1 rounded-full hover:bg-white/20 transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>
            <style>{`
                @keyframes fade-in-right {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-right { animation: fade-in-right 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};
