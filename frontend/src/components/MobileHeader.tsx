import React from 'react';
import { Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';

interface MobileHeaderProps {
    onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-30">
            <button onClick={onMenuClick} className="text-text-secondary hover:text-white">
                <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-text-primary">Peoplelytics</h1>
            <NotificationBell />
        </header>
    );
};

export default MobileHeader;
