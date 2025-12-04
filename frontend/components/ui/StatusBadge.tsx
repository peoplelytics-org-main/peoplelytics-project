import React from 'react';
import type { Employee } from '../../types';
import { getEmployeeStatus } from '../../utils/statusHelper';

interface StatusBadgeProps {
    employee: Employee;
    className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ employee, className }) => {
    const { status, colorClasses } = getEmployeeStatus(employee);
    
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full inline-block text-center whitespace-nowrap ${colorClasses} ${className || ''}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
