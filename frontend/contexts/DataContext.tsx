import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import type { Employee, AttendanceRecord, JobPosition, RecruitmentFunnel, Organization, User, AppPackage } from '../types';
import type { Skill } from '../services/api/skillsApi';
import type { PerformanceReview } from '../services/api/performanceReviewsApi';
import type { ExitInterview } from '../services/api/exitInterviewsApi';
import type { Report } from '../services/api/reportsApi';
import type { AnalyticsMetric } from '../services/api/analyticsApi';
import type { Department } from '../services/api/departmentsApi';
import type { Salary } from '../services/api/salaryApi';
import type { Account } from '../services/api/accountsApi';
import type { Expense } from '../services/api/expensesApi';
import type { Leave } from '../services/api/leavesApi';
import { useAuth } from './AuthContext';
import { APP_PACKAGES } from '../constants';
import { MOCK_ORGANIZATIONS, MOCK_USERS } from '../constants/data';
import { employeeApi } from '../services/api/employeeApi';
import { attendanceApi } from '../services/api/attendanceApi';
import { jobPositionsApi } from '../services/api/jobPositionsApi';
import { recruitmentFunnelsApi } from '../services/api/recruitmentFunnelsApi';
import { organizationsApi } from '../services/api/organizationsApi';
import { skillsApi } from '../services/api/skillsApi';
import { performanceReviewsApi } from '../services/api/performanceReviewsApi';
import { exitInterviewsApi } from '../services/api/exitInterviewsApi';
import { reportsApi } from '../services/api/reportsApi';
import { analyticsApi } from '../services/api/analyticsApi';
import { departmentsApi } from '../services/api/departmentsApi';
import { salaryApi } from '../services/api/salaryApi';
import { accountsApi } from '../services/api/accountsApi';
import { expensesApi } from '../services/api/expensesApi';
import { leavesApi } from '../services/api/leavesApi';
import { mapBackendEmployeeToFrontend, mapBackendAttendanceToFrontend, mapBackendJobPositionToFrontend, mapBackendRecruitmentFunnelToFrontend, mapBackendOrganizationToFrontend, mapBackendSkillToFrontend, mapBackendPerformanceReviewToFrontend, mapBackendExitInterviewToFrontend, mapBackendReportToFrontend, mapBackendAnalyticsToFrontend, mapBackendDepartmentToFrontend, mapBackendSalaryToFrontend, mapBackendAccountToFrontend, mapBackendExpenseToFrontend, mapBackendLeaveToFrontend } from '../services/api/dataMappers';


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
    skills: Skill[];
    setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
    performanceReviews: PerformanceReview[];
    setPerformanceReviews: React.Dispatch<React.SetStateAction<PerformanceReview[]>>;
    exitInterviews: ExitInterview[];
    setExitInterviews: React.Dispatch<React.SetStateAction<ExitInterview[]>>;
    reports: Report[];
    setReports: React.Dispatch<React.SetStateAction<Report[]>>;
    analytics: AnalyticsMetric[];
    setAnalytics: React.Dispatch<React.SetStateAction<AnalyticsMetric[]>>;
    departments: Department[];
    setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
    salaries: Salary[];
    setSalaries: React.Dispatch<React.SetStateAction<Salary[]>>;
    accounts: Account[];
    setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    leaves: Leave[];
    setLeaves: React.Dispatch<React.SetStateAction<Leave[]>>;
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
    
    const [allEmployeeData, setAllEmployeeData] = useState<Employee[]>([]);
    const [allAttendanceData, setAllAttendanceData] = useState<AttendanceRecord[]>([]);
    const [allJobPositions, setAllJobPositions] = useState<JobPosition[]>([]);
    const [isLoadingJobPositions, setIsLoadingJobPositions] = useState(false);
    const [allRecruitmentFunnels, setAllRecruitmentFunnels] = useState<RecruitmentFunnel[]>([]);
    const [isLoadingRecruitmentFunnels, setIsLoadingRecruitmentFunnels] = useState(false);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [isLoadingSkills, setIsLoadingSkills] = useState(false);
    const [allPerformanceReviews, setAllPerformanceReviews] = useState<PerformanceReview[]>([]);
    const [isLoadingPerformanceReviews, setIsLoadingPerformanceReviews] = useState(false);
    const [allExitInterviews, setAllExitInterviews] = useState<ExitInterview[]>([]);
    const [isLoadingExitInterviews, setIsLoadingExitInterviews] = useState(false);
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);
    const [allAnalytics, setAllAnalytics] = useState<AnalyticsMetric[]>([]);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
    const [allDepartments, setAllDepartments] = useState<Department[]>([]);
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
    const [allSalaries, setAllSalaries] = useState<Salary[]>([]);
    const [isLoadingSalaries, setIsLoadingSalaries] = useState(false);
    const [allAccounts, setAllAccounts] = useState<Account[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
    const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
    const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
    const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);
    const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
    const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
    const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
    
    const [isDataAnonymized, setIsDataAnonymized] = useState(false);
    const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
    
    const canAnonymize = currentUser?.role === 'Super Admin' || currentUser?.role === 'Org Admin';

    // Determine the active organization ID
    const effectiveOrgId = useMemo(() => {
        return currentUser?.role === 'Super Admin' ? activeOrganizationId : currentUser?.organizationId || null;
    }, [currentUser, activeOrganizationId]);

    // Fetch employees from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllEmployeeData([]);
            return;
        }

        setIsLoadingEmployees(true);
        employeeApi.getAll({ limit: 1000 }, effectiveOrgId) // Pass organization ID for Super Admin
            .then((response) => {
                if (response.success && response.data) {
                    const mappedEmployees = response.data.data.map((emp: any) => 
                        mapBackendEmployeeToFrontend(emp, effectiveOrgId)
                    );
                    setAllEmployeeData(mappedEmployees);
                } else {
                    console.error('Failed to fetch employees:', response.error);
                    // Fallback to empty array or mock data for development
                    setAllEmployeeData([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching employees:', error);
                setAllEmployeeData([]);
            })
            .finally(() => {
                setIsLoadingEmployees(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch attendance from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllAttendanceData([]);
            return;
        }

        setIsLoadingAttendance(true);
        attendanceApi.getAll({ limit: 1000 }, effectiveOrgId) // Pass organization ID for Super Admin
            .then((response) => {
                if (response.success && response.data) {
                    const mappedAttendance = response.data.data.map((att: any) => 
                        mapBackendAttendanceToFrontend(att, effectiveOrgId)
                    );
                    setAllAttendanceData(mappedAttendance);
                } else {
                    console.error('Failed to fetch attendance:', response.error);
                    setAllAttendanceData([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching attendance:', error);
                setAllAttendanceData([]);
            })
            .finally(() => {
                setIsLoadingAttendance(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch job positions from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllJobPositions([]);
            return;
        }

        setIsLoadingJobPositions(true);
        jobPositionsApi.getAll({ limit: 1000 }, effectiveOrgId) // Pass organization ID for Super Admin
            .then((response) => {
                if (response.success && response.data) {
                    const mappedPositions = response.data.data.map((pos: any) => 
                        mapBackendJobPositionToFrontend(pos, effectiveOrgId)
                    );
                    setAllJobPositions(mappedPositions);
                } else {
                    console.error('Failed to fetch job positions:', response.error);
                    setAllJobPositions([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching job positions:', error);
                setAllJobPositions([]);
            })
            .finally(() => {
                setIsLoadingJobPositions(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch recruitment funnels from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllRecruitmentFunnels([]);
            return;
        }

        setIsLoadingRecruitmentFunnels(true);
        recruitmentFunnelsApi.getAll({ limit: 1000 }, effectiveOrgId) // Pass organization ID for Super Admin
            .then((response) => {
                if (response.success && response.data) {
                    const mappedFunnels = response.data.data.map((funnel: any) => 
                        mapBackendRecruitmentFunnelToFrontend(funnel, effectiveOrgId)
                    );
                    setAllRecruitmentFunnels(mappedFunnels);
                } else {
                    console.error('Failed to fetch recruitment funnels:', response.error);
                    setAllRecruitmentFunnels([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching recruitment funnels:', error);
                setAllRecruitmentFunnels([]);
            })
            .finally(() => {
                setIsLoadingRecruitmentFunnels(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch organizations from API (only for Super Admin)
    useEffect(() => {
        if (currentUser?.role !== 'Super Admin') {
            // Non-Super Admins don't need to fetch all organizations
            return;
        }

        setIsLoadingOrganizations(true);
        organizationsApi.getAll()
            .then((response) => {
                if (response.success && response.data) {
                    const mappedOrgs = response.data.data.map((org: any) => 
                        mapBackendOrganizationToFrontend(org)
                    );
                    setAllOrganizations(mappedOrgs);
                } else {
                    console.error('Failed to fetch organizations:', response.error);
                    setAllOrganizations([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching organizations:', error);
                setAllOrganizations([]);
            })
            .finally(() => {
                setIsLoadingOrganizations(false);
            });
    }, [currentUser]);

    // Fetch skills from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllSkills([]);
            return;
        }

        setIsLoadingSkills(true);
        skillsApi.getAll({ limit: 1000 }, effectiveOrgId)
            .then((response) => {
                if (response.success && response.data) {
                    const mappedSkills = response.data.data.map((skill: any) => 
                        mapBackendSkillToFrontend(skill, effectiveOrgId)
                    );
                    setAllSkills(mappedSkills);
                } else {
                    console.error('Failed to fetch skills:', response.error);
                    setAllSkills([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching skills:', error);
                setAllSkills([]);
            })
            .finally(() => {
                setIsLoadingSkills(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch performance reviews from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllPerformanceReviews([]);
            return;
        }

        setIsLoadingPerformanceReviews(true);
        performanceReviewsApi.getAll({ limit: 1000 }, effectiveOrgId)
            .then((response) => {
                if (response.success && response.data) {
                    const mappedReviews = response.data.data.map((review: any) => 
                        mapBackendPerformanceReviewToFrontend(review, effectiveOrgId)
                    );
                    setAllPerformanceReviews(mappedReviews);
                } else {
                    console.error('Failed to fetch performance reviews:', response.error);
                    setAllPerformanceReviews([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching performance reviews:', error);
                setAllPerformanceReviews([]);
            })
            .finally(() => {
                setIsLoadingPerformanceReviews(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch exit interviews from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllExitInterviews([]);
            return;
        }

        setIsLoadingExitInterviews(true);
        exitInterviewsApi.getAll({ limit: 1000 }, effectiveOrgId)
            .then((response) => {
                if (response.success && response.data) {
                    const mappedInterviews = response.data.data.map((interview: any) => 
                        mapBackendExitInterviewToFrontend(interview, effectiveOrgId)
                    );
                    setAllExitInterviews(mappedInterviews);
                } else {
                    console.error('Failed to fetch exit interviews:', response.error);
                    setAllExitInterviews([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching exit interviews:', error);
                setAllExitInterviews([]);
            })
            .finally(() => {
                setIsLoadingExitInterviews(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch reports from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllReports([]);
            return;
        }

        setIsLoadingReports(true);
        reportsApi.getAll(undefined, effectiveOrgId)
            .then((response) => {
                if (response.success && response.data) {
                    const mappedReports = Array.isArray(response.data) 
                        ? response.data.map((report: any) => mapBackendReportToFrontend(report))
                        : [];
                    setAllReports(mappedReports);
                } else {
                    console.error('Failed to fetch reports:', response.error);
                    setAllReports([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching reports:', error);
                setAllReports([]);
            })
            .finally(() => {
                setIsLoadingReports(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch analytics from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllAnalytics([]);
            return;
        }

        setIsLoadingAnalytics(true);
        analyticsApi.getMetrics(undefined, undefined, effectiveOrgId)
            .then((response) => {
                if (response.success && response.data) {
                    const mappedAnalytics = Array.isArray(response.data) 
                        ? response.data.map((metric: any) => mapBackendAnalyticsToFrontend(metric))
                        : [];
                    setAllAnalytics(mappedAnalytics);
                } else {
                    console.error('Failed to fetch analytics:', response.error);
                    setAllAnalytics([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching analytics:', error);
                setAllAnalytics([]);
            })
            .finally(() => {
                setIsLoadingAnalytics(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch departments from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllDepartments([]);
            return;
        }

        setIsLoadingDepartments(true);
        departmentsApi.getAll({ limit: 1000 }, effectiveOrgId)
            .then((response) => {
                if (response.success && response.data) {
                    const mappedDepartments = response.data.data.map((dept: any) => 
                        mapBackendDepartmentToFrontend(dept)
                    );
                    setAllDepartments(mappedDepartments);
                } else {
                    console.error('Failed to fetch departments:', response.error);
                    setAllDepartments([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching departments:', error);
                setAllDepartments([]);
            })
            .finally(() => {
                setIsLoadingDepartments(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch salaries from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllSalaries([]);
            return;
        }

        setIsLoadingSalaries(true);
        salaryApi.getAll({ limit: 1000 }, effectiveOrgId)
            .then((response) => {
                if (response.success && response.data) {
                    const mappedSalaries = response.data.data.map((sal: any) => 
                        mapBackendSalaryToFrontend(sal)
                    );
                    setAllSalaries(mappedSalaries);
                } else {
                    console.error('Failed to fetch salaries:', response.error);
                    setAllSalaries([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching salaries:', error);
                setAllSalaries([]);
            })
            .finally(() => {
                setIsLoadingSalaries(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch accounts from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllAccounts([]);
            return;
        }

        setIsLoadingAccounts(true);
        accountsApi.getAll({ limit: 1000 }, effectiveOrgId)
            .then((response) => {
                if (response.success && response.data) {
                    const mappedAccounts = response.data.data.map((acc: any) => 
                        mapBackendAccountToFrontend(acc)
                    );
                    setAllAccounts(mappedAccounts);
                } else {
                    console.error('Failed to fetch accounts:', response.error);
                    setAllAccounts([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching accounts:', error);
                setAllAccounts([]);
            })
            .finally(() => {
                setIsLoadingAccounts(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch expenses from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllExpenses([]);
            return;
        }

        setIsLoadingExpenses(true);
        expensesApi.getAll({ limit: 1000 }, effectiveOrgId)
            .then((response) => {
                if (response.success && response.data) {
                    const mappedExpenses = response.data.data.map((exp: any) => 
                        mapBackendExpenseToFrontend(exp)
                    );
                    setAllExpenses(mappedExpenses);
                } else {
                    console.error('Failed to fetch expenses:', response.error);
                    setAllExpenses([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
                setAllExpenses([]);
            })
            .finally(() => {
                setIsLoadingExpenses(false);
            });
    }, [effectiveOrgId, currentUser]);

    // Fetch leaves from API when organization changes
    useEffect(() => {
        if (!effectiveOrgId || !currentUser) {
            setAllLeaves([]);
            return;
        }

        setIsLoadingLeaves(true);
        leavesApi.getAll({ limit: 1000 }, effectiveOrgId)
            .then((response) => {
                if (response.success && response.data) {
                    const mappedLeaves = response.data.data.map((leave: any) => 
                        mapBackendLeaveToFrontend(leave)
                    );
                    setAllLeaves(mappedLeaves);
                } else {
                    console.error('Failed to fetch leaves:', response.error);
                    setAllLeaves([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching leaves:', error);
                setAllLeaves([]);
            })
            .finally(() => {
                setIsLoadingLeaves(false);
            });
    }, [effectiveOrgId, currentUser]);

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

    const appendEmployeeData = useCallback(async (newData: Employee[]) => {
        const orgId = currentUser?.role === 'Super Admin' ? activeOrganizationId : currentUser?.organizationId;
        if (!orgId) {
            console.error("Cannot append employee data without an active organization context.");
            return;
        }

        // Map frontend employees to backend format and create via API
        const { mapFrontendEmployeeToBackend } = await import('../services/api/dataMappers');
        const backendEmployees = newData.map(mapFrontendEmployeeToBackend);

        try {
            const response = await employeeApi.bulkCreate(backendEmployees);
            if (response.success) {
                // Refresh employee data from API
                const fetchResponse = await employeeApi.getAll({ limit: 1000 });
                if (fetchResponse.success && fetchResponse.data) {
                    const mappedEmployees = fetchResponse.data.data.map((emp: any) => 
                        mapBackendEmployeeToFrontend(emp, orgId)
                    );
                    setAllEmployeeData(mappedEmployees);
                }
            } else {
                console.error('Failed to create employees:', response.error);
            }
        } catch (error) {
            console.error('Error creating employees:', error);
        }
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


    const { employeeData, historicalEmployeeData, attendanceData, jobPositions, recruitmentFunnels, skills, performanceReviews, exitInterviews, reports, analytics, departments, salaries, accounts, expenses, leaves, currentPackageFeatures, currentOrgHeadcount, currentOrgHeadcountLimit, currentPackageRoleLimits, activeOrganization } = useMemo(() => {
        const orgId = currentUser?.role === 'Super Admin' ? activeOrganizationId : currentUser?.organizationId;

        const organization = allOrganizations.find(o => o.id === orgId);

        if (!orgId || !organization) {
            return { 
                employeeData: [], historicalEmployeeData: [], attendanceData: [], jobPositions: [], 
                recruitmentFunnels: [], skills: [], performanceReviews: [], exitInterviews: [], 
                reports: [], analytics: [], departments: [], salaries: [], accounts: [], expenses: [], leaves: [],
                currentPackageFeatures: null, currentOrgHeadcount: 0, 
                currentOrgHeadcountLimit: 0, currentPackageRoleLimits: null, activeOrganization: null 
            };
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
            skills: allSkills.filter(s => s.employeeId && currentSnapshot.some(e => e.id === s.employeeId)),
            performanceReviews: allPerformanceReviews.filter(p => p.organizationId === orgId),
            exitInterviews: allExitInterviews.filter(e => e.organizationId === orgId),
            reports: allReports,
            analytics: allAnalytics,
            departments: allDepartments,
            salaries: allSalaries,
            accounts: allAccounts,
            expenses: allExpenses,
            leaves: allLeaves,
            currentPackageFeatures: packageInfo.features,
            currentOrgHeadcount: currentSnapshot.length,
            currentOrgHeadcountLimit: packageInfo.headcountLimit,
            currentPackageRoleLimits: packageInfo.roleLimits || null,
            activeOrganization: organization,
        };
    }, [currentUser, activeOrganizationId, allEmployeeData, allAttendanceData, allJobPositions, allRecruitmentFunnels, allSkills, allPerformanceReviews, allExitInterviews, allReports, allAnalytics, allDepartments, allSalaries, allAccounts, allExpenses, allLeaves, allOrganizations]);
    
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
        skills,
        setSkills: setAllSkills,
        performanceReviews,
        setPerformanceReviews: setAllPerformanceReviews,
        exitInterviews,
        setExitInterviews: setAllExitInterviews,
        reports,
        setReports: setAllReports,
        analytics,
        setAnalytics: setAllAnalytics,
        departments,
        setDepartments: setAllDepartments,
        salaries,
        setSalaries: setAllSalaries,
        accounts,
        setAccounts: setAllAccounts,
        expenses,
        setExpenses: setAllExpenses,
        leaves,
        setLeaves: setAllLeaves,
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
    }), [employeeData, historicalEmployeeData, appendEmployeeData, replaceEmployeeDataForOrg, attendanceData, jobPositions, recruitmentFunnels, skills, performanceReviews, exitInterviews, reports, analytics, departments, salaries, accounts, expenses, leaves, displayedData, isDataAnonymized, toggleAnonymization, canAnonymize, activeOrganizationId, activeOrganization, allOrganizations, allUsers, currentPackageFeatures, currentOrgHeadcount, currentOrgHeadcountLimit, currentPackageRoleLimits]);
    
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