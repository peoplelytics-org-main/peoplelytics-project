import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { NAV_ITEMS, MOCK_ORGANIZATIONS } from '../constants';
import { useData } from '../contexts/DataContext';

const HomePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { activeOrganizationId, currentPackageFeatures } = useData();
    
    const menuItems = useMemo(() => {
        if (!currentUser) return [];

        let rolesForFiltering = currentUser.role;

        // If Super Admin has selected an org, show them what an Org Admin would see.
        if (currentUser.role === 'Super Admin' && activeOrganizationId) {
            rolesForFiltering = 'Org Admin';
        }
        
        return NAV_ITEMS.filter(item => 
            item.name !== 'Home' && 
            item.roles.includes(rolesForFiltering) &&
            (!item.featureFlag || (currentPackageFeatures && currentPackageFeatures[item.featureFlag]))
        );
    }, [currentUser, activeOrganizationId, currentPackageFeatures]);

    const greeting = useMemo(() => {
        if (!currentUser) return "Welcome";
        if (currentUser.role === 'Super Admin') {
            const activeOrg = MOCK_ORGANIZATIONS.find(o => o.id === activeOrganizationId);
            return activeOrg ? `Viewing ${activeOrg.name}` : "Welcome, Super Admin";
        }
        return `Welcome, ${currentUser.username}`;
    }, [currentUser, activeOrganizationId]);

    const subGreeting = useMemo(() => {
        if (!currentUser) return "Your central hub for data-driven HR insights.";
        if (currentUser.role === 'Super Admin') {
            return activeOrganizationId 
                ? "You are viewing this organization's modules as an administrator."
                : "Please select an organization from the sidebar to begin.";
        }
        return `Your central hub for ${currentUser.organizationName || 'your organization'}'s data.`;
    }, [currentUser, activeOrganizationId]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-text-primary">{greeting}</h1>
                <p className="mt-2 text-lg text-text-secondary">{subGreeting}</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {menuItems.map((item) => (
                    <Link to={item.href} key={item.name} className="block group">
                        <Card className="h-full flex flex-col justify-between border-2 border-transparent group-hover:border-primary-500/80 group-hover:shadow-lg group-hover:shadow-primary-900/20 transition-all duration-300 transform group-hover:-translate-y-1">
                           <div>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className="p-3 bg-primary-900/50 rounded-lg">
                                        <item.icon className="h-6 w-6 text-primary-400" />
                                    </div>
                                    <CardTitle className="text-xl">{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-text-secondary">{item.description || 'Access this module.'}</p>
                                </CardContent>
                           </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default HomePage;