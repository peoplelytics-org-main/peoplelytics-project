import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import type {
  Employee,
  AttendanceRecord,
  JobPosition,
  RecruitmentFunnel,
  Organization,
  User,
  AppPackage,
} from "../types";
import { EmployeeFeedback, employeeFeedbackApi } from "@/services/api/employeeFeedbackApi";
import type { Skill } from "../services/api/skillsApi";
import type { PerformanceReview } from "../services/api/performanceReviewsApi";
import type { ExitInterview } from "../services/api/exitInterviewsApi";
import type { Report } from "../services/api/reportsApi";
import type { AnalyticsMetric } from "../services/api/analyticsApi";
import type { Department } from "../services/api/departmentsApi";
import type { Salary } from "../services/api/salaryApi";
import type { Account } from "../services/api/accountsApi";
import type { Expense } from "../services/api/expensesApi";
import { usersApi } from "@/services/api/usersApi";
import type { Leave } from "../services/api/leavesApi";
import { useAuth } from "./AuthContext";
import { APP_PACKAGES } from "../constants";
import { employeeApi } from "../services/api/employeeApi";
import { attendanceApi } from "../services/api/attendanceApi";
import { jobPositionsApi } from "../services/api/jobPositionsApi";
import { recruitmentFunnelsApi } from "../services/api/recruitmentFunnelsApi";
import { organizationsApi } from "../services/api/organizationsApi";
import { skillsApi } from "../services/api/skillsApi";
import { performanceReviewsApi } from "../services/api/performanceReviewsApi";
import { exitInterviewsApi } from "../services/api/exitInterviewsApi";
import { reportsApi } from "../services/api/reportsApi";
import { analyticsApi } from "../services/api/analyticsApi";
import { departmentsApi } from "../services/api/departmentsApi";
import { salaryApi } from "../services/api/salaryApi";
import { accountsApi } from "../services/api/accountsApi";
import { expensesApi } from "../services/api/expensesApi";
import { leavesApi } from "../services/api/leavesApi";
import {
  mapBackendEmployeeToFrontend,
  mapBackendAttendanceToFrontend,
  mapBackendJobPositionToFrontend,
  mapBackendRecruitmentFunnelToFrontend,
  mapBackendOrganizationToFrontend,
  mapBackendSkillToFrontend,
  mapBackendPerformanceReviewToFrontend,
  mapBackendExitInterviewToFrontend,
  mapBackendReportToFrontend,
  mapBackendAnalyticsToFrontend,
  mapBackendDepartmentToFrontend,
  mapBackendSalaryToFrontend,
  mapBackendAccountToFrontend,
  mapBackendExpenseToFrontend,
  mapBackendLeaveToFrontend,
} from "../services/api/dataMappers";

interface DataContextType {
  employeeData: Employee[]; // This is the LATEST snapshot for each employee
  historicalEmployeeData: Employee[]; // This is ALL historical data for the org
  appendEmployeeData: (data: Employee[]) => void;
  replaceEmployeeDataForOrg: (orgId: string, data: Employee[]) => void;
  refreshEmployeeData: () => Promise<void>; // Refresh employee data from API
  refreshAttendanceData: () => Promise<void>; // Refresh attendance data from API
  globalHeadcount: number;
  attendanceData: AttendanceRecord[];
  setAttendanceData: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  jobPositions: JobPosition[];
  setJobPositions: React.Dispatch<React.SetStateAction<JobPosition[]>>;
  recruitmentFunnels: RecruitmentFunnel[];
  setRecruitmentFunnels: React.Dispatch<
    React.SetStateAction<RecruitmentFunnel[]>
  >;
  skills: Skill[];
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  performanceReviews: PerformanceReview[];
  setPerformanceReviews: React.Dispatch<
    React.SetStateAction<PerformanceReview[]>
  >;
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
  currentPackageFeatures: AppPackage["features"] | null;
  currentOrgHeadcount: number;
  currentOrgHeadcountLimit: number;
  currentPackageRoleLimits: AppPackage["roleLimits"] | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();

  const [allEmployeeData, setAllEmployeeData] = useState<Employee[]>([]);
  const [allEmployeeFeedback,setAllEmployeeFeedback]=useState<EmployeeFeedback[]>([]);
  const [allAttendanceData, setAllAttendanceData] = useState<
    AttendanceRecord[]
  >([]);
  const [allJobPositions, setAllJobPositions] = useState<JobPosition[]>([]);
  const [globalHeadcount, setGlobalHeadcount] = useState<number>(0);
  const [isLoadingJobPositions, setIsLoadingJobPositions] = useState(false);
  const [allRecruitmentFunnels, setAllRecruitmentFunnels] = useState<
    RecruitmentFunnel[]
  >([]);
  const [isLoadingRecruitmentFunnels, setIsLoadingRecruitmentFunnels] =
    useState(false);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [allPerformanceReviews, setAllPerformanceReviews] = useState<
    PerformanceReview[]
  >([]);
  const [isLoadingPerformanceReviews, setIsLoadingPerformanceReviews] =
    useState(false);
  const [allExitInterviews, setAllExitInterviews] = useState<ExitInterview[]>(
    []
  );
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
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [isDataAnonymized, setIsDataAnonymized] = useState(false);
  const [activeOrganizationId, setActiveOrganizationId] = useState<
    string | null
  >(null);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isLoadingEmployeeFeedback, setIsLoadingEmployeeFeedback] = useState(false);

  const canAnonymize =
    currentUser?.role === "Super Admin" || currentUser?.role === "Org Admin";

  // Determine the active organization ID
  const effectiveOrgId = useMemo(() => {
    return currentUser?.role === "Super Admin"
      ? activeOrganizationId
      : currentUser?.organizationId || null;
  }, [currentUser, activeOrganizationId]);

  useEffect(() => {
    const fetchGlobalEmployees = async () => {
      // Guard clause: Only Super Admin should fetch all global employees
      if (currentUser?.role !== "Super Admin") return;

      // Optional: Re-use your existing loading state or create a new one
      setIsLoadingEmployees(true);

      try {
        // IMPORTANT: Ensure you added 'getGlobalAll' to your frontend employeeApi service
        const response = await employeeApi.getGlobalEmployees();

        if (response.success && Array.isArray(response.data)) {
          // Logic to Filter for LATEST Unique Employees (Deduplicate history)
          const latestEmployeeMap = new Map<string, any>();

          response.data.forEach((record: any) => {
            // Create a unique key using Source Org ID + Employee ID
            const key = `${record._sourceOrgId}-${
              record.employeeId || record.id
            }`;
            const existing = latestEmployeeMap.get(key);

            // Keep only the most recent snapshot
            if (
              !existing ||
              (record.snapshotDate &&
                (!existing.snapshotDate ||
                  new Date(record.snapshotDate) >=
                    new Date(existing.snapshotDate)))
            ) {
              latestEmployeeMap.set(key, record);
            }
          });

          setGlobalHeadcount(latestEmployeeMap.size);
        }
      } catch (error) {
        console.error("Failed to fetch global employees:", error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    if (currentUser) {
      fetchGlobalEmployees();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchGlobalUsers = async () => {
      // Guard clause: Only Super Admin should fetch all global users
      if (currentUser?.role !== "Super Admin") return;

      setIsLoadingUsers(true);
      try {
        const usersData = await usersApi.getAllGlobalUsers();

        // Map backend data to frontend structure if necessary
        const mappedUsers = usersData.map((u: any) => ({
          ...u,
          id: u._id || u.id, // Handle MongoDB _id vs frontend id
          organizationId: u.organizationId || u._sourceOrgId,
        }));

        setAllUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch global users:", error);
        // Optional: Add toast notification here
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (currentUser) {
      fetchGlobalUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!currentUser || !effectiveOrgId) return;

      console.log("1. Starting Fetch for Org:", effectiveOrgId); // Debug
      setIsLoadingEmployees(true);

      try {
        const response = await employeeApi.getAll(
          { limit: 1000 },
          effectiveOrgId
        );

        if (response.success) {
          // CRITICAL: Check if data is nested deeply or directly
          // Option A: response.data.data (Pagination structure)
          // Option B: response.data (Direct array)
          const potentialArray = response.data?.data || response.data;

          console.log("3. Potential Array found:", potentialArray); // Debug

          if (Array.isArray(potentialArray)) {
            const mappedEmployees = potentialArray.map((emp: any) =>
              mapBackendEmployeeToFrontend(emp, effectiveOrgId)
            );
            console.log("4. Mapped Data:", mappedEmployees); // Debug
            setAllEmployeeData(mappedEmployees);
          } else {
            console.warn(
              "⚠️ Data found was not an array. It was:",
              typeof potentialArray
            );
            setAllEmployeeData([]);
          }
        } else {
          console.error("API returned success: false", response);
        }
      } catch (error) {
        console.error("❌ Fetch Error:", error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [effectiveOrgId, currentUser]);


  useEffect(() => {
    const fetchEmployeeFeedback = async () => {
      if (!currentUser || !effectiveOrgId) return;
  
      console.log("📊 Fetching Employee Feedback for Org:", effectiveOrgId);
      setIsLoadingEmployeeFeedback(true); // ✅ Correct loading state
  
      try {
        const response = await employeeFeedbackApi.getAll(
          { limit: 1000 },
          effectiveOrgId
        );
  
        if (response.success) {
          const potentialArray = response.data?.data || response.data;
  
          console.log("📊 Employee Feedback Array found:", potentialArray);
  
          if (Array.isArray(potentialArray)) {
            // ✅ Map feedback data correctly (no mapper needed if structure matches)
            const mappedFeedback = potentialArray.map((feedback: any) => ({
              id: feedback._id || feedback.id,
              employeeId: feedback.employeeId,
              engagementScore: feedback.engagementScore,
              compensationSatisfaction: feedback.compensationSatisfaction,
              benefitsSatisfaction: feedback.benefitsSatisfaction,
              managementSatisfaction: feedback.managementSatisfaction,
              trainingSatisfaction: feedback.trainingSatisfaction,
              organizationId: effectiveOrgId,
              // Add any other fields from your EmployeeFeedback type
            }));
            
            console.log("✅ Mapped Feedback Data:", mappedFeedback);
            setAllEmployeeFeedback(mappedFeedback); // ✅ Set correct state
          } else {
            console.warn(
              "⚠️ Feedback data was not an array. It was:",
              typeof potentialArray
            );
            setAllEmployeeFeedback([]);
          }
        } else {
          console.error("❌ API returned success: false", response);
        }
      } catch (error) {
        console.error("❌ Fetch Error:", error);
      } finally {
        setIsLoadingEmployeeFeedback(false); // ✅ Correct loading state
      }
    };
  
    fetchEmployeeFeedback();
  }, [effectiveOrgId, currentUser]);

  // Fetch attendance from API when organization changes
  useEffect(() => {
    if (!effectiveOrgId || !currentUser) {
      setAllAttendanceData([]);
      return;
    }

    setIsLoadingAttendance(true);
    attendanceApi
      .getAll({ limit: 1000 }, effectiveOrgId) // Pass organization ID for Super Admin
      .then((response) => {
        if (response.success && response.data) {
          const mappedAttendance = response.data.data.map((att: any) =>
            mapBackendAttendanceToFrontend(att, effectiveOrgId)
          );
          setAllAttendanceData(mappedAttendance);
        } else {
          console.error("Failed to fetch attendance:", response.error);
          setAllAttendanceData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching attendance:", error);
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
    jobPositionsApi
      .getAll({ limit: 1000 }, effectiveOrgId) // Pass organization ID for Super Admin
      .then((response) => {
        if (response.success && response.data) {
          const mappedPositions = response.data.data.map((pos: any) =>
            mapBackendJobPositionToFrontend(pos, effectiveOrgId)
          );
          setAllJobPositions(mappedPositions);
        } else {
          console.error("Failed to fetch job positions:", response.error);
          setAllJobPositions([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching job positions:", error);
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
    recruitmentFunnelsApi
      .getAll({ limit: 1000 }, effectiveOrgId) // Pass organization ID for Super Admin
      .then((response) => {
        if (response.success && response.data) {
          const mappedFunnels = response.data.data.map((funnel: any) =>
            mapBackendRecruitmentFunnelToFrontend(funnel, effectiveOrgId)
          );
          setAllRecruitmentFunnels(mappedFunnels);
        } else {
          console.error("Failed to fetch recruitment funnels:", response.error);
          setAllRecruitmentFunnels([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching recruitment funnels:", error);
        setAllRecruitmentFunnels([]);
      })
      .finally(() => {
        setIsLoadingRecruitmentFunnels(false);
      });
  }, [effectiveOrgId, currentUser]);

  // Fetch organizations from API (only for Super Admin)
  useEffect(() => {
    if (currentUser?.role !== "Super Admin") {
      // Non-Super Admins don't need to fetch all organizations
      return;
    }

    setIsLoadingOrganizations(true);
    organizationsApi
      .getAll()
      .then((response) => {
        if (response.success && response.data) {
          const mappedOrgs = response.data.data.map((org: any) =>
            mapBackendOrganizationToFrontend(org)
          );
          setAllOrganizations(mappedOrgs);
        } else {
          console.error("Failed to fetch organizations:", response.error);
          setAllOrganizations([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching organizations:", error);
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
    skillsApi
      .getAll({ limit: 1000 }, effectiveOrgId)
      .then((response) => {
        if (response.success && response.data) {
          const mappedSkills = response.data.data.map((skill: any) =>
            mapBackendSkillToFrontend(skill, effectiveOrgId)
          );
          setAllSkills(mappedSkills);
        } else {
          console.error("Failed to fetch skills:", response.error);
          setAllSkills([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching skills:", error);
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
    performanceReviewsApi
      .getAll({ limit: 1000 }, effectiveOrgId)
      .then((response) => {
        if (response.success && response.data) {
          const mappedReviews = response.data.data.map((review: any) =>
            mapBackendPerformanceReviewToFrontend(review, effectiveOrgId)
          );
          setAllPerformanceReviews(mappedReviews);
        } else {
          console.error("Failed to fetch performance reviews:", response.error);
          setAllPerformanceReviews([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching performance reviews:", error);
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
    exitInterviewsApi
      .getAll({ limit: 1000 }, effectiveOrgId)
      .then((response) => {
        if (response.success && response.data) {
          const mappedInterviews = response.data.data.map((interview: any) =>
            mapBackendExitInterviewToFrontend(interview, effectiveOrgId)
          );
          setAllExitInterviews(mappedInterviews);
        } else {
          console.error("Failed to fetch exit interviews:", response.error);
          setAllExitInterviews([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching exit interviews:", error);
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
    reportsApi
      .getAll(undefined, effectiveOrgId)
      .then((response) => {
        if (response.success && response.data) {
          const mappedReports = Array.isArray(response.data)
            ? response.data.map((report: any) =>
                mapBackendReportToFrontend(report)
              )
            : [];
          setAllReports(mappedReports);
        } else {
          console.error("Failed to fetch reports:", response.error);
          setAllReports([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching reports:", error);
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
    analyticsApi
      .getMetrics(undefined, undefined, effectiveOrgId)
      .then((response) => {
        if (response.success && response.data) {
          const mappedAnalytics = Array.isArray(response.data)
            ? response.data.map((metric: any) =>
                mapBackendAnalyticsToFrontend(metric)
              )
            : [];
          setAllAnalytics(mappedAnalytics);
        } else {
          console.error("Failed to fetch analytics:", response.error);
          setAllAnalytics([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching analytics:", error);
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
    departmentsApi
      .getAll({ limit: 1000 }, effectiveOrgId)
      .then((response) => {
        if (response.success && response.data) {
          const mappedDepartments = response.data.data.map((dept: any) =>
            mapBackendDepartmentToFrontend(dept)
          );
          setAllDepartments(mappedDepartments);
        } else {
          console.error("Failed to fetch departments:", response.error);
          setAllDepartments([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
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
    salaryApi
      .getAll({ limit: 1000 }, effectiveOrgId)
      .then((response) => {
        if (response.success && response.data) {
          const mappedSalaries = response.data.data.map((sal: any) =>
            mapBackendSalaryToFrontend(sal)
          );
          setAllSalaries(mappedSalaries);
        } else {
          console.error("Failed to fetch salaries:", response.error);
          setAllSalaries([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching salaries:", error);
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
    accountsApi
      .getAll({ limit: 1000 }, effectiveOrgId)
      .then((response) => {
        if (response.success && response.data) {
          const mappedAccounts = response.data.data.map((acc: any) =>
            mapBackendAccountToFrontend(acc)
          );
          setAllAccounts(mappedAccounts);
        } else {
          console.error("Failed to fetch accounts:", response.error);
          setAllAccounts([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching accounts:", error);
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
    expensesApi
      .getAll({ limit: 1000 }, effectiveOrgId)
      .then((response) => {
        if (response.success && response.data) {
          const mappedExpenses = response.data.data.map((exp: any) =>
            mapBackendExpenseToFrontend(exp)
          );
          setAllExpenses(mappedExpenses);
        } else {
          console.error("Failed to fetch expenses:", response.error);
          setAllExpenses([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching expenses:", error);
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
    leavesApi
      .getAll({ limit: 1000 }, effectiveOrgId)
      .then((response) => {
        if (response.success && response.data) {
          const mappedLeaves = response.data.data.map((leave: any) =>
            mapBackendLeaveToFrontend(leave)
          );
          setAllLeaves(mappedLeaves);
        } else {
          console.error("Failed to fetch leaves:", response.error);
          setAllLeaves([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching leaves:", error);
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
    const updatedOrgs = allOrganizations.map((org) => {
      const endDate = new Date(org.subscriptionEndDate);
      if (org.status === "Active" && endDate < today) {
        orgsChanged = true;
        return { ...org, status: "Inactive" as "Inactive" };
      }
      return org;
    });

    if (orgsChanged) {
      setAllOrganizations(updatedOrgs);
    }
  }, []);

  const toggleAnonymization = useCallback(() => {
    if (canAnonymize) {
      setIsDataAnonymized((prev) => !prev);
    }
  }, [canAnonymize]);

  const appendEmployeeData = useCallback(
    async (newData: Employee[]) => {
      const orgId =
        currentUser?.role === "Super Admin"
          ? activeOrganizationId
          : currentUser?.organizationId;
      if (!orgId) {
        console.error(
          "Cannot append employee data without an active organization context."
        );
        return;
      }

      // Map frontend employees to backend format and create via API
      const { mapFrontendEmployeeToBackend } = await import(
        "../services/api/dataMappers"
      );
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
          console.error("Failed to create employees:", response.error);
        }
      } catch (error) {
        console.error("Error creating employees:", error);
      }
    },
    [currentUser, activeOrganizationId]
  );

  const replaceEmployeeDataForOrg = useCallback(
    (orgId: string, newData: Employee[]) => {
      const snapshotDate = new Date().toISOString().split("T")[0];
      const newRecordsWithMetadata = newData.map((e) => ({
        ...e,
        organizationId: orgId,
        snapshotDate: snapshotDate,
      }));

      setAllEmployeeData((prevAll) => [
        ...prevAll.filter((e) => e.organizationId !== orgId),
        ...newRecordsWithMetadata,
      ]);
    },
    []
  );

  // Refresh employee data from API
  const refreshEmployeeData = useCallback(async () => {
    if (!currentUser || !effectiveOrgId) {
      console.warn("Cannot refresh: No user or org ID");
      return;
    }

    try {
      setIsLoadingEmployees(true);
      const response = await employeeApi.getAll(
        { limit: 1000 },
        effectiveOrgId
      );

      if (response.success) {
        const potentialArray = response.data?.data || response.data;
        if (Array.isArray(potentialArray)) {
          const mappedEmployees = potentialArray.map((emp: any) =>
            mapBackendEmployeeToFrontend(emp, effectiveOrgId)
          );
          setAllEmployeeData(mappedEmployees);
        } else {
          console.warn("Refresh: Data was not an array");
          setAllEmployeeData([]);
        }
      } else {
        console.error("Refresh failed:", response.error);
      }
    } catch (error) {
      console.error("Error refreshing employee data:", error);
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [currentUser, effectiveOrgId]);

  // Refresh attendance data from API
  const refreshAttendanceData = useCallback(async () => {
    if (!currentUser || !effectiveOrgId) {
      console.warn("Cannot refresh: No user or org ID");
      return;
    }

    try {
      setIsLoadingAttendance(true);
      const response = await attendanceApi.getAll(
        { limit: 1000 },
        effectiveOrgId
      );

      if (response.success && response.data) {
        const mappedAttendance = response.data.data.map((att: any) =>
          mapBackendAttendanceToFrontend(att, effectiveOrgId)
        );
        setAllAttendanceData(mappedAttendance);
      } else {
        console.error("Refresh attendance failed:", response.error);
      }
    } catch (error) {
      console.error("Error refreshing attendance data:", error);
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [currentUser, effectiveOrgId]);

  // Fetch the current user's organization (for non-Super Admins)
  useEffect(() => {
    if (!currentUser) return;

    // If not Super Admin, fetch their own organization
    if (currentUser.role !== "Super Admin" && currentUser.organizationId) {
      organizationsApi
        .getById(currentUser.organizationId)
        .then((response) => {
          if (response.success && response.data) {
            const mappedOrg = mapBackendOrganizationToFrontend(response.data);
            setAllOrganizations([mappedOrg]);
          } else {
            console.error("Failed to fetch user organization:", response.error);
          }
        })
        .catch((error) => {
          console.error("Error fetching user organization:", error);
        });
    }
  }, [currentUser]);
  const {
    employeeData,
    historicalEmployeeData,
    attendanceData,
    jobPositions,
    recruitmentFunnels,
    skills,
    performanceReviews,
    exitInterviews,
    reports,
    analytics,
    departments,
    salaries,
    accounts,
    expenses,
    leaves,
    currentPackageFeatures,
    currentOrgHeadcount,
    currentOrgHeadcountLimit,
    currentPackageRoleLimits,
    activeOrganization,
  } = useMemo(() => {
    const orgId =
      currentUser?.role === "Super Admin"
        ? activeOrganizationId
        : currentUser?.organizationId;

    const organization = allOrganizations.find((o) => o.id === orgId);

    if (!orgId || !organization) {
      return {
        employeeData: [],
        historicalEmployeeData: [],
        attendanceData: [],
        jobPositions: [],
        recruitmentFunnels: [],
        skills: [],
        performanceReviews: [],
        exitInterviews: [],
        reports: [],
        analytics: [],
        departments: [],
        salaries: [],
        accounts: [],
        expenses: [],
        leaves: [],
        currentPackageFeatures: null,
        currentOrgHeadcount: 0,
        currentOrgHeadcountLimit: 0,
        currentPackageRoleLimits: null,
        activeOrganization: null,
      };
    }

    const packageInfo = organization
      ? APP_PACKAGES[organization.package]
      : APP_PACKAGES["Basic"];

    const orgHistoricalData = allEmployeeData.filter(
      (e) => e.organizationId === orgId
    );

    const latestEmployeeRecords = new Map<string, Employee>();
    orgHistoricalData.forEach((record) => {
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

    const salaryMap = new Map<
      string,
      { salary: number; bonus: number; lastRaiseAmount: number }
    >();
    allSalaries.forEach((sal) => {
      // Ensure strict string matching
      const empId = String(sal.employeeId);

      // CHECK: Does your object use 'amount', 'salary', 'baseSalary', or 'value'?
      // Inspect the "Salary Property Check" log above to be sure.
      const amount = sal.amount || sal.salary || sal.value || 0;
      const bonus = sal.bonus || 0;
      const lastRaiseAmount = sal.lastRaiseAmount || 0;

      salaryMap.set(empId, {
        salary: Number(amount),
        bonus: Number(bonus),
        lastRaiseAmount: Number(lastRaiseAmount),
      });
    });

    const validEmployeeIds = new Set(currentSnapshot.map((e) => String(e.id)));
    console.log(
      `🔍 DEBUG: Tracking ${validEmployeeIds.size} visible employees.`
    );

    // 2. Metrics Maps
    const performanceMap = new Map();
    const engagementMap = new Map();
    const trainingCompletedMap = new Map(); // ✅ Separate map
    const trainingTotalMap = new Map(); // ✅ Separate map
    const weeklyHoursMap = new Map();
    const greivanceMap = new Map();
    const compensationSatisfactionMap = new Map();
    const benefitsSatisfactionMap = new Map();
    const managementSatisfactionMap = new Map();
    const trainingSatisfactionMap = new Map();

    // Combine data sources
    const allMetrics = [...allPerformanceReviews, ...allAnalytics];
    console.log(`🔍 DEBUG: Checking ${allMetrics.length} metric records.`);

    allMetrics.forEach((item) => {
      const empId = String(item.employeeId);

      if (validEmployeeIds.has(empId)) {
        // A. Performance
        if ((item as any).performanceRating != null) {
          performanceMap.set(empId, Number((item as any).performanceRating));
        } else if ((item as any).rating != null) {
          performanceMap.set(empId, Number((item as any).rating));
        }

        // B. Training - Use separate maps
        if ((item as any).trainingCompleted != null) {
          trainingCompletedMap.set(
            empId,
            Number((item as any).trainingCompleted)
          ); // ✅
        }

        if ((item as any).trainingTotal != null) {
          trainingTotalMap.set(empId, Number((item as any).trainingTotal)); // ✅
        }
        if ((item as any).weeklyHours != null) {
          weeklyHoursMap.set(empId, Number((item as any).weeklyHours)); // ✅
        }
        if ((item as any).hasGrievance != null) {
          greivanceMap.set(empId, Boolean((item as any).hasGrievance)); // ✅
        }
        // C. Satisfaction scores - ✅ Add all of them
        if ((item as any).compensationSatisfaction != null) {
          compensationSatisfactionMap.set(
            empId,
            Number((item as any).compensationSatisfaction)
          );
        }

        if ((item as any).benefitsSatisfaction != null) {
          benefitsSatisfactionMap.set(
            empId,
            Number((item as any).benefitsSatisfaction)
          );
        }

        if ((item as any).managementSatisfaction != null) {
          managementSatisfactionMap.set(
            empId,
            Number((item as any).managementSatisfaction)
          );
        }

        if ((item as any).trainingSatisfaction != null) {
          trainingSatisfactionMap.set(
            empId,
            Number((item as any).trainingSatisfaction)
          );
        }

        // C. Engagement
        if ((item as any).impactScore != null) {
          const val = Number((item as any).impactScore);
          engagementMap.set(empId, val * 10);

          if (validEmployeeIds.size < 5) {
            console.log(`✅ MATCH: Found ImpactScore ${val} for ${empId}`);
          }
        }
      } else {
        if (allMetrics.length > 0 && Math.random() < 0.01) {
          console.log(`⚠️ SKIP: Metric for ${empId} not in visible list.`);
        }
      }
    });

    const feedbackMap = new Map<string, EmployeeFeedback>();
    allEmployeeFeedback.forEach(feedback => {
      feedbackMap.set(String(feedback.employeeId), feedback);
    });
    
    console.log(`📊 Feedback map has ${feedbackMap.size} entries for ${currentSnapshot.length} employees`);
  

    // Remove the duplicate allAnalytics loop since it's already in allMetrics

    // 3. Merge
    const currentSnapshotWithData = currentSnapshot.map((emp) => {
      const strId = String(emp.id);
      const compData = salaryMap.get(strId) || {
        salary: 0,
        bonus: 0,
        lastRaiseAmount: 0,
      };
      const perf = performanceMap.get(strId) || 0;
      const eng = engagementMap.get(strId) || 0;
      const employeeSkills = allSkills
        .filter((s) => String(s.employeeId) === strId)
        .map((s) => ({
             name: s.skillName,       // Map DB 'skillName' -> UI 'name'
             level: s.skillLevel,     // Map DB 'skillLevel' -> UI 'level'
             // Include other fields if needed, like ID
             id: s.skillLevelId || s._id 
        }));

      const feedback = feedbackMap.get(strId);

      return {
        ...emp,
        salary: compData.salary,
        bonus: compData.bonus,
        lastRaiseAmount: compData.lastRaiseAmount,
        performanceRating: perf,
        engagementScore: feedback?.engagementScore ?? eng,
        trainingCompleted:
          trainingCompletedMap.get(strId) || emp.trainingCompleted || 0, // ✅
        trainingTotal: trainingTotalMap.get(strId) || emp.trainingTotal || 0, // ✅
        skills: employeeSkills,
        weeklyHours: weeklyHoursMap.get(strId) || emp.weeklyHours || 0,
        hasGrievance: greivanceMap.get(strId) || emp.hasGrievance || false,
        compensationSatisfaction:
        feedback?.compensationSatisfaction ??
        compensationSatisfactionMap.get(strId) ??
        emp.compensationSatisfaction ??
        0,
      benefitsSatisfaction:
        feedback?.benefitsSatisfaction ??
        benefitsSatisfactionMap.get(strId) ??
        emp.benefitsSatisfaction ??
        0,
      managementSatisfaction:
        feedback?.managementSatisfaction ??
        managementSatisfactionMap.get(strId) ??
        emp.managementSatisfaction ??
        0,
      trainingSatisfaction:
        feedback?.trainingSatisfaction ??
        trainingSatisfactionMap.get(strId) ??
        emp.trainingSatisfaction ??
        0,
      };
    });

    // 🔍 FINAL OUTPUT CHECK
    if (currentSnapshotWithData.length > 0) {
      const sample = currentSnapshotWithData[0];
      console.log("🏁 FINAL MERGED SAMPLE:", {
        name: sample.name,
        salary: sample.salary,
        perf: sample.performanceRating,
        eng: sample.engagementScore,
      });
    }

    console.log("🔍 PERF DEBUG:", allPerformanceReviews[0]);
    console.log("🔍 ENGAGEMENT DEBUG (Analytics):", allAnalytics[0]);

    return {
      employeeData: currentSnapshotWithData,
      historicalEmployeeData: orgHistoricalData,
      attendanceData: allAttendanceData.filter(
        (a) => a.organizationId === orgId
      ),
      jobPositions: allJobPositions.filter((j) => j.organizationId === orgId),
      recruitmentFunnels: allRecruitmentFunnels.filter(
        (r) => r.organizationId === orgId
      ),
      skills: allSkills.filter(
        (s) =>
          s.employeeId && currentSnapshot.some((e) => e.id === s.employeeId)
      ),
      performanceReviews: allPerformanceReviews.filter(
        (p) => p.organizationId === orgId
      ),
      exitInterviews: allExitInterviews.filter(
        (e) => e.organizationId === orgId
      ),
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
  }, [
    currentUser,
    activeOrganizationId,
    allEmployeeData,
    allEmployeeFeedback,
    allAttendanceData,
    allJobPositions,
    allRecruitmentFunnels,
    allSkills,
    allPerformanceReviews,
    allExitInterviews,
    allReports,
    allAnalytics,
    allDepartments,
    allSalaries,
    allAccounts,
    allExpenses,
    allLeaves,
    allOrganizations,
  ]);

  const displayedData = useMemo(() => {
    if (isDataAnonymized) {
      return employeeData.map((emp) => ({
        ...emp,
        name: `Employee #${emp.id.split("-")[0]}`,
        salary: 0,
      }));
    }
    return employeeData;
  }, [employeeData, isDataAnonymized]);

  const value = useMemo(
    () => ({
      employeeData,
      globalHeadcount,
      historicalEmployeeData,
      appendEmployeeData,
      replaceEmployeeDataForOrg,
      refreshEmployeeData,
      refreshAttendanceData,
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
    }),
    [
      employeeData,
      globalHeadcount,
      historicalEmployeeData,
      appendEmployeeData,
      replaceEmployeeDataForOrg,
      refreshEmployeeData,
      refreshAttendanceData,
      attendanceData,
      jobPositions,
      recruitmentFunnels,
      skills,
      performanceReviews,
      exitInterviews,
      reports,
      analytics,
      departments,
      salaries,
      accounts,
      expenses,
      leaves,
      displayedData,
      isDataAnonymized,
      toggleAnonymization,
      canAnonymize,
      activeOrganizationId,
      activeOrganization,
      allOrganizations,
      allUsers,
      currentPackageFeatures,
      currentOrgHeadcount,
      currentOrgHeadcountLimit,
      currentPackageRoleLimits,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
