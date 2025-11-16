import mongoose from 'mongoose';
import { getOrgConnection } from './orgConnection';
import { AttendanceSchema } from '@/models/tenant/Attendance';
import { EmployeeSchema } from '@/models/tenant/Employee';
import { SkillsSchema } from '@/models/tenant/Skills';
import { JobPositionsSchema } from '@/models/tenant/JobPositions';
import { RecruitmentFunnelsSchema } from '@/models/tenant/RecruitmentFunnels';
import { ExitInterviewsSchema } from '@/models/tenant/ExitInterviews';
import { PerformanceReviewsSchema } from '@/models/tenant/PerformanceReviews';
import { DepartmentsSchema } from '@/models/tenant/Departments';
import { ReportsSchema } from '@/models/tenant/Reports';
import { AnalyticsSchema } from '@/models/tenant/Analytics';

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
    Skills:conn.model("Skills",SkillsSchema),
    JobPositions:conn.model("JobPositions",JobPositionsSchema),
    Recruitment:conn.model("Recruitment",RecruitmentFunnelsSchema),
    ExitInterview:conn.model("ExitInterview",ExitInterviewsSchema),
    Performance:conn.model("Performance",PerformanceReviewsSchema),
    Attendance: conn.model('Attendance', AttendanceSchema),
    Reports:conn.model('Reports',ReportsSchema),
    Analytics:conn.model('Analytics',AnalyticsSchema)
  };
};



