import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from './SideNav';
import MobileHeader from './MobileHeader';
import { ToastContainer } from './ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationContext';

const AppLayout: React.FC = () => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const { currentUser } = useAuth();
    const { allOrganizations } = useData();
    const { addNotification } = useNotifications();

    useEffect(() => {
        if (currentUser?.role === 'Org Admin' && currentUser.organizationId) {
            const org = allOrganizations.find(o => o.id === currentUser.organizationId);
            if (org && org.status === 'Active') {
                const today = new Date();
                const endDate = new Date(org.subscriptionEndDate);
                const diffTime = endDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 10 && diffDays >= 0) {
                    const notificationId = `exp-warn-${org.id}`;
                    if (!sessionStorage.getItem(notificationId)) {
                        addNotification({
                            type: 'warning',
                            title: 'Subscription Expiring Soon',
                            message: `Your organization's license will expire on ${org.subscriptionEndDate}. Please contact support to renew.`
                        });
                        sessionStorage.setItem(notificationId, 'true');
                    }
                }
            }
        }
    }, [currentUser, allOrganizations, addNotification]);

    return (
        <div className="flex h-full bg-background text-text-primary">
            <SideNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                <MobileHeader onMenuClick={() => setMobileNavOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
            <ToastContainer />
        </div>
    );
};

export default AppLayout;