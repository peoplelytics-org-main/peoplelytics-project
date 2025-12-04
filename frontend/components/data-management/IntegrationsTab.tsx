import React from 'react';
import IntegrationCard from '../integrations/IntegrationCard';

const IntegrationsTab: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <IntegrationCard name="BambooHR" description="Sync your employee roster, time off, and performance data directly from BambooHR." logoUrl="/images/bamboo-hr-logo.png" />
            <IntegrationCard name="Workday" description="Integrate with Workday to pull comprehensive HCM data, including compensation, talent, and payroll." logoUrl="/images/workday-logo.png" />
            <IntegrationCard name="Greenhouse" description="Connect to Greenhouse to sync candidate and recruitment pipeline data automatically." logoUrl="/images/greenhouse-logo.png" />
        </div>
    );
};

export default IntegrationsTab;
