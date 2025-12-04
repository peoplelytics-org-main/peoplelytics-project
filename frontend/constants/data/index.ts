import type { Employee, AttendanceRecord, JobPosition, RecruitmentFunnel, ExitInterviewAnalysis, Skill, SkillLevel, Organization, User, PackageName, AppPackage } from '../../types';

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const today = new Date();
const sixMonthsFromNow = new Date(); sixMonthsFromNow.setMonth(today.getMonth() + 6);
const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(today.getMonth() - 6);
const fiveDaysFromNow = new Date(); fiveDaysFromNow.setDate(today.getDate() + 5);
const almostSixMonthsAgo = new Date(); almostSixMonthsAgo.setMonth(today.getMonth() - 6); almostSixMonthsAgo.setDate(today.getDate() + 6);
const oneMonthAgo = new Date(); oneMonthAgo.setMonth(today.getMonth() - 1);
const sevenMonthsAgo = new Date(); sevenMonthsAgo.setMonth(today.getMonth() - 7);

export const MOCK_ORGANIZATIONS: Organization[] = [
    { id: 'org_1', name: 'Innovate Inc.', subscriptionStartDate: formatDate(sixMonthsAgo), subscriptionEndDate: formatDate(sixMonthsFromNow), status: 'Active', package: 'Pro', employeeCount: 712 },
    { id: 'org_2', name: 'Synergy Solutions', subscriptionStartDate: formatDate(almostSixMonthsAgo), subscriptionEndDate: formatDate(fiveDaysFromNow), status: 'Active', package: 'Intermediate', employeeCount: 285 },
    { id: 'org_3', name: 'Legacy Corp', subscriptionStartDate: formatDate(sevenMonthsAgo), subscriptionEndDate: formatDate(oneMonthAgo), status: 'Inactive', package: 'Basic', employeeCount: 50 },
];

export const MOCK_USERS: User[] = [
    { id: 'user_sa', username: 'superadmin@peoplelytics.com', password: 'password123', role: 'Super Admin' },
    { id: 'user_oa1', username: 'amnakhan@innovateinc.com', password: 'password123', role: 'Org Admin', organizationId: 'org_1', organizationName: 'Innovate Inc.' },
    { id: 'user_hr1', username: 'bilalbutt@innovateinc.com', password: 'password123', role: 'HR Analyst', organizationId: 'org_1', organizationName: 'Innovate Inc.' },
    { id: 'user_ex1', username: 'aliakbar@innovateinc.com', password: 'password123', role: 'Executive', organizationId: 'org_1', organizationName: 'Innovate Inc.' },
    { id: 'user_oa2', username: 'fatimashah@synergysolutions.com', password: 'password123', role: 'Org Admin', organizationId: 'org_2', organizationName: 'Synergy Solutions' },
    { id: 'user_hr2', username: 'hassaniqbal@synergysolutions.com', password: 'password123', role: 'HR Analyst', organizationId: 'org_2', organizationName: 'Synergy Solutions' },
    { id: 'user_ex2', username: 'zainabmirza@synergysolutions.com', password: 'password123', role: 'Executive', organizationId: 'org_2', organizationName: 'Synergy Solutions' },
    { id: 'user_oa3', username: 'davidchen@legacycorp.com', password: 'password123', role: 'Org Admin', organizationId: 'org_3', organizationName: 'Legacy Corp' },
];

const firstNamesMale = ["Ahmad", "Ali", "Hassan", "Bilal", "Fahad", "Imran", "Jamal", "Kamran", "Mohsin", "Nadeem", "Omar", "Saad", "Tariq", "Usman", "Waqas", "Zahid", "Zain", "Abid", "Arif", "Asif", "Danish", "Ehsan", "Farhan", "Ghulam", "Haris", "Irfan", "Javed", "Kashif", "Luqman", "Majid", "Nasir", "Qasim", "Rashid", "Sajid", "Tahir", "Umar", "Wahid", "Yasir", "Zubair", "Adil"];
const firstNamesFemale = ["Aisha", "Fatima", "Hina", "Kiran", "Madiha", "Nadia", "Rabia", "Saba", "Sadia", "Tahira", "Uzma", "Zainab", "Alina", "Beenish", "Fariha", "Gul", "Hira", "Iqra", "Javeria", "Laila", "Maha", "Nida", "Quratulain", "Rida", "Sana", "Tehmina", "Unzila", "Wajiha", "Yasmin", "Zoya", "Amna"];
const lastNames = ["Khan", "Malik", "Hussain", "Cheema", "Shah", "Iqbal", "Butt", "Raja", "Mirza", "Sheikh", "Chaudhry", "Abbasi", "Gondal", "Mughal", "Qureshi", "Siddiqui", "Tiwana", "Wattoo", "Bhatti", "Jadoon", "Durrani", "Zardari", "Leghari", "Jamali", "Bhutto", "Sharif", "Bajwa", "Mehmood", "Akbar"];
const locations = ["Karachi", "Lahore", "Islamabad", "Remote", "Peshawar", "Quetta", "Lahore"]; // Faisalabad removed and replaced with an extra Lahore to shift headcount
const departmentsAndRoles = {
    "Executive": ["Chief Executive Officer", "Chief Financial Officer", "Chief Operating Officer", "Chief People Officer", "Chief Technology Officer", "Chief Information Security Officer"],
    "Engineering": ["VP of Engineering", "Engineering Director", "Engineering Manager", "Principal Engineer", "Staff Software Engineer", "Senior Software Engineer", "Software Engineer", "Senior QA Engineer", "QA Engineer", "Senior DevOps Engineer", "DevOps Engineer"],
    "Product": ["VP of Product", "Director of Product", "Product Manager", "Senior Product Manager", "UI/UX Lead", "Senior UI/UX Designer", "UI/UX Designer"],
    "Data & Analytics": ["VP of Data", "Director of Data Science", "Data Science Manager", "Lead Data Scientist", "Senior Data Scientist", "Data Analyst", "Machine Learning Engineer"],
    "Sales": ["VP of Sales", "Sales Director", "Sales Manager", "Account Executive", "Sales Development Rep"],
    "Marketing": ["VP of Marketing", "Marketing Director", "Marketing Manager", "Content Strategist", "Digital Marketing Specialist"],
    "Customer Success": ["VP of Customer Success", "Director of Customer Success", "Customer Success Manager", "Technical Support Lead", "Technical Support Engineer"],
    "People & Culture": ["HR Director", "HR Manager", "HR Business Partner", "Talent Acquisition Lead", "Recruiter"],
    "Finance": ["Finance Director", "Finance Manager", "Senior Financial Analyst", "Financial Analyst", "Accountant"],
    "IT Operations": ["IT Director", "IT Manager", "System Administrator", "Network Engineer", "IT Support Specialist"],
};

const skillLevels: SkillLevel[] = ['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'];

const commonSkills = [
    'Strategy', 'Leadership', 'Finance', 'Communication', 'Teamwork', 'Project Management', 'Data Analysis',
    'JavaScript', 'React', 'Python', 'SQL', 'Machine Learning', 'Cloud Computing', 'UI/UX Design', 'Product Roadmapping',
    'Sales Negotiation', 'Content Creation', 'Digital Marketing', 'Customer Relationship Management',
    'Talent Acquisition', 'Employee Relations', 'Financial Modeling', 'System Administration'
];
// Niche skills are not randomly assigned, but manually injected to test the At-Risk feature.
const nicheSkills = ['Kubernetes', 'Cybersecurity Forensics', 'Solidity', 'Quantitative Analysis'];
const allSkills = [...commonSkills, ...nicheSkills];

const generateRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
function pickRandom<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

const generateRandomSkills = (count: number): Skill[] => {
    // Only assign common skills randomly to ensure niche skills remain rare for testing.
    const shuffled = commonSkills.sort(() => 0.5 - Math.random());
    const selectedSkills = shuffled.slice(0, count);
    return selectedSkills.map(skillName => ({
        name: skillName,
        level: pickRandom(skillLevels),
    }));
};

export const generateEmployeeData = (count: number, organizationId: string): Employee[] => {
    const employees: Employee[] = [];
    const managerMap: Record<string, string[]> = {};
    const employeeMap = new Map<string, Employee>();
    
    const baseSnapshotDate = new Date();
    baseSnapshotDate.setMonth(baseSnapshotDate.getMonth() - 1);
    const snapshotDate = baseSnapshotDate.toISOString().split('T')[0];

    // FIX: Calculate special employee counts first to ensure the total count is accurate.
    if (count <= 0) {
        return [];
    }
    const probationCount = Math.max(0, Math.floor(count * 0.03));
    const resignedCount = Math.max(0, Math.floor(count * 0.015));
    const baseEmployeeCount = Math.max(0, count - probationCount - resignedCount);

    // Create hierarchy
    // Level 0: CEO
    // FIX: Check if we have budget for a CEO
    if (baseEmployeeCount >= 1) {
        employees.push({
            id: `1-${organizationId}`, name: 'Ali Akbar', department: 'Executive', jobTitle: 'Chief Executive Officer', location: 'Karachi', hireDate: '2012-03-01', salary: 450000, gender: 'Male', performanceRating: 5, potentialRating: 3, engagementScore: 98, skills: [{ name: 'Strategy', level: 'Expert' }, { name: 'Leadership', level: 'Expert' }, { name: 'Finance', level: 'Proficient' }], managerId: undefined, trainingCompleted: 8, trainingTotal: 8, successionStatus: 'Not Assessed', weeklyHours: 58, bonus: 200000, managementSatisfaction: 100, compensationSatisfaction: 95, benefitsSatisfaction: 98, trainingSatisfaction: 92, organizationId, snapshotDate
        });
        employeeMap.set(`1-${organizationId}`, employees[0]);
    }

    // Level 1: C-Suite / VPs reporting to CEO
    const level1Titles = [
        "Chief Financial Officer", "Chief Operating Officer", "Chief People Officer", "Chief Technology Officer", "Chief Information Security Officer",
        "VP of Engineering", "VP of Product", "VP of Data", "VP of Sales", "VP of Marketing", "VP of Customer Success"
    ];
    // FIX: Only create as many VPs as there is space for in the base count.
    const level1Count = Math.min(level1Titles.length, baseEmployeeCount - employees.length);
    for (let i = 0; i < level1Count; i++) {
        const id = `${i + 2}-${organizationId}`;
        const gender = pickRandom(['Male', 'Female'] as const);
        const name = `${gender === 'Male' ? pickRandom(firstNamesMale) : pickRandom(firstNamesFemale)} ${pickRandom(lastNames)}`;
        const dept = Object.keys(departmentsAndRoles).find(key => departmentsAndRoles[key as keyof typeof departmentsAndRoles].includes(level1Titles[i])) || 'Executive';
        const emp: Employee = {
            id, name, department: dept, jobTitle: level1Titles[i], location: pickRandom(locations), hireDate: generateRandomDate(new Date('2013-01-01'), new Date('2018-01-01')), salary: generateRandomInt(280000, 380000), gender, performanceRating: generateRandomInt(4, 5), potentialRating: 3, engagementScore: generateRandomInt(85, 98), skills: [{ name: 'Leadership', level: 'Expert' }, { name: 'Strategy', level: 'Proficient' }], managerId: `1-${organizationId}`, trainingCompleted: 8, trainingTotal: 8, successionStatus: 'Ready Now', weeklyHours: generateRandomInt(48, 55), bonus: generateRandomInt(80000, 150000), managementSatisfaction: generateRandomInt(90, 100), compensationSatisfaction: generateRandomInt(85, 95), benefitsSatisfaction: generateRandomInt(88, 96), trainingSatisfaction: generateRandomInt(85, 95), organizationId, snapshotDate
        };
        employees.push(emp);
        employeeMap.set(id, emp);
    }

    // Populate managerMap
    employees.forEach(e => {
        if (!managerMap[e.department]) managerMap[e.department] = [];
        if (e.jobTitle.includes('Chief') || e.jobTitle.includes('VP') || e.jobTitle.includes('Director') || e.jobTitle.includes('Manager')) {
            managerMap[e.department].push(e.id);
        }
    });

    // Generate remaining employees
    // FIX: Loop up to the calculated baseEmployeeCount.
    for (let i = employees.length; i < baseEmployeeCount; i++) {
        const id = `${i + 1}-${organizationId}`;
        const gender = Math.random() > 0.4 ? 'Male' : 'Female';
        const name = `${gender === 'Male' ? pickRandom(firstNamesMale) : pickRandom(firstNamesFemale)} ${pickRandom(lastNames)}`;
        const department = pickRandom(Object.keys(departmentsAndRoles).filter(d => d !== 'Executive') as (keyof typeof departmentsAndRoles)[]);
        const managersInDept = managerMap[department] || [];
        const managerId = managersInDept.length > 0 ? pickRandom(managersInDept) : (employees.find(e => e.department === department && e.jobTitle.includes('VP'))?.id || `1-${organizationId}`);
        const manager = employeeMap.get(managerId!);
        
        let roles = departmentsAndRoles[department];
        if(manager?.jobTitle.includes('Director')) roles = roles.filter(r => r.includes('Manager') || !r.includes('Director'));
        if(manager?.jobTitle.includes('Manager')) roles = roles.filter(r => !r.includes('VP') && !r.includes('Director') && !r.includes('Manager'));
        let jobTitle = pickRandom(roles);

        let salary, perf, potential, engagement, hireDate, weeklyHours, bonus, csat, bsat, msat, tsat;
        
        if(jobTitle.includes('Director')) {
            salary = generateRandomInt(180000, 250000); perf = generateRandomInt(3, 5); potential = generateRandomInt(2, 3); engagement = generateRandomInt(80, 95); hireDate = generateRandomDate(new Date('2015-01-01'), new Date('2020-01-01')); weeklyHours = generateRandomInt(45, 52); bonus = generateRandomInt(30000, 60000); csat = generateRandomInt(80, 95); bsat = generateRandomInt(80, 92); msat = generateRandomInt(85, 98); tsat = generateRandomInt(82, 94);
        } else if (jobTitle.includes('Manager')) {
            salary = generateRandomInt(120000, 180000); perf = generateRandomInt(3, 5); potential = generateRandomInt(2, 3); engagement = generateRandomInt(75, 95); hireDate = generateRandomDate(new Date('2018-01-01'), new Date('2021-01-01')); weeklyHours = generateRandomInt(42, 50); bonus = generateRandomInt(15000, 35000); csat = generateRandomInt(75, 92); bsat = generateRandomInt(75, 90); msat = generateRandomInt(80, 95); tsat = generateRandomInt(80, 92);
        } else { // IC
            salary = generateRandomInt(75000, 140000); perf = generateRandomInt(1, 5); potential = generateRandomInt(1, 3); engagement = generateRandomInt(50, 98); hireDate = generateRandomDate(new Date('2020-01-01'), new Date('2023-12-31')); weeklyHours = generateRandomInt(38, 48); bonus = generateRandomInt(5000, 15000); csat = generateRandomInt(60, 90); bsat = generateRandomInt(65, 88); msat = generateRandomInt(65, 95); tsat = generateRandomInt(68, 90);
        }
        
        const emp: Employee = {
            id, name, department, jobTitle, location: pickRandom(locations), hireDate, salary, gender, performanceRating: perf, potentialRating: potential, engagementScore: engagement, skills: generateRandomSkills(generateRandomInt(2, 5)), managerId, trainingCompleted: generateRandomInt(0, 8), trainingTotal: 8, successionStatus: pickRandom(['Ready Now', 'Ready in 1-2 Years', 'Future Potential', 'Not Assessed'] as const), weeklyHours, bonus, managementSatisfaction: msat, compensationSatisfaction: csat, benefitsSatisfaction: bsat, trainingSatisfaction: tsat, organizationId, snapshotDate
        };
        employees.push(emp);
        employeeMap.set(id, emp);
        if (jobTitle.includes('Director') || jobTitle.includes('Manager')) {
            if (!managerMap[department]) managerMap[department] = [];
            managerMap[department].push(id);
        }
    }
    
    // Add employees on probation (hired within last 90 days)
    for (let i = 0; i < probationCount; i++) {
        const id = `${employees.length + 1}-${organizationId}`;
        const gender = Math.random() > 0.4 ? 'Male' : 'Female';
        const name = `${gender === 'Male' ? pickRandom(firstNamesMale) : pickRandom(firstNamesFemale)} ${pickRandom(lastNames)}`;
        const department = pickRandom(Object.keys(departmentsAndRoles).filter(d => d !== 'Executive') as (keyof typeof departmentsAndRoles)[]);
        const managersInDept = managerMap[department] || [];
        const managerId = managersInDept.length > 0 ? pickRandom(managersInDept) : (employees.find(e => e.department === department && e.jobTitle.includes('VP'))?.id || `1-${organizationId}`);
        let roles = departmentsAndRoles[department].filter(r => !r.includes('VP') && !r.includes('Director') && !r.includes('Manager') && !r.includes('Lead') && !r.includes('Principal'));
        if (roles.length === 0) roles = departmentsAndRoles[department]; // fallback
        let jobTitle = pickRandom(roles);

        const hireDate = generateRandomDate(new Date(new Date().setDate(new Date().getDate() - 89)), new Date());
        
        const emp: Employee = {
            id, name, department, jobTitle, location: pickRandom(locations), hireDate, 
            salary: generateRandomInt(75000, 110000), 
            gender, 
            performanceRating: generateRandomInt(2, 4), // New hires might be ramping up
            potentialRating: generateRandomInt(1, 3), 
            engagementScore: generateRandomInt(70, 95), // Usually high at start
            skills: generateRandomSkills(generateRandomInt(1, 3)), 
            managerId, 
            trainingCompleted: generateRandomInt(0, 2), 
            trainingTotal: 8, 
            successionStatus: 'Not Assessed',
            weeklyHours: generateRandomInt(38, 45), 
            bonus: generateRandomInt(2000, 8000), 
            managementSatisfaction: generateRandomInt(75, 95), 
            compensationSatisfaction: generateRandomInt(70, 90), 
            benefitsSatisfaction: generateRandomInt(75, 92), 
            trainingSatisfaction: generateRandomInt(80, 95),
            organizationId, snapshotDate
        };
        employees.push(emp);
        employeeMap.set(id, emp);
    }

    // Add employees who have resigned and are serving notice (termination date in future)
    for (let i = 0; i < resignedCount; i++) {
        const id = `${employees.length + 1}-${organizationId}`;
        const gender = Math.random() > 0.4 ? 'Male' : 'Female';
        const name = `${gender === 'Male' ? pickRandom(firstNamesMale) : pickRandom(firstNamesFemale)} ${pickRandom(lastNames)}`;
        const department = pickRandom(Object.keys(departmentsAndRoles).filter(d => d !== 'Executive') as (keyof typeof departmentsAndRoles)[]);
        const managersInDept = managerMap[department] || [];
        const managerId = managersInDept.length > 0 ? pickRandom(managersInDept) : (employees.find(e => e.department === department && e.jobTitle.includes('VP'))?.id || `1-${organizationId}`);
        let roles = departmentsAndRoles[department].filter(r => !r.includes('VP') && !r.includes('Director'));
        if (roles.length === 0) roles = departmentsAndRoles[department]; // fallback
        let jobTitle = pickRandom(roles);

        const hireDate = generateRandomDate(new Date('2021-01-01'), new Date('2023-06-01'));
        const terminationDate = generateRandomDate(new Date(new Date().setDate(new Date().getDate() + 15)), new Date(new Date().setDate(new Date().getDate() + 45)));

        const emp: Employee = {
            id, name, department, jobTitle, location: pickRandom(locations), hireDate, terminationDate, terminationReason: 'Voluntary',
            salary: generateRandomInt(85000, 150000), 
            gender, 
            performanceRating: generateRandomInt(3, 5), // Often good performers leave
            potentialRating: generateRandomInt(2, 3), 
            engagementScore: generateRandomInt(50, 75), // Lower engagement is a reason to leave
            skills: generateRandomSkills(generateRandomInt(3, 6)), 
            managerId, 
            trainingCompleted: generateRandomInt(5, 8), 
            trainingTotal: 8, 
            successionStatus: pickRandom(['Ready in 1-2 Years', 'Future Potential'] as const),
            weeklyHours: generateRandomInt(40, 50), 
            bonus: generateRandomInt(8000, 20000), 
            managementSatisfaction: generateRandomInt(60, 85), 
            compensationSatisfaction: generateRandomInt(55, 80), 
            benefitsSatisfaction: generateRandomInt(65, 88), 
            trainingSatisfaction: generateRandomInt(68, 90),
            organizationId, snapshotDate
        };
        employees.push(emp);
        employeeMap.set(id, emp);
    }

    // Add turnover data
    const turnoverCount = Math.floor(count * 0.11); // ~11%
    const nonExecutiveEmployees = employees.filter(e => e.department !== 'Executive');
    for (let i = 0; i < turnoverCount; i++) {
        if (i >= nonExecutiveEmployees.length) break;
        const indexToTerminate = Math.floor(Math.random() * nonExecutiveEmployees.length);
        const employeeToTerminate = nonExecutiveEmployees[indexToTerminate];
        
        if (!employeeToTerminate.terminationDate) {
            employeeToTerminate.terminationDate = generateRandomDate(new Date(employeeToTerminate.hireDate), new Date());
            employeeToTerminate.terminationReason = Math.random() > 0.3 ? 'Voluntary' : 'Involuntary';
            if (employeeToTerminate.terminationReason === 'Involuntary') {
                employeeToTerminate.performanceRating = Math.min(employeeToTerminate.performanceRating, 2);
            }
            employeeToTerminate.engagementScore = Math.min(employeeToTerminate.engagementScore, 70);
            employeeToTerminate.managementSatisfaction = Math.min(employeeToTerminate.managementSatisfaction || 100, 75);
        } else {
             i--; // try again if already terminated
        }
    }

    // Manually assign niche skills to create "at-risk" scenarios for testing.
    const assignableEmployees = employees.filter(e => !e.terminationDate);
    const usedIds = new Set<string>();

    const findAndAssign = (department: string, skill: {name: string, level: SkillLevel}) => {
        const employee = assignableEmployees.find(e => e.department === department && !usedIds.has(e.id));
        if (employee) {
            employee.skills.push(skill);
            usedIds.add(employee.id);
            return true;
        }
        return false;
    };
    
    // Kubernetes: 1 employee in Engineering
    findAndAssign('Engineering', { name: 'Kubernetes', level: 'Expert' });

    // Cybersecurity Forensics: 2 employees
    findAndAssign('IT Operations', { name: 'Cybersecurity Forensics', level: 'Proficient' });
    findAndAssign('Engineering', { name: 'Cybersecurity Forensics', level: 'Expert' });

    // Solidity: 3 employees
    findAndAssign('Engineering', { name: 'Solidity', level: 'Competent' });
    findAndAssign('Engineering', { name: 'Solidity', level: 'Proficient' });
    findAndAssign('Product', { name: 'Solidity', level: 'Beginner' });
    
    // Quantitative Analysis: 2 employees
    findAndAssign('Finance', { name: 'Quantitative Analysis', level: 'Expert' });
    findAndAssign('Data & Analytics', { name: 'Quantitative Analysis', level: 'Expert' });


    return employees;
};

export const generateAttendanceData = (employees: Employee[], recordCount: number): AttendanceRecord[] => {
    const attendance: AttendanceRecord[] = [];
    const activeEmployees = employees.filter(e => !e.terminationDate);
    if(activeEmployees.length === 0) return [];

    const statuses: readonly AttendanceRecord['status'][] = ['Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Unscheduled Absence', 'Sick Leave', 'PTO'];

    for (let i = 0; i < recordCount; i++) {
        const employee = pickRandom(activeEmployees);
        attendance.push({
            employeeId: employee.id,
            date: generateRandomDate(new Date('2024-01-01'), new Date()),
            status: pickRandom(statuses),
            organizationId: employee.organizationId
        });
    }
    return attendance;
};

export const generateJobPositions = (organizationId: string): JobPosition[] => [
  { id: `POS001-${organizationId}`, title: 'Senior Software Engineer', department: 'Engineering', status: 'Open', openDate: '2024-06-15', positionType: 'New', budgetStatus: 'Budgeted', organizationId },
  { id: `POS002-${organizationId}`, title: 'Account Executive', department: 'Sales', status: 'Open', openDate: '2024-05-20', positionType: 'Replacement', organizationId },
  { id: `POS003-${organizationId}`, title: 'Recruiter', department: 'People & Culture', status: 'Closed', openDate: '2024-04-01', closeDate: '2024-05-15', hiredEmployeeId: `12-${organizationId}`, organizationId },
  { id: `POS004-${organizationId}`, title: 'Senior UI/UX Designer', department: 'Product', status: 'Open', openDate: '2024-07-01', positionType: 'New', budgetStatus: 'Non-Budgeted', organizationId },
  { id: `POS005-${organizationId}`, title: 'Content Strategist', department: 'Marketing', status: 'On Hold', openDate: '2024-03-10', onHoldDate: '2024-06-01', heldBy: 'Noman Ijaz', organizationId },
];

export const generateRecruitmentFunnelData = (organizationId: string): RecruitmentFunnel[] => [
    { positionId: `POS001-${organizationId}`, shortlisted: 50, interviewed: 15, offersExtended: 3, offersAccepted: 1, joined: 0, organizationId },
    { positionId: `POS002-${organizationId}`, shortlisted: 80, interviewed: 25, offersExtended: 4, offersAccepted: 2, joined: 1, organizationId },
    { positionId: `POS003-${organizationId}`, shortlisted: 65, interviewed: 18, offersExtended: 2, offersAccepted: 1, joined: 1, organizationId },
    { positionId: `POS004-${organizationId}`, shortlisted: 40, interviewed: 10, offersExtended: 2, offersAccepted: 0, joined: 0, organizationId },
];


// Dynamically generate mock employee data based on organization packages
const generateAllMockEmployees = (): Employee[] => {
    const allEmployees: Employee[] = [];
    MOCK_ORGANIZATIONS.forEach(org => {
        // Use the employeeCount specified on the organization object, which can be edited by the Super Admin.
        // Fallback to 50 if it's not defined for some reason.
        const employeeCount = org.employeeCount || 50;
        allEmployees.push(...generateEmployeeData(employeeCount, org.id));
    });
    return allEmployees;
};

export const MOCK_EMPLOYEE_DATA: Employee[] = generateAllMockEmployees();

export const MOCK_ATTENDANCE_DATA: AttendanceRecord[] = [
    ...generateAttendanceData(MOCK_EMPLOYEE_DATA.filter(e => e.organizationId === 'org_1'), 500),
    ...generateAttendanceData(MOCK_EMPLOYEE_DATA.filter(e => e.organizationId === 'org_2'), 500),
    ...generateAttendanceData(MOCK_EMPLOYEE_DATA.filter(e => e.organizationId === 'org_3'), 100),
];

export const MOCK_JOB_POSITIONS: JobPosition[] = [
    ...generateJobPositions('org_1'),
    ...generateJobPositions('org_2'),
    ...generateJobPositions('org_3'),
];

export const MOCK_RECRUITMENT_FUNNEL_DATA: RecruitmentFunnel[] = [
    ...generateRecruitmentFunnelData('org_1'),
    ...generateRecruitmentFunnelData('org_2'),
    ...generateRecruitmentFunnelData('org_3'),
];

export const MOCK_EXIT_INTERVIEW_ANALYSES: ExitInterviewAnalysis[] = [
  // 1. Classic compensation issue
  {
    primaryReasonForLeaving: 'Compensation',
    secondaryReasonForLeaving: 'Lack of recognition',
    management: {
      sentiment: 'Negative',
      quote: "My manager never really advocated for me during salary reviews. I felt like my contributions were invisible.",
      summary: "The employee felt undervalued and unsupported by their direct manager, particularly regarding compensation and recognition for their work."
    },
    compensation: {
      sentiment: 'Negative',
      quote: "I received an offer for a 30% increase elsewhere. The benefits package was also significantly better.",
      summary: "The primary driver was a much higher competing offer. The employee felt their salary was not competitive with the market."
    },
    culture: {
      sentiment: 'Neutral',
      quote: "The team is great, and I enjoyed the work. But at the end of the day, I have to look out for my financial future.",
      summary: "The employee had no major issues with the team or work culture but felt the financial incentive from the new role was too significant to ignore."
    }
  },
  // 2. Career Growth
  {
    primaryReasonForLeaving: 'Career Growth',
    secondaryReasonForLeaving: 'Limited learning opportunities',
    management: {
      sentiment: 'Positive',
      quote: "My manager was a great mentor, but the structure of the team didn't allow for a promotion in the foreseeable future.",
      summary: "The employee had a positive relationship with their manager but felt constrained by a flat organizational structure that limited upward mobility."
    },
    compensation: {
      sentiment: 'Neutral',
      quote: "The pay was fair for my current role, but the new position is a step up in title and responsibility, with pay to match.",
      summary: "Compensation was not a primary issue, but the new role offered a significant increase tied to a promotion that wasn't available internally."
    },
    culture: {
      sentiment: 'Positive',
      quote: "I'll miss the people here. It's a very collaborative environment, and I learned a lot from my peers.",
      summary: "The employee enjoyed the company culture and their colleagues, expressing that the decision to leave was difficult and based purely on career trajectory."
    }
  },
  // 3. Work-Life Balance
  {
    primaryReasonForLeaving: 'Work-Life Balance',
    secondaryReasonForLeaving: 'High-pressure environment',
    management: {
      sentiment: 'Neutral',
      quote: "My manager was understanding, but the deadlines were consistently aggressive. It felt like we were always in crunch mode.",
      summary: "While the manager was not personally blamed, the employee felt management was unable to shield the team from constant high-pressure deadlines."
    },
    compensation: {
      sentiment: 'Positive',
      quote: "I was compensated well for my time, I can't complain about that. It just wasn't worth the burnout.",
      summary: "The employee was satisfied with their pay and acknowledged it was competitive, but it was not enough to offset the negative impact of the poor work-life balance."
    },
    culture: {
      sentiment: 'Negative',
      quote: "There's a culture of 'always on' here. Getting emails at 10 PM was normal, and I couldn't sustain that pace.",
      summary: "The company culture was perceived as demanding and did not respect personal time, leading to employee burnout."
    }
  },
  // 4. Management Conflict
  {
    primaryReasonForLeaving: 'Management',
    secondaryReasonForLeaving: 'Micromanagement',
    management: {
      sentiment: 'Negative',
      quote: "I felt like I was constantly being micromanaged and there was no trust. I need more autonomy to do my job effectively.",
      summary: "A direct conflict in working styles with the manager, characterized by a lack of trust and autonomy, was the main reason for leaving."
    },
    compensation: {
      sentiment: 'Neutral',
      quote: "The salary was fine. This wasn't about the money.",
      summary: "The employee stated that compensation was not a factor in their decision to leave."
    },
    culture: {
      sentiment: 'Neutral',
      quote: "My team was great, but my manager's style made it hard to collaborate freely.",
      summary: "The broader team and company culture were acceptable, but the negative experience with the direct manager overshadowed everything else."
    }
  },
  // 5. Company Direction
  {
    primaryReasonForLeaving: 'Company Direction',
    secondaryReasonForLeaving: 'Lack of clear strategy',
    management: {
      sentiment: 'Neutral',
      quote: "Leadership tried their best to communicate the changes, but it felt like the goals were shifting every quarter.",
      summary: "The employee felt that senior leadership was not providing a clear or consistent strategic direction, leading to uncertainty."
    },
    compensation: {
      sentiment: 'Neutral',
      quote: "My pay was adequate for the work I was doing.",
      summary: "Compensation was not a factor in the employee's decision to leave the company."
    },
    culture: {
      sentiment: 'Negative',
      quote: "With the constant pivots, there was a lot of anxiety and confusion on the team. Morale was pretty low.",
      summary: "The lack of a stable company strategy negatively impacted team morale and created a culture of uncertainty and stress."
    }
  },
  // 6. Lack of Flexibility / Remote Work
  {
    primaryReasonForLeaving: 'Lack of Remote Work',
    secondaryReasonForLeaving: 'Commute time',
    management: {
      sentiment: 'Neutral',
      quote: "My manager was bound by the company's return-to-office policy, so there was nothing they could do.",
      summary: "The manager was not seen as the issue, but rather the enforcer of an unpopular company-wide policy."
    },
    compensation: {
      sentiment: 'Neutral',
      quote: "The pay was competitive, but not enough to justify the long commute every day.",
      summary: "Salary was not the issue, but it did not outweigh the personal and financial costs of a daily commute."
    },
    culture: {
      sentiment: 'Negative',
      quote: "The company talks about trusting employees, but the strict RTO policy felt like a step backward. It showed a lack of trust.",
      summary: "The employee felt the mandatory return-to-office policy was misaligned with a culture of trust and flexibility, making them feel undervalued."
    }
  },
  // 7. Another Compensation one
  {
    primaryReasonForLeaving: 'Compensation',
    secondaryReasonForLeaving: 'Better benefits',
    management: {
      sentiment: 'Positive',
      quote: "I have a fantastic manager, which made this decision really hard. They were very supportive.",
      summary: "The employee had a very positive view of their manager and expressed that they were a key reason for staying as long as they did."
    },
    compensation: {
      sentiment: 'Negative',
      quote: "The new company's 401k match and health insurance plan were just in a different league. It's a huge financial difference for my family.",
      summary: "While the base salary was only slightly higher, the superior benefits package at the new company was the deciding factor."
    },
    culture: {
      sentiment: 'Positive',
      quote: "I genuinely love the team and the mission. I hope the company re-evaluates its benefits to retain other great people.",
      summary: "The employee was positive about the culture and their team, but felt the benefits package was a significant weakness for the company."
    }
  },
  // 8. Another Career Growth
  {
    primaryReasonForLeaving: 'Career Growth',
    secondaryReasonForLeaving: 'Desire for new challenges',
    management: {
      sentiment: 'Neutral',
      quote: "My manager was fine, but we didn't really have structured career pathing discussions.",
      summary: "The employee felt there was a lack of proactive career development and planning from their management."
    },
    compensation: {
      sentiment: 'Neutral',
      quote: "This wasn't about money. The pay was fair.",
      summary: "Compensation was not a factor in the employee's decision."
    },
    culture: {
      sentiment: 'Neutral',
      quote: "The work became very repetitive. I'm looking for an environment where I can tackle new kinds of problems.",
      summary: "The employee felt their role had become stagnant and was seeking a more dynamic and challenging work environment."
    }
  },
  // 9. Another Work-Life Balance (Burnout)
  {
    primaryReasonForLeaving: 'Work-Life Balance',
    secondaryReasonForLeaving: 'Excessive workload',
    management: {
      sentiment: 'Negative',
      quote: "My manager just kept piling on projects without any regard for my existing workload. Requests for help or reprioritization were ignored.",
      summary: "The employee felt their manager was directly responsible for their burnout due to poor project management and a lack of support."
    },
    compensation: {
      sentiment: 'Neutral',
      quote: "I was paid overtime, but no amount of money is worth your health.",
      summary: "While compensated for extra hours, the employee felt the workload was unsustainable and detrimental to their well-being."
    },
    culture: {
      sentiment: 'Negative',
      quote: "It seems like burnout is a badge of honor here. Everyone is overworked, and it's just accepted as the norm.",
      summary: "The company culture was perceived as promoting overwork and burnout, making the employee's situation feel systemic rather than isolated."
    }
  },
  // 10. Another Management issue
  {
    primaryReasonForLeaving: 'Management',
    secondaryReasonForLeaving: 'Lack of feedback',
    management: {
      sentiment: 'Negative',
      quote: "I went for months without any meaningful feedback. I had no idea how I was doing or how to improve until the annual review, which was full of surprises.",
      summary: "The manager's lack of regular, constructive feedback left the employee feeling adrift and unsupported in their role."
    },
    compensation: {
      sentiment: 'Neutral',
      quote: "The pay was fine for the role.",
      summary: "Compensation was not a factor in the decision to leave."
    },
    culture: {
      sentiment: 'Positive',
      quote: "I really enjoyed working with my peers. They were the best part of the job.",
      summary: "The employee had strong, positive relationships with their colleagues, which was a stark contrast to their experience with management."
    }
  },
  // 11. Redundant Role / Re-org
  {
    primaryReasonForLeaving: 'Company Direction',
    secondaryReasonForLeaving: 'Role redundancy after re-org',
    management: {
      sentiment: 'Positive',
      quote: "My manager was as transparent as they could be during the re-org. I appreciate their honesty.",
      summary: "The employee had a positive view of their manager's handling of a difficult organizational change."
    },
    compensation: {
      sentiment: 'Neutral',
      quote: "The severance package was fair.",
      summary: "This was likely an involuntary termination disguised as voluntary, but the financial exit was acceptable."
    },
    culture: {
      sentiment: 'Negative',
      quote: "After the re-org, my role lost its strategic importance. It became clear there wasn't a future for me here.",
      summary: "Organizational changes made the employee's role feel obsolete, leading them to seek opportunities elsewhere where they could have more impact."
    }
  }
];
