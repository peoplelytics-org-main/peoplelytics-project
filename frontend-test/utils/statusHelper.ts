
import type { Employee } from '../types';

export const getEmployeeStatus = (employee: Employee): { status: string; colorClasses: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize for date comparison

    if (employee.terminationDate) {
        const terminationDate = new Date(employee.terminationDate);
        // It's possible the date from data is just YYYY-MM-DD, which will be UTC midnight.
        // To avoid timezone issues, let's also normalize this date.
        const termDateOnly = new Date(terminationDate.valueOf() + terminationDate.getTimezoneOffset() * 60 * 1000);
        termDateOnly.setHours(0, 0, 0, 0);

        if (termDateOnly <= today) { // Already left
            return employee.terminationReason === 'Involuntary'
                ? { status: 'Terminated', colorClasses: 'bg-red-900/50 text-red-300 border border-red-500/30' }
                : { status: 'Resigned & Left', colorClasses: 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' };
        } else { // Resigned, serving notice
            return { status: 'Resigned', colorClasses: 'bg-orange-800/50 text-orange-300 border border-orange-500/30' };
        }
    }

    const hireDate = new Date(employee.hireDate);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    if (hireDate > ninetyDaysAgo) {
        return { status: 'On Probation', colorClasses: 'bg-blue-900/50 text-blue-300 border border-blue-500/30' };
    }

    return { status: 'Active', colorClasses: 'bg-green-900/50 text-green-300 border border-green-500/30' };
};
