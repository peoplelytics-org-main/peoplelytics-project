import mongoose from 'mongoose';
import { getOrgConnection } from './orgConnection';
import { AttendanceSchema } from '../../src/models/tenant/Attendance';
import { EmployeeSchema } from '../../src/models/tenant/Employee';
import { SkillsSchema } from '../../src/models/tenant/Skills';
import { JobPositionsSchema } from '../../src/models/tenant/JobPositions';
import { RecruitmentFunnelsSchema } from '../../src/models/tenant/RecruitmentFunnels';
import { ExitInterviewsSchema } from '../../src/models/tenant/ExitInterviews';
import { PerformanceAndEngagementSchema } from '../../src/models/tenant/PerformanceReviews';
import { DepartmentsSchema } from '../../src/models/tenant/Departments';
import { ReportsSchema } from '../../src/models/tenant/Reports';
import { AnalyticsSchema } from '../../src/models/tenant/Analytics';
import { SalaryAndCompensationSchema } from '../../src/models/tenant/Salary';
import { EmployeeFeedbackSchema } from '../../src/models/tenant/Employee_Feedback';

// Define schemas once
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Org Admin", "HR Analyst", "Executive"],
    required: true
  },
  permissions: {
    type: [String],     // <-- Array of permissions
    default: []
  },
  orgId: { type: String, required: true }
});



// Return all models for one org
export const getOrgModels = async(orgName: string) => {
  const conn = await getOrgConnection(orgName);

  return {
    User: conn.model('Users', userSchema),
    Departments:conn.model('Departments',DepartmentsSchema),
    Employees:conn.model('Employees',EmployeeSchema),
    EmployeeFeedback:conn.model('Employee_Feedback',EmployeeFeedbackSchema),
    Skills:conn.model("Skills",SkillsSchema),
    JobPositions:conn.model("JobPositions",JobPositionsSchema),
    Recruitment:conn.model("Recruitment",RecruitmentFunnelsSchema),
    ExitInterview:conn.model("ExitInterview",ExitInterviewsSchema),
    Performance:conn.model("PerformanceAndEngagement",PerformanceAndEngagementSchema),
    Attendance: conn.model('Attendance', AttendanceSchema),
    Salary:conn.model('SalaryAndCompensation',SalaryAndCompensationSchema),
    Reports:conn.model('Reports',ReportsSchema),
    Analytics:conn.model('Analytics',AnalyticsSchema)
  };
};



