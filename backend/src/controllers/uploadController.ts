import { Request, Response, NextFunction } from 'express';
import {getOrganizationDatabase} from "../config/database"
import { Connection } from 'mongoose';
import { upload } from '../middleware/upload';
import { parseUploadedFile, mapRowToEmployee, mapRowToAttendance, validateEmployeeData, validateAttendanceData, validateRecruitmentFunnelData, mapRowToRecruitmentFunnel } from '../services/fileUploadService';
import { 
  getRecruitmentFunnelsModel, 
  bulkCreateRecruitmentFunnels
} from '../services/recruitmentFunnelsService';
import { getEmployeeModel } from '../services/employeeService';
import { getAttendanceModel } from '../services/attendanceService';
import { getSalaryModel } from '@/services/salaryService';
import { getSkillsModel } from '@/services/skillsService';
import { getPerformanceReviewModel } from '@/services/performanceReviewsService';
import { getEmployeeFeedbackModel,createEmployeeFeedback } from '@/services/employeeFeedbackService';
import { getJobPositionsModel } from '@/services/jobPositionsService';
import { getDepartmentsModel } from '@/services/departmentsService';
import { bulkCreateEmployees } from '../services/employeeService';
import { bulkCreateAttendance } from '../services/attendanceService';
import { DatabaseService } from '../services/tenant/databaseService';
import { logger } from '../utils/helpers/logger';

/**
 * Helper to get organization connection from request
 */
const getOrgConnection = (req: Request): Connection => {
  const orgId = req.organizationId || (req as any).user?.organizationId;
  
  if (!orgId) {
    throw new Error('Organization ID not found in request');
  }

  const dbService = DatabaseService.getInstance();
  return dbService.getOrganizationConnection(orgId);
};

/**
 * Upload employees from CSV/Excel file
 * POST /api/upload/employees
 */
// export const uploadEmployees = [
//   upload.single('file'),
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           error: 'No file uploaded',
//         });
//       }

//       const connection = getOrgConnection(req);
//       const EmployeeModel = getEmployeeModel(connection);

//       // Parse file
//       const rows = await parseUploadedFile(req.file.path, req.file.mimetype);

//       // Map and validate rows
//       const employees: any[] = [];
//       const errors: string[] = [];

//       for (let i = 0; i < rows.length; i++) {
//         const row = rows[i];
//         const employeeData = mapRowToEmployee(row);
//         const validation = validateEmployeeData(employeeData);

//         if (validation.valid) {
//           // Convert hireDate to Date if it's a string
//           if (typeof employeeData.hireDate === 'string') {
//             employeeData.hireDate = new Date(employeeData.hireDate);
//           }
//           if (employeeData.terminationDate && typeof employeeData.terminationDate === 'string') {
//             employeeData.terminationDate = new Date(employeeData.terminationDate);
//           }
//           employees.push(employeeData);
//         } else {
//           errors.push(`Row ${i + 2}: ${validation.errors.join(', ')}`);
//         }
//       }

//       if (employees.length === 0) {
//         return res.status(400).json({
//           success: false,
//           error: 'No valid employee data found in file',
//           errors,
//         });
//       }

//       // Bulk create employees
//       const result = await bulkCreateEmployees(EmployeeModel, employees);

//       return res.status(201).json({
//         success: true,
//         data: {
//           created: result.created,
//           failed: result.failed,
//           errors: [...errors, ...result.errors],
//         },
//         message: `Upload completed: ${result.created} employees created, ${result.failed} failed`,
//       });
//     } catch (error: any) {
//       logger.error('Error in uploadEmployees:', error);
//       return res.status(500).json({
//         success: false,
//         error: error.message || 'Failed to upload employees',
//       });
//     }
//   },
// ];

export const uploadEmployees = [
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      const connection = getOrgConnection(req);

      const EmployeeModel = getEmployeeModel(connection);
      const PerformanceModel = getPerformanceReviewModel(connection);
      const SalaryModel = getSalaryModel(connection);
      const SkillsModel = getSkillsModel(connection);
      const EmployeeFeedbackModel=getEmployeeFeedbackModel(connection);
     

      // Parse file
      const rows = await parseUploadedFile(req.file.path, req.file.mimetype);

      // Final containers
      const employeeBulk: any[] = [];
      const performanceBulk: any[] = [];
      const salaryBulk: any[] = [];
      const skillsBulk: any[] = [];
      const employeeFeedbackBulk:any[]=[];      
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const employeeData = mapRowToEmployee(row);

        const validation = validateEmployeeData(employeeData);
        if (!validation.valid) {
          errors.push(`Row ${i + 2}: ${validation.errors.join(", ")}`);
          continue;
        }

        // ----------- EMPLOYEE BASIC DATA -------------

        if (typeof employeeData.hireDate === "string") {
          employeeData.hireDate = new Date(employeeData.hireDate);
        }
        if (employeeData.terminationDate && typeof employeeData.terminationDate === "string") {
          employeeData.terminationDate = new Date(employeeData.terminationDate);
        }

        // FIX 1: Use updateOne with upsert instead of insertOne
        employeeBulk.push({
          updateOne: {
            filter: { employeeId: employeeData.employeeId },
            update: { $set: employeeData },
            upsert: true,
          },
        });

        // ---------- PERFORMANCE & ENGAGEMENT ----------

        performanceBulk.push({
          updateOne: {
            filter: { employeeId: employeeData.employeeId },
            update: {
              $set: {
                employeeId: employeeData.employeeId,
                name: employeeData.name,
                performanceRating: employeeData.performanceRating ?? 3,
                potentialRating: employeeData.potentialRating ?? 1,
                trainingCompleted: employeeData.trainingCompleted ?? 0,
                trainingTotal: employeeData.trainingTotal ?? 8,
                weeklyHours: employeeData.weeklyHours ?? 40,
                hasGrievance: employeeData.hasGrievance ?? false,
                impactScore: employeeData.impactScore ?? 0,
                flightRiskScore: employeeData.flightRiskScore ?? 0,
              },
            },
            upsert: true,
          },
        });

        employeeFeedbackBulk.push({
          updateOne: {
              filter: { employeeId: employeeData.employeeId },
              update: {
                  $set: {
                      employeeId: employeeData.employeeId,
                      // Generate a unique ID if one doesn't exist, though typically Mongoose handles _id
                      satisId: `SAT_${employeeData.employeeId}`, 
                      engagementScore: employeeData.engagementScore ?? 0,
                      compensationSatisfaction: employeeData.compensationSatisfaction ?? 0,
                      benefitsSatisfaction: employeeData.benefitsSatisfaction ?? 0,
                      managementSatisfaction: employeeData.managementSatisfaction ?? 0,
                      trainingSatisfaction: employeeData.trainingSatisfaction ?? 0,
                  }
              },
              upsert: true
          }
      });
        // ---------- SALARY & COMPENSATION -------------

        salaryBulk.push({
          updateOne: {
            filter: { employeeId: employeeData.employeeId },
            update: {
              $set: {
                salaryId: `SAL_${employeeData.employeeId}`,
                employeeId: employeeData.employeeId,
                name: employeeData.name,
                salary: employeeData.salary ?? 0,
                bonus: employeeData.bonus ?? 0,
                lastRaiseAmount: employeeData.lastRaiseAmount ?? 0,
              },
            },
            upsert: true,
          },
        });

        

        // ------------------ SKILLS --------------------

        if (Array.isArray(employeeData.skills)) {
          employeeData.skills.forEach((skill: any) => {
            const generatedSkillId = `SK_${employeeData.employeeId}_${skill.name.replace(/\s+/g, "_")}`;
            
            skillsBulk.push({
              updateOne: {
                // FIX: Filter by the Compound Unique Keys (employeeId + skillName)
                // This prevents E11000 errors if the skill already exists
                filter: { 
                    employeeId: employeeData.employeeId, 
                    skillName: skill.name 
                }, 
                update: {
                  $set: {
                    // We still update the ID to match our standard format
                    skillLevelId: generatedSkillId, 
                    employeeId: employeeData.employeeId,
                    employeeName: employeeData.name,
                    skillName: skill.name,
                    skillLevel: skill.level,
                  },
                },
                upsert: true,
              },
            });
          });
        }
      }

      // If no valid rows found
      if (employeeBulk.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No valid rows found",
          errors,
        });
      }

      // Execute bulk ops
      await EmployeeModel.bulkWrite(employeeBulk);
      await PerformanceModel.bulkWrite(performanceBulk);
      await SalaryModel.bulkWrite(salaryBulk);
      await EmployeeFeedbackModel.bulkWrite(employeeFeedbackBulk);
      if (skillsBulk.length > 0) await SkillsModel.bulkWrite(skillsBulk);

      return res.status(201).json({
        success: true,
        message: "Employees uploaded successfully",
        data:{
        createdEmployees: employeeBulk.length,
        createdPerformance: performanceBulk.length,
        createdSalary: salaryBulk.length,
        createdSkills: skillsBulk.length,
        createdFeedback:employeeFeedbackBulk.length
        },
        
        errors,
      });
    } catch (error: any) {
      logger.error("Error in uploadEmployees:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to upload employees",
      });
    }
  },
];


/**
 * Upload attendance from CSV/Excel file
 * POST /api/upload/attendance
 */
export const uploadAttendance = [
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      const connection = getOrgConnection(req);
      const AttendanceModel = getAttendanceModel(connection);

      // Parse file
      const rows = await parseUploadedFile(req.file.path, req.file.mimetype);

      // Map and validate rows
      const attendanceRecords: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const attendanceData = mapRowToAttendance(row);
        const validation = validateAttendanceData(attendanceData);

        if (validation.valid) {
          attendanceRecords.push(attendanceData);
        } else {
          errors.push(`Row ${i + 2}: ${validation.errors.join(', ')}`);
        }
      }

      if (attendanceRecords.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid attendance data found in file',
          errors,
        });
      }

      // Bulk create attendance records
      const result = await bulkCreateAttendance(AttendanceModel, attendanceRecords);

      return res.status(201).json({
        success: true,
        data: {
          created: result.created,
          failed: result.failed,
          errors: [...errors, ...result.errors],
        },
        message: `Upload completed: ${result.created} attendance records created, ${result.failed} failed`,
      });
    } catch (error: any) {
      logger.error('Error in uploadAttendance:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload attendance',
      });
    }
  },
];


export const uploadRecruitmentFunnels = [
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

      const connection = getOrgConnection(req);
      const RecruitmentFunnelModel = getRecruitmentFunnelsModel(connection); // Ensure this matches your Service export name

      // 1. Validate Org ID exists on Request
      const currentOrgId = req.organizationId || (req as any).user?.organizationId;
      if (!currentOrgId) {
        return res.status(400).json({ success: false, error: 'User is not associated with an Organization' });
      }

      const rows = await parseUploadedFile(req.file.path, req.file.mimetype);
      const funnels: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const funnelData = mapRowToRecruitmentFunnel(row);
        
        // 2. Explicitly attach Org ID
        funnelData.organizationId = currentOrgId;

        const validation = validateRecruitmentFunnelData(funnelData);

        if (validation.valid) {
          funnels.push(funnelData);
        } else {
          errors.push(`Row ${i + 2}: ${validation.errors.join(', ')}`);
        }
      }

      if (funnels.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid recruitment funnel data found',
          errors,
        });
      }

      const result = await bulkCreateRecruitmentFunnels(RecruitmentFunnelModel, funnels);

      return res.status(201).json({
        success: true,
        data: {
          created: result.created,
          failed: result.failed,
          errors: [...errors, ...result.errors],
        },
        message: `Upload completed: ${result.created} created, ${result.failed} failed`,
      });

    } catch (error: any) {
      logger.error('Error in uploadRecruitmentFunnels:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload recruitment funnels',
      });
    }
  },
];
