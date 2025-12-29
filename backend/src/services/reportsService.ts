import { Connection, Model } from 'mongoose';
import { IReports, ReportsSchema } from '../models/tenant/Reports';
import { IEmployee, EmployeeSchema } from '../models/tenant/Employee';
import { IAttendance, AttendanceSchema } from '../models/tenant/Attendance';
import { logger } from '../utils/helpers/logger';

/**
 * Get Reports model for a specific organization connection
 */
export const getReportsModel = (connection: Connection): Model<IReports> => {
  if (connection.models.Reports) {
    return connection.models.Reports as Model<IReports>;
  }
  return connection.model<IReports>('Reports', ReportsSchema);
};

/**
 * Get Employee model for a specific organization connection
 */
export const getEmployeeModel = (connection: Connection): Model<IEmployee> => {
  if (connection.models.Employee) {
    return connection.models.Employee as Model<IEmployee>;
  }
  return connection.model<IEmployee>('Employee', EmployeeSchema);
};

/**
 * Get Attendance model for a specific organization connection
 */
export const getAttendanceModel = (connection: Connection): Model<IAttendance> => {
  if (connection.models.Attendance) {
    return connection.models.Attendance as Model<IAttendance>;
  }
  return connection.model<IAttendance>('Attendance', AttendanceSchema);
};

/**
 * Generate employee report
 */
export const generateEmployeeReport = async (
  EmployeeModel: Model<IEmployee>,
  dateRange: { start: Date; end: Date },
  departments?: string[]
): Promise<any> => {
  try {
    const query: any = {
      hireDate: { $lte: dateRange.end },
    };

    if (departments && departments.length > 0) {
      query.department = { $in: departments };
    }

    const employees = await EmployeeModel.find(query).lean();

    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e: any) => !e.terminationDate).length,
      terminatedEmployees: employees.filter((e: any) => e.terminationDate).length,
      employees: employees.map((emp: any) => ({
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department,
        jobTitle: emp.jobTitle,
        location: emp.location,
        hireDate: emp.hireDate,
        terminationDate: emp.terminationDate,
        status: emp.terminationDate ? 'Terminated' : 'Active',
      })),
    };
  } catch (error) {
    logger.error('Error generating employee report:', error);
    throw error;
  }
};

/**
 * Generate attendance report
 */
export const generateAttendanceReport = async (
  AttendanceModel: Model<IAttendance>,
  dateRange: { start: Date; end: Date },
  employeeId?: string
): Promise<any> => {
  try {
    const query: any = {
      date_time_in: { $gte: dateRange.start, $lte: dateRange.end },
    };

    if (employeeId) {
      query.employeeId = employeeId;
    }

    const attendance = await AttendanceModel.find(query).lean();

    const summary = {
      total: attendance.length,
      present: attendance.filter((a: any) => a.status === 'Present').length,
      pto: attendance.filter((a: any) => a.status === 'PTO').length,
      sickLeave: attendance.filter((a: any) => a.status === 'Sick Leave').length,
      unscheduledAbsence: attendance.filter((a: any) => a.status === 'Unscheduled Absence').length,
    };

    return {
      ...summary,
      attendanceRate: summary.total > 0 ? (summary.present / summary.total) * 100 : 0,
      records: attendance,
    };
  } catch (error) {
    logger.error('Error generating attendance report:', error);
    throw error;
  }
};

/**
 * Create a report
 */
export const createReport = async (
  ReportsModel: Model<IReports>,
  EmployeeModel: Model<IEmployee>,
  AttendanceModel: Model<IAttendance>,
  reportData: {
    reportId: string;
    name: string;
    type: string;
    generatedBy: string;
    parameters: {
      dateRange: { start: Date; end: Date };
      departments?: string[];
      employeeId?: string;
    };
  }
): Promise<IReports> => {
  try {
    let reportData_result: any;

    switch (reportData.type) {
      case 'employee':
        reportData_result = await generateEmployeeReport(
          EmployeeModel,
          reportData.parameters.dateRange,
          reportData.parameters.departments
        );
        break;
      case 'attendance':
        reportData_result = await generateAttendanceReport(
          AttendanceModel,
          reportData.parameters.dateRange,
          reportData.parameters.employeeId
        );
        break;
      default:
        throw new Error(`Unknown report type: ${reportData.type}`);
    }

    // Set expiration to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const report = new ReportsModel({
      ...reportData,
      data: reportData_result,
      status: 'completed',
      expiresAt,
    });

    return await report.save();
  } catch (error) {
    logger.error('Error creating report:', error);
    throw error;
  }
};

/**
 * Get reports
 */
export const getReports = async (
  ReportsModel: Model<IReports>,
  type?: string,
  generatedBy?: string
): Promise<IReports[]> => {
  try {
    const query: any = {};
    if (type) query.type = type;
    if (generatedBy) query.generatedBy = generatedBy;

    return await ReportsModel.find(query)
      .sort({ createdAt: -1 })
      .lean() as unknown as IReports[];
  } catch (error) {
    logger.error('Error fetching reports:', error);
    throw error;
  }
};

/**
 * Get report by ID
 */
export const getReportById = async (
  ReportsModel: Model<IReports>,
  reportId: string
): Promise<IReports | null> => {
  try {
    return await ReportsModel.findOne({ reportId }).lean() as unknown as IReports | null;
  } catch (error) {
    logger.error(`Error fetching report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Delete a report
 */
export const deleteReport = async (
  ReportsModel: Model<IReports>,
  reportId: string
): Promise<boolean> => {
  try {
    const result = await ReportsModel.deleteOne({ reportId });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`Error deleting report ${reportId}:`, error);
    throw error;
  }
};



