import React, { useMemo, useEffect, useState } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { LogOut, ShieldCheck, Building } from 'lucide-react';
import type { NavItem } from '../types';

interface SideNavProps {
    isOpen: boolean;
    onClose: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ isOpen, onClose }) => {
    const { currentUser, logout } = useAuth();
    const { isDataAnonymized, toggleAnonymization, canAnonymize, allOrganizations, activeOrganizationId, setActiveOrganizationId, currentPackageFeatures } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    const [showSuperAdminControls, setShowSuperAdminControls] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.shiftKey && (event.key === 'B' || event.key === 'b')) {
                if (currentUser?.role === 'Super Admin') {
                    event.preventDefault();
                    setShowSuperAdminControls(prev => !prev);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentUser]);

    useEffect(() => {
        // If super admin selects an org while on a super-admin-only page, navigate them to the home/dashboard view for that org.
        if (currentUser?.role === 'Super Admin' && activeOrganizationId && ['/app/user-management', '/app/super-admin-reports'].includes(location.pathname)) {
            navigate('/app/home');
        }
    }, [activeOrganizationId, currentUser, location.pathname, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const activeLinkClass = 'bg-primary-600 text-text-primary font-semibold';
    const inactiveLinkClass = 'text-text-secondary hover:bg-border hover:text-text-primary';

    const accessibleNavItems = useMemo(() => {
        if (!currentUser) return [];

        return NAV_ITEMS.filter(item => {
            // Rule 1: Check if the user has the required role for the item.
            if (!item.roles.includes(currentUser.role)) {
                return false;
            }

            // Rule 2: Check for feature flag access. Super Admin bypasses this check.
            const hasFeatureAccess = currentUser.role === 'Super Admin' || !item.featureFlag || (currentPackageFeatures && currentPackageFeatures[item.featureFlag]);
            if (!hasFeatureAccess) {
                return false;
            }

            // Rule 3: Special visibility for Super Admin specific views
            if (currentUser.role === 'Super Admin' && ['User Management', 'Platform Reports'].includes(item.name)) {
                return !activeOrganizationId; // Only show if NO organization is selected
            }
            
            // Rule 4: 'Home' is linked via the logo, not shown in the main nav list.
            if (item.name === 'Home') {
                return false;
            }

            return true;
        });
    }, [currentUser, currentPackageFeatures, activeOrganizationId]);

    if (!currentUser) return null;

    const displayedUsername = isDataAnonymized ? `User #${currentUser.id}` : currentUser.username.split('@')[0];
    
    const shouldShowAnonymize = canAnonymize && (
        currentUser.role !== 'Super Admin' || 
        (currentUser.role === 'Super Admin' && showSuperAdminControls)
    );
    
    const navContent = (
      <div className="w-80 sm:w-64 flex-shrink-0 bg-card p-4 border-r border-border flex flex-col h-full">
         <div>
             <Link to="/app/home" onClick={onClose} className="flex items-center mb-8 group">
                 <div className="p-2 bg-primary-600 rounded-lg mr-3 group-hover:bg-primary-700 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                     </svg>
                 </div>
                 <h1 className="text-xl font-bold text-text-primary group-hover:text-primary-400 transition-colors">Peoplelytics</h1>
             </Link>
             <nav className="flex flex-col space-y-2">
                 {accessibleNavItems.map((item: NavItem) => (
                     <NavLink
                         key={item.name}
                         to={item.href}
                         end
                         onClick={onClose}
                         className={({ isActive }) => 
                             `flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive ? activeLinkClass : inactiveLinkClass}`
                         }
                     >
                         <item.icon className="h-5 w-5 mr-3" />
                         {item.name}
                     </NavLink>
                 ))}
             </nav>
         </div>
         <div className="mt-auto">
             {currentUser.role === 'Super Admin' && showSuperAdminControls && (
                <div className="p-3 mb-2">
                    <label htmlFor="org-switcher" className="text-sm font-medium text-text-secondary flex items-center gap-2 mb-2">
                        <Building className="h-5 w-5"/>
                        Viewing Organization
                    </label>
                    <select
                        id="org-switcher"
                        value={activeOrganizationId || ''}
                        onChange={(e) => setActiveOrganizationId(e.target.value || null)}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                        <option value="">-- Global View --</option>
                        {allOrganizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name} {org.status === 'Inactive' ? '(Inactive)' : ''}</option>
                        ))}
                    </select>
                </div>
              )}
              {shouldShowAnonymize && (
                 <div className="p-3 rounded-md mb-2">
                     <label htmlFor="anonymize-toggle" className="flex items-center justify-between cursor-pointer">
                         <span className="text-sm font-medium text-text-secondary flex items-center gap-2">
                             <ShieldCheck className="h-5 w-5"/>
                             Anonymize Data
                         </span>
                         <div className="relative">
                             <input id="anonymize-toggle" type="checkbox" className="sr-only" checked={isDataAnonymized} onChange={toggleAnonymization} />
                             <div className={`block w-10 h-6 rounded-full ${isDataAnonymized ? 'bg-primary-600' : 'bg-border'}`}></div>
                             <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isDataAnonymized ? 'transform translate-x-full' : ''}`}></div>
                         </div>
                     </label>
                 </div>
             )}
             <div className="border-t border-border pt-4">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold text-white">
                         {currentUser.username.charAt(0)}
                     </div>
                     <div>
                         <p className="font-semibold text-sm text-text-primary">{displayedUsername}</p>
                         <p className="text-xs text-text-primary/80">{currentUser.role} {currentUser.organizationName ? `- ${currentUser.organizationName}` : ''}</p>
                     </div>
                     <button onClick={handleLogout} aria-label="Log out" className="ml-auto text-text-primary/80 hover:text-text-primary p-2 rounded-md">
                         <LogOut className="h-5 w-5" />
                     </button>
                 </div>
             </div>
         </div>
     </div>
    );

    return (
        <>
            {/* Desktop Nav */}
            <aside className="hidden md:block">
              {navContent}
            </aside>

            {/* Mobile Nav */}
            <div 
                className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div 
                    className="absolute inset-0 bg-black/60"
                    onClick={onClose}
                ></div>
                <div 
                    className={`relative z-50 h-full transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    {navContent}
                </div>
            </div>
        </>
    );
};

export default SideNav;