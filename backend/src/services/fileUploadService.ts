import * as XLSX from 'xlsx';
import * as fs from 'fs';
import csv from 'csv-parser';
import { logger } from '../utils/helpers/logger';

/**
 * Parse CSV file
 */
export const parseCSV = async (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => {
        resolve(results);
        // Clean up file
        fs.unlinkSync(filePath);
      })
      .on('error', (error: any) => {
        reject(error);
        // Clean up file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
  });
};

/**
 * Parse Excel file
 */
export const parseExcel = async (filePath: string): Promise<any[]> => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('No sheets found in Excel file');
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error('Worksheet not found');
    }
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Clean up file
    fs.unlinkSync(filePath);
    
    return data;
  } catch (error) {
    // Clean up file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Parse uploaded file (CSV or Excel)
 */
export const parseUploadedFile = async (filePath: string, mimetype: string): Promise<any[]> => {
  try {
    if (mimetype === 'text/csv') {
      return await parseCSV(filePath);
    } else if (
      mimetype === 'application/vnd.ms-excel' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return await parseExcel(filePath);
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    logger.error('Error parsing uploaded file:', error);
    throw error;
  }
};

/**
 * Map CSV/Excel row to employee data
 */
export const mapRowToEmployee = (row: any): any => {
  // Parse skills if provided
  let skills: Array<{ name: string; level: string }> = [];
  if (row.skills) {
    const skillsString = String(row.skills || row.Skills || row.SKILLS || '');
    if (skillsString) {
      skills = skillsString.split(',').map((s: string) => {
        const parts = s.trim().split(':');
        const name = parts[0]?.trim();
        const level = parts[1]?.trim() || 'Competent';
        if (name) {
          return {
            name,
            level: ['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'].includes(level) 
              ? level 
              : 'Competent'
          };
        }
        return null;
      }).filter((s): s is { name: string; level: string } => s !== null);
    }
  }

  return {
    employeeId: row.employeeId || row['Employee ID'] || row['employee_id'] || row.id || row.Id || row.ID,
    name: row.name || row.Name || row.NAME,
    department: row.department || row.Department || row.DEPARTMENT,
    jobTitle: row.jobTitle || row['Job Title'] || row['job_title'] || row.JobTitle,
    location: row.location || row.Location || row.LOCATION,
    hireDate: row.hireDate || row['Hire Date'] || row['hire_date'] || row.HireDate,
    terminationDate: row.terminationDate || row['Termination Date'] || row['termination_date'],
    terminationReason: row.terminationReason || row['Termination Reason'] || row['termination_reason'],
    gender: row.gender || row.Gender || row.GENDER || 'Other',
    managerId: row.managerId || row['Manager ID'] || row['manager_id'],
    successionStatus: row.successionStatus || row['Succession Status'] || row['succession_status'] || 'Not Assessed',
    // Additional fields from frontend
    salary: row.salary ? Number(row.salary) : undefined,
    performanceRating: row.performanceRating ? Number(row.performanceRating) : undefined,
    potentialRating: row.potentialRating ? Number(row.potentialRating) : undefined,
    engagementScore: row.engagementScore ? Number(row.engagementScore) : undefined,
    skills: skills.length > 0 ? skills : undefined,
    compensationSatisfaction: row.compensationSatisfaction ? Number(row.compensationSatisfaction) : undefined,
    benefitsSatisfaction: row.benefitsSatisfaction ? Number(row.benefitsSatisfaction) : undefined,
    managementSatisfaction: row.managementSatisfaction ? Number(row.managementSatisfaction) : undefined,
    trainingSatisfaction: row.trainingSatisfaction ? Number(row.trainingSatisfaction) : undefined,
    trainingCompleted: row.trainingCompleted ? Number(row.trainingCompleted) : undefined,
    trainingTotal: row.trainingTotal ? Number(row.trainingTotal) : undefined,
    bonus: row.bonus ? Number(row.bonus) : undefined,
    lastRaiseAmount: row.lastRaiseAmount ? Number(row.lastRaiseAmount) : undefined,
    hasGrievance: row.hasGrievance ? String(row.hasGrievance).toLowerCase() === 'true' : undefined,
    impactScore: row.impactScore? Number(row.impactScore):undefined,       // <-- Map here
    flightRiskScore:row.flightRiskScore? Number(row.flightRiskScore):undefined, 
    weeklyHours: row.weeklyHours ? Number(row.weeklyHours) : undefined,
    snapshotDate: row.snapshotDate ? new Date(row.snapshotDate) : new Date(),
  };
};

/**
 * Map CSV/Excel row to attendance data
 */
export const mapRowToAttendance = (row: any): any => {
  const dateTimeIn = row.date_time_in || row['Date Time In'] || row['date_time_in'] || row.date || row.Date;
  const dateTimeOut = row.date_time_out || row['Date Time Out'] || row['date_time_out'];
  
  return {
    attendanceId: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    employeeId: row.employeeId || row['Employee ID'] || row['employee_id'],
    date_time_in: dateTimeIn ? new Date(dateTimeIn) : new Date(),
    date_time_out: dateTimeOut ? new Date(dateTimeOut) : undefined,
    status: row.status || row.Status || row.STATUS || 'Present',
  };
};

/**
 * Validate employee data
 */
export const validateEmployeeData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.employeeId) errors.push('Employee ID is required');
  if (!data.name) errors.push('Name is required');
  if (!data.department) errors.push('Department is required');
  if (!data.jobTitle) errors.push('Job title is required');
  if (!data.location) errors.push('Location is required');
  if (!data.hireDate) errors.push('Hire date is required');
  if (!data.gender) errors.push('Gender is required');

  if (data.gender && !['Male', 'Female', 'Other'].includes(data.gender)) {
    errors.push('Gender must be Male, Female, or Other');
  }

  // Validate optional numeric fields
  if (data.performanceRating !== undefined && (data.performanceRating < 1 || data.performanceRating > 5)) {
    errors.push('Performance rating must be between 1 and 5');
  }
  if (data.potentialRating !== undefined && (data.potentialRating < 1 || data.potentialRating > 3)) {
    errors.push('Potential rating must be between 1 and 3');
  }
  if (data.engagementScore !== undefined && (data.engagementScore < 1 || data.engagementScore > 100)) {
    errors.push('Engagement score must be between 1 and 100');
  }
  if (data.compensationSatisfaction !== undefined && (data.compensationSatisfaction < 1 || data.compensationSatisfaction > 100)) {
    errors.push('Compensation satisfaction must be between 1 and 100');
  }
  if (data.benefitsSatisfaction !== undefined && (data.benefitsSatisfaction < 1 || data.benefitsSatisfaction > 100)) {
    errors.push('Benefits satisfaction must be between 1 and 100');
  }
  if (data.managementSatisfaction !== undefined && (data.managementSatisfaction < 1 || data.managementSatisfaction > 100)) {
    errors.push('Management satisfaction must be between 1 and 100');
  }
  if (data.trainingSatisfaction !== undefined && (data.trainingSatisfaction < 1 || data.trainingSatisfaction > 100)) {
    errors.push('Training satisfaction must be between 1 and 100');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate attendance data
 */
export const validateAttendanceData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.employeeId) errors.push('Employee ID is required');
  if (!data.date_time_in) errors.push('Date time in is required');
  if (!data.status) errors.push('Status is required');

  if (data.status && !['Present', 'Unscheduled Absence', 'PTO', 'Sick Leave'].includes(data.status)) {
    errors.push('Status must be Present, Unscheduled Absence, PTO, or Sick Leave');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

const safeParseInt = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
};

export const mapRowToRecruitmentFunnel = (row: any): any => {
  // Normalize keys to lower case for safer matching if Excel headers vary
  const normalize = (key: string) => row[key] || row[key.toLowerCase()] || row[key.toUpperCase()];

  return {
    // Check various casing for Position ID
    positionId: row.positionId || row['Position ID'] || row['position_id'] || row.PositionId,
    
    // Use safe parsing
    shortlisted: safeParseInt(row.shortlisted || row['Shortlisted']),
    interviewed: safeParseInt(row.interviewed || row['Interviewed']),
    offersExtended: safeParseInt(row.offersExtended || row['Offers Extended'] || row['offersExtended']),
    offersAccepted: safeParseInt(row.offersAccepted || row['Offers Accepted'] || row['offersAccepted']),
    joined: safeParseInt(row.joined || row['Joined']),
    
    // Placeholder - will be overwritten by Controller
    organizationId: row.organizationId
  };
};

export const validateRecruitmentFunnelData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.positionId) {
    errors.push('Position ID is required');
  }

  // Check if Organization ID was successfully attached
  if (!data.organizationId) {
    errors.push('System Error: Organization ID missing from record');
  }
  
  // Logical Validation
  if (data.interviewed > data.shortlisted) errors.push(`Interviewed (${data.interviewed}) > Shortlisted (${data.shortlisted})`);
  if (data.offersExtended > data.interviewed) errors.push(`Offers Extended (${data.offersExtended}) > Interviewed (${data.interviewed})`);
  if (data.offersAccepted > data.offersExtended) errors.push(`Offers Accepted (${data.offersAccepted}) > Offers Extended (${data.offersExtended})`);
  if (data.joined > data.offersAccepted) errors.push(`Joined (${data.joined}) > Offers Accepted (${data.offersAccepted})`);

  return {
    valid: errors.length === 0,
    errors,
  };
};