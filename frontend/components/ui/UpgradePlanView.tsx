import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface UpgradePlanViewProps {
    featureName: string;
}

const UpgradePlanView: React.FC<UpgradePlanViewProps> = ({ featureName }) => {
    return (
        <div className="flex items-center justify-center h-full text-center p-4">
            <Card className="max-w-md w-full">
                <div className="p-6">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center bg-primary-900/50 rounded-full">
                        <Lock className="h-6 w-6 text-primary-400" />
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-text-primary">Upgrade Required</h3>
                    <p className="mt-2 text-text-secondary">
                        Access to "{featureName}" is not available on your organization's current plan.
                        Please contact an administrator or upgrade your package to access this functionality.
                    </p>
                    <Link to="/pricing" className="mt-6 inline-block">
                        <Button>View Pricing Plans</Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}

export default UpgradePlanView;