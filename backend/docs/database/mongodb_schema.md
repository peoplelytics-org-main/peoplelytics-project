# Peoplelytics MongoDB Schema

This document outlines the MongoDB database structure for the Peoplelytics application, designed for a multi-tenant architecture where each organization has its own database.

## 🏗️ **MongoDB Cluster Structure**

```
Peoplelytics (MongoDB Cluster)
├── peoplelytics_core
│   ├── organizations          # Organization registry & metadata
│   ├── global_admins          # Super admin accounts
│   ├── system_config          # Global system configurations
│   ├── subscription_plans     # Available subscription tiers
│   ├── audit_logs            # System-wide audit trail
│   └── tenant_metadata       # Tenant-specific configurations
├── org_001                   # Organization 1 Database
│   ├── employees            # Employee records
│   ├── skills               # Employee skills
│   ├── attendance           # Attendance records
│   ├── job_positions        # Job positions
│   ├── recruitment_funnels  # Recruitment data
│   ├── exit_interviews      # Exit interview analyses
│   ├── departments          # Department structure
│   ├── performance_reviews  # Performance data
│   ├── reports              # Generated reports
│   └── analytics            # Analytics data
├── org_002                   # Organization 2 Database
│   ├── employees            # Same collections as org_001
│   ├── skills
│   ├── attendance
│   ├── job_positions
│   ├── recruitment_funnels
│   ├── exit_interviews
│   ├── departments
│   ├── performance_reviews
│   ├── reports
│   └── analytics
└── org_XXX                   # Additional organizations
    └── (Same collection structure)
```

## 📊 **Core Database Collections (`peoplelytics_core`)**

### 1. Organizations Collection
```javascript
{
  _id: ObjectId,
  orgId: "org_001",                    // Unique organization identifier
  name: "Acme Corporation",            // Organization name
  subscriptionStartDate: ISODate,      // Subscription start date
  subscriptionEndDate: ISODate,        // Subscription end date
  status: "Active",                    // "Active" | "Inactive"
  package: "Pro",                      // "Basic" | "Intermediate" | "Pro" | "Enterprise"
  employeeCount: 150,                 // Manual override for employee limit
  createdAt: ISODate,
  updatedAt: ISODate,
  settings: {
    timezone: "UTC",
    currency: "USD",
    dateFormat: "MM/DD/YYYY"
  },
  features: {
    hasPredictiveAnalytics: true,
    hasAIAssistant: true,
    hasROIAnalyzer: true,
    hasCustomization: true
  }
}
```

### 2. Global Admins Collection
```javascript
{
  _id: ObjectId,
  username: "superadmin@peoplelytics.com",
  password: "hashed_password",
  role: "Super Admin",
  permissions: ["manage_organizations", "system_config"],
  createdAt: ISODate,
  lastLogin: ISODate,
  isActive: true
}
```

### 3. System Config Collection
```javascript
{
  _id: ObjectId,
  configType: "global",
  features: {
    maintenanceMode: false,
    newSignupsEnabled: true
  },
  limits: {
    maxOrganizations: 1000,
    maxEmployeesPerOrg: 10000
  },
  updatedAt: ISODate
}
```

### 4. Subscription Plans Collection
```javascript
{
  _id: ObjectId,
  planName: "Pro",
  headcountLimit: 750,
  roleLimits: {
    "Org Admin": 1,
    "HR Analyst": 3,
    "Executive": 10
  },
  features: {
    hasPredictiveAnalytics: true,
    hasAIAssistant: true,
    hasROIAnalyzer: true,
    hasCustomization: true
  },
  pricing: {
    monthly: 99.99,
    yearly: 999.99
  }
}
```

## 🏢 **Organization Database Collections (Each `org_XXX` database contains)**

### 1. Employees Collection
```javascript
{
  _id: ObjectId,
  employeeId: "emp_001",              // Unique within organization
  name: "John Doe",
  department: "Engineering",
  jobTitle: "Senior Software Engineer",
  location: "New York",
  hireDate: ISODate,
  terminationDate: null,              // null for active employees
  terminationReason: null,            // "Voluntary" | "Involuntary"
  salary: 120000,
  gender: "Male",                     // "Male" | "Female" | "Other"
  performanceRating: 4,               // 1-5 scale
  potentialRating: 3,                  // 1-3 scale
  engagementScore: 85,                // 1-100 scale
  managerId: "emp_002",               // Reference to another employee
  snapshotDate: ISODate,              // For historical tracking
  compensationSatisfaction: 80,        // 1-100 scale
  benefitsSatisfaction: 75,           // 1-100 scale
  managementSatisfaction: 90,         // 1-100 scale
  trainingSatisfaction: 85,           // 1-100 scale
  bonus: 15000,
  lastRaiseAmount: 5000,
  hasGrievance: false,
  weeklyHours: 40,
  trainingCompleted: 5,
  trainingTotal: 8,
  successionStatus: "Ready in 1-2 Years", // "Ready Now" | "Ready in 1-2 Years" | "Future Potential" | "Not Assessed"
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 2. Skills Collection
```javascript
{
  _id: ObjectId,
  employeeId: "emp_001",              // Reference to employee
  skillName: "React",
  skillLevel: "Proficient",           // "Novice" | "Beginner" | "Competent" | "Proficient" | "Expert"
  acquiredDate: ISODate,
  lastAssessed: ISODate,
  isActive: true
}
```

### 3. Attendance Collection
```javascript
{
  _id: ObjectId,
  employeeId: "emp_001",              // Reference to employee
  date: ISODate,                      // Date of attendance
  status: "Present",                  // "Present" | "Unscheduled Absence" | "PTO" | "Sick Leave"
  hoursWorked: 8,
  checkIn: ISODate,
  checkOut: ISODate,
  notes: "Optional notes",
  createdAt: ISODate
}
```

### 4. Job Positions Collection
```javascript
{
  _id: ObjectId,
  positionId: "POS001",               // Unique within organization
  title: "Senior Software Engineer",
  department: "Engineering",
  status: "Open",                     // "Open" | "Closed" | "On Hold"
  openDate: ISODate,
  closeDate: null,
  hiredEmployeeId: null,              // Reference to employee when filled
  onHoldDate: null,
  heldBy: null,
  positionType: "New",                // "Replacement" | "New"
  budgetStatus: "Budgeted",           // "Budgeted" | "Non-Budgeted"
  description: "Job description text",
  requirements: ["5+ years experience", "React knowledge"],
  salaryRange: {
    min: 100000,
    max: 150000
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 5. Recruitment Funnels Collection
```javascript
{
  _id: ObjectId,
  positionId: "POS001",               // Reference to job position
  shortlisted: 50,
  interviewed: 15,
  offersExtended: 3,
  offersAccepted: 1,
  joined: 0,
  conversionRates: {
    shortlistToInterview: 0.30,
    interviewToOffer: 0.20,
    offerToAccept: 0.33,
    acceptToJoin: 1.00
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 6. Exit Interviews Collection
```javascript
{
  _id: ObjectId,
  employeeId: "emp_001",              // Reference to employee
  primaryReasonForLeaving: "Career Growth",
  secondaryReasonForLeaving: "Limited learning opportunities",
  management: {
    sentiment: "Positive",            // "Positive" | "Neutral" | "Negative"
    quote: "My manager was supportive but couldn't offer growth opportunities",
    summary: "Positive relationship with management but limited advancement opportunities"
  },
  compensation: {
    sentiment: "Neutral",
    quote: "The pay was fair for my role",
    summary: "Compensation was adequate but not a primary concern"
  },
  culture: {
    sentiment: "Positive",
    quote: "Great team and collaborative environment",
    summary: "Positive company culture and team dynamics"
  },
  analyzedAt: ISODate,
  createdAt: ISODate
}
```

### 7. Departments Collection
```javascript
{
  _id: ObjectId,
  departmentId: "dept_001",
  name: "Engineering",
  description: "Software development and engineering",
  headOfDepartment: "emp_002",        // Reference to employee
  budget: 2000000,
  location: "New York",
  isActive: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 8. Performance Reviews Collection
```javascript
{
  _id: ObjectId,
  employeeId: "emp_001",              // Reference to employee
  reviewPeriod: "2024-Q1",
  reviewDate: ISODate,
  reviewerId: "emp_002",             // Reference to reviewer
  rating: 4,                          // 1-5 scale
  goals: [
    {
      goal: "Complete project X",
      status: "Completed",
      weight: 0.4
    }
  ],
  strengths: ["Technical skills", "Team collaboration"],
  areasForImprovement: ["Time management"],
  nextPeriodGoals: ["Lead new project"],
  overallComments: "Excellent performance",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 9. Reports Collection
```javascript
{
  _id: ObjectId,
  reportId: "rpt_001",
  name: "Monthly Turnover Report",
  type: "turnover",
  generatedBy: "emp_003",             // Reference to user who generated
  parameters: {
    dateRange: {
      start: ISODate,
      end: ISODate
    },
    departments: ["Engineering", "Sales"]
  },
  data: {
    // Report-specific data structure
  },
  status: "completed",                // "generating" | "completed" | "failed"
  filePath: "/reports/turnover_2024_01.pdf",
  createdAt: ISODate,
  expiresAt: ISODate                  // For automatic cleanup
}
```

### 10. Analytics Collection
```javascript
{
  _id: ObjectId,
  metricType: "turnover_rate",
  period: "2024-01",
  value: 12.5,
  breakdown: {
    byDepartment: {
      "Engineering": 8.2,
      "Sales": 15.3
    },
    byTenure: {
      "< 1 year": 25.0,
      "1-2 years": 10.5
    }
  },
  calculatedAt: ISODate,
  dataSource: "employees_collection"
}
```

## 🔒 **Multi-Tenant Security & Data Isolation**

### **Database-Level Isolation:**
- Each organization has its own MongoDB database (`org_001`, `org_002`, etc.)
- Complete data separation prevents cross-tenant data access
- Independent scaling and performance optimization per organization
- Organization-specific backup and restore capabilities

### **Application-Level Security:**
- Connection strings are organization-specific
- Middleware validates organization access before database operations
- Audit logs track all cross-organization access attempts
- Role-based access control within each organization's database

### **Scalability Benefits:**
- New organizations automatically get their own database
- Independent performance tuning per organization
- Compliance-ready data isolation for enterprise customers
- Granular data governance and retention policies

This MongoDB structure provides **enterprise-grade multi-tenancy** with complete data isolation while maintaining the same collection structure across all organization databases for consistency and maintainability.

