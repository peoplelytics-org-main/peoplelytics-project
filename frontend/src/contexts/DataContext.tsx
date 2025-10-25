import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import type { Employee, AttendanceRecord, JobPosition, RecruitmentFunnel, Organization, User, AppPackage } from '../types';
import { useAuth } from './AuthContext';
import { MOCK_EMPLOYEE_DATA, MOCK_ATTENDANCE_DATA, MOCK_JOB_POSITIONS, MOCK_RECRUITMENT_FUNNEL_DATA, MOCK_ORGANIZATIONS, MOCK_USERS, APP_PACKAGES } from '../constants';


interface DataContextType {
    employeeData: Employee[]; // This is the LATEST snapshot for each employee
    historicalEmployeeData: Employee[]; // This is ALL historical data for the org
    appendEmployeeData: (data: Employee[]) => void;
    replaceEmployeeDataForOrg: (orgId: string, data: Employee[]) => void;
    attendanceData: AttendanceRecord[];
    setAttendanceData: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
    jobPositions: JobPosition[];
    setJobPositions: React.Dispatch<React.SetStateAction<JobPosition[]>>;
    recruitmentFunnels: RecruitmentFunnel[];
    setRecruitmentFunnels: React.Dispatch<React.SetStateAction<RecruitmentFunnel[]>>;
    displayedData: Employee[]; // Anonymized version of employeeData (latest snapshot)
    isDataAnonymized: boolean;
    toggleAnonymization: () => void;
    canAnonymize: boolean;
    
    activeOrganizationId: string | null;
    activeOrganization: Organization | null;
    setActiveOrganizationId: (orgId: string | null) => void;
    allOrganizations: Organization[];
    setAllOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
    allUsers: User[];
    setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
    currentPackageFeatures: AppPackage['features'] | null;
    currentOrgHeadcount: number;
    currentOrgHeadcountLimit: number;
    currentPackageRoleLimits: AppPackage['roleLimits'] | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    
    const [allEmployeeData, setAllEmployeeData] = useState<Employee[]>(MOCK_EMPLOYEE_DATA);
    const [allAttendanceData, setAllAttendanceData] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE_DATA);
    const [allJobPositions, setAllJobPositions] = useState<JobPosition[]>(MOCK_JOB_POSITIONS);
    const [allRecruitmentFunnels, setAllRecruitmentFunnels] = useState<RecruitmentFunnel[]>(MOCK_RECRUITMENT_FUNNEL_DATA);
    const [allOrganizations, setAllOrganizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
    const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
    
    const [isDataAnonymized, setIsDataAnonymized] = useState(false);
    const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
    
    const canAnonymize = currentUser?.role === 'Super Admin' || currentUser?.role === 'Org Admin';

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let orgsChanged = false;
        const updatedOrgs = allOrganizations.map(org => {
            const endDate = new Date(org.subscriptionEndDate);
            if (org.status === 'Active' && endDate < today) {
                orgsChanged = true;
                return { ...org, status: 'Inactive' as 'Inactive' };
            }
            return org;
        });

        if (orgsChanged) {
            setAllOrganizations(updatedOrgs);
        }
    }, []);

    const toggleAnonymization = useCallback(() => {
        if (canAnonymize) {
            setIsDataAnonymized(prev => !prev);
        }
    }, [canAnonymize]);

    const appendEmployeeData = useCallback((newData: Employee[]) => {
        const orgId = currentUser?.role === 'Super Admin' ? activeOrganizationId : currentUser?.organizationId;
        if (!orgId) {
            console.error("Cannot append employee data without an active organization context.");
            return;
        }

        const snapshotDate = new Date().toISOString().split('T')[0];

        const newRecordsWithMetadata = newData.map(e => ({
            ...e,
            organizationId: orgId,
            snapshotDate: snapshotDate,
        }));

        setAllEmployeeData(prevAll => [...prevAll, ...newRecordsWithMetadata]);
    }, [currentUser, activeOrganizationId]);

    const replaceEmployeeDataForOrg = useCallback((orgId: string, newData: Employee[]) => {
        const snapshotDate = new Date().toISOString().split('T')[0];
        const newRecordsWithMetadata = newData.map(e => ({
            ...e,
            organizationId: orgId,
            snapshotDate: snapshotDate,
        }));

        setAllEmployeeData(prevAll => [
            ...prevAll.filter(e => e.organizationId !== orgId),
            ...newRecordsWithMetadata
        ]);
    }, []);


    const { employeeData, historicalEmployeeData, attendanceData, jobPositions, recruitmentFunnels, currentPackageFeatures, currentOrgHeadcount, currentOrgHeadcountLimit, currentPackageRoleLimits, activeOrganization } = useMemo(() => {
        const orgId = currentUser?.role === 'Super Admin' ? activeOrganizationId : currentUser?.organizationId;

        const organization = allOrganizations.find(o => o.id === orgId);

        if (!orgId || !organization) {
            return { employeeData: [], historicalEmployeeData: [], attendanceData: [], jobPositions: [], recruitmentFunnels: [], currentPackageFeatures: null, currentOrgHeadcount: 0, currentOrgHeadcountLimit: 0, currentPackageRoleLimits: null, activeOrganization: null };
        }
        
        const packageInfo = organization ? APP_PACKAGES[organization.package] : APP_PACKAGES['Basic'];

        const orgHistoricalData = allEmployeeData.filter(e => e.organizationId === orgId);

        const latestEmployeeRecords = new Map<string, Employee>();
        orgHistoricalData.forEach(record => {
            const existing = latestEmployeeRecords.get(record.id);
            
            if (!existing) {
                latestEmployeeRecords.set(record.id, record);
                return;
            }
            
            if (record.snapshotDate) {
                if (!existing.snapshotDate) {
                    latestEmployeeRecords.set(record.id, record);
                    return;
                }
                if (new Date(record.snapshotDate) >= new Date(existing.snapshotDate)) {
                    latestEmployeeRecords.set(record.id, record);
                }
            }
        });

        const currentSnapshot = Array.from(latestEmployeeRecords.values());

        return {
            employeeData: currentSnapshot,
            historicalEmployeeData: orgHistoricalData,
            attendanceData: allAttendanceData.filter(a => a.organizationId === orgId),
            jobPositions: allJobPositions.filter(j => j.organizationId === orgId),
            recruitmentFunnels: allRecruitmentFunnels.filter(r => r.organizationId === orgId),
            currentPackageFeatures: packageInfo.features,
            currentOrgHeadcount: currentSnapshot.length,
            currentOrgHeadcountLimit: packageInfo.headcountLimit,
            currentPackageRoleLimits: packageInfo.roleLimits || null,
            activeOrganization: organization,
        };
    }, [currentUser, activeOrganizationId, allEmployeeData, allAttendanceData, allJobPositions, allRecruitmentFunnels, allOrganizations]);
    
    const displayedData = useMemo(() => {
        if (isDataAnonymized) {
            return employeeData.map(emp => ({
                ...emp,
                name: `Employee #${emp.id.split('-')[0]}`,
                salary: 0,
            }));
        }
        return employeeData;
    }, [employeeData, isDataAnonymized]);

    const value = useMemo(() => ({
        employeeData,
        historicalEmployeeData,
        appendEmployeeData,
        replaceEmployeeDataForOrg,
        attendanceData,
        setAttendanceData: setAllAttendanceData,
        jobPositions,
        setJobPositions: setAllJobPositions,
        recruitmentFunnels,
        setRecruitmentFunnels: setAllRecruitmentFunnels,
        displayedData,
        isDataAnonymized,
        toggleAnonymization,
        canAnonymize,
        activeOrganizationId,
        activeOrganization,
        setActiveOrganizationId,
        allOrganizations,
        setAllOrganizations,
        allUsers,
        setAllUsers,
        currentPackageFeatures,
        currentOrgHeadcount,
        currentOrgHeadcountLimit,
        currentPackageRoleLimits,
    }), [employeeData, historicalEmployeeData, appendEmployeeData, replaceEmployeeDataForOrg, attendanceData, jobPositions, recruitmentFunnels, displayedData, isDataAnonymized, toggleAnonymization, canAnonymize, activeOrganizationId, activeOrganization, allOrganizations, allUsers, currentPackageFeatures, currentOrgHeadcount, currentOrgHeadcountLimit, currentPackageRoleLimits]);
    
    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};