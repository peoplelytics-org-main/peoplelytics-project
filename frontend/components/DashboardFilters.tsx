import React from 'react';
import Card from './ui/Card';

interface DashboardFiltersProps {
  filters: {
    department: string;
    jobTitle: string;
    location: string;
    timePeriod: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  totalRevenue: string;
  setTotalRevenue: (value: string) => void;
  uniqueValues: {
    departments: string[];
    jobTitles: string[];
    locations: string[];
  };
  isDepartmentDisabled?: boolean;
}

const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: (string | {value: string; label: string})[], includeAll?: boolean }> = ({ label, options, includeAll = true, ...props }) => (
  <div className="w-full">
    <label htmlFor={props.id} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
    <select
      {...props}
      disabled={props.disabled}
      className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {includeAll && <option value="all">All</option>}
      {options.map(opt => {
          if (typeof opt === 'string') {
              return <option key={opt} value={opt}>{opt}</option>;
          }
          return <option key={opt.value} value={opt.value}>{opt.label}</option>;
      })}
    </select>
  </div>
);


const RevenueInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div className="w-full">
        <label htmlFor={props.id} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-secondary">$</span>
            <input
                {...props}
                className="w-full bg-background border border-border rounded-md pl-7 pr-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
        </div>
    </div>
);


const DashboardFilters: React.FC<DashboardFiltersProps> = ({ filters, setFilters, totalRevenue, setTotalRevenue, uniqueValues, isDepartmentDisabled }) => {
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4">
            <SelectInput
                id="department-filter"
                name="department"
                label="Department"
                value={filters.department}
                onChange={handleFilterChange}
                options={uniqueValues.departments}
                disabled={isDepartmentDisabled}
            />
            <SelectInput
                id="jobtitle-filter"
                name="jobTitle"
                label="Job Title"
                value={filters.jobTitle}
                onChange={handleFilterChange}
                options={uniqueValues.jobTitles}
            />
            <SelectInput
                id="location-filter"
                name="location"
                label="Location"
                value={filters.location}
                onChange={handleFilterChange}
                options={uniqueValues.locations}
            />
             <SelectInput
                id="time-period-filter"
                name="timePeriod"
                label="Time Period"
                value={filters.timePeriod}
                onChange={handleFilterChange}
                includeAll={false}
                options={[
                  { value: 'all', label: 'All Time' },
                  { value: '12m', label: 'Last 12 Months' },
                  { value: '6m', label: 'Last 6 Months' },
                  { value: '3m', label: 'Last 3 Months' }
                ]}
            />
            <RevenueInput
                id="revenue-input"
                label="Total Revenue"
                type="number"
                placeholder="e.g., 5000000"
                value={totalRevenue}
                onChange={(e) => setTotalRevenue(e.target.value)}
            />
        </div>
    </Card>
  );
};

export default DashboardFilters;