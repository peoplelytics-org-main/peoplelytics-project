import { Connection, Model } from 'mongoose';
import { IAttendance, AttendanceSchema } from '../models/tenant/Attendance';
import { logger } from '../utils/helpers/logger';

export interface AttendanceQueryFilters {
  employeeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// At the top of the file, update or add this interface
export interface BulkOperationResult {
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
 * Build query filters for attendance search
 */
export const buildAttendanceQuery = (filters: AttendanceQueryFilters) => {
  const query: any = {};

  if (filters.employeeId) {
    query.employeeId = filters.employeeId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    query.date_time_in = {};
    if (filters.startDate) {
      query.date_time_in.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.date_time_in.$lte = new Date(filters.endDate);
    }
  }

  return query;
};

/**
 * Get attendance records with pagination and filters
 */
export const getAttendanceRecords = async (
  AttendanceModel: Model<IAttendance>,
  filters: AttendanceQueryFilters,
  pagination: PaginationOptions
): Promise<PaginatedResult<IAttendance>> => {
  try {
    const query = buildAttendanceQuery(filters);
    
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [data, total] = await Promise.all([
      AttendanceModel.find(query)
        .sort({ date_time_in: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      AttendanceModel.countDocuments(query),
    ]);

    return {
      data: data as unknown as IAttendance[],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  } catch (error) {
    logger.error('Error fetching attendance records:', error);
    throw error;
  }
};

/**
 * Get attendance record by ID
 */
export const getAttendanceById = async (
  AttendanceModel: Model<IAttendance>,
  attendanceId: string
): Promise<IAttendance | null> => {
  try {
    return await AttendanceModel.findOne({ attendanceId }).lean() as unknown as IAttendance | null;
  } catch (error) {
    logger.error(`Error fetching attendance ${attendanceId}:`, error);
    throw error;
  }
};

/**
 * Create a new attendance record
 */
export const createAttendance = async (
  AttendanceModel: Model<IAttendance>,
  attendanceData: Partial<IAttendance>
): Promise<IAttendance> => {
  try {
    // Check if attendance record with same ID already exists
    const existing = await AttendanceModel.findOne({ attendanceId: attendanceData.attendanceId });
    if (existing) {
      throw new Error(`Attendance record with ID ${attendanceData.attendanceId} already exists`);
    }

    const attendance = new AttendanceModel(attendanceData);
    return await attendance.save();
  } catch (error) {
    logger.error('Error creating attendance record:', error);
    throw error;
  }
};

/**
 * Update an attendance record
 */
export const updateAttendance = async (
  AttendanceModel: Model<IAttendance>,
  attendanceId: string,
  updateData: Partial<IAttendance>
): Promise<IAttendance | null> => {
  try {
    // If updating attendanceId, check for conflicts
    if (updateData.attendanceId && updateData.attendanceId !== attendanceId) {
      const existing = await AttendanceModel.findOne({ attendanceId: updateData.attendanceId });
      if (existing) {
        throw new Error(`Attendance record with ID ${updateData.attendanceId} already exists`);
      }
    }

    const attendance = await AttendanceModel.findOneAndUpdate(
      { attendanceId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return attendance;
  } catch (error) {
    logger.error(`Error updating attendance ${attendanceId}:`, error);
    throw error;
  }
};

/**
 * Delete an attendance record
 */
export const deleteAttendance = async (
  AttendanceModel: Model<IAttendance>,
  attendanceId: string
): Promise<boolean> => {
  try {
    const result = await AttendanceModel.deleteOne({ attendanceId });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`Error deleting attendance ${attendanceId}:`, error);
    throw error;
  }
};

/**
 * Bulk create attendance records
 */
/**
 * Bulk create/update attendance records (UPSERT) - Optimized version
 */
/**
 * Bulk create/update attendance records (UPSERT)
 * FIX: Matches by EmployeeID + Date instead of ID to prevent duplicates
 */
export const bulkCreateAttendance = async (
  AttendanceModel: Model<IAttendance>,
  records: Partial<IAttendance>[]
): Promise<{ created: number; updated: number; failed: number; errors: string[] }> => {
  try {
    const errors: string[] = [];
    
    // 1. Validation: Ensure we have the "Natural Keys" (Employee + Date) instead of attendanceId
    const validRecords = records.filter(record => {
      // Assuming your model uses 'date_time_in' for the date
      if (!record.employeeId || !record.date_time_in) {
        errors.push(`Record missing 'employeeId' or 'date_time_in'`);
        return false;
      }
      return true;
    });

    if (validRecords.length === 0) {
      return { created: 0, updated: 0, failed: records.length, errors };
    }

    // 2. Bulk Operation with Natural Key Filter
    const bulkOps = validRecords.map(recordData => ({
      updateOne: {
        // FIX: Filter by Employee + Date. 
        // This ensures if a record exists for this person on this day, it updates it.
        // If it doesn't exist, it creates a new one.
        filter: { 
          employeeId: recordData.employeeId, 
          date_time_in: recordData.date_time_in 
        },
        update: { $set: recordData },
        upsert: true, 
      },
    }));

    const result = await AttendanceModel.bulkWrite(bulkOps, { ordered: false });

    return {
      created: result.upsertedCount || 0,
      updated: result.modifiedCount || 0,
      failed: errors.length,
      errors,
    };
  } catch (error: any) {
    logger.error('Error in bulk create attendance:', error);
    
    if (error.writeErrors) {
      const writeErrors = error.writeErrors as any[];
      writeErrors.forEach((err: any) => {
        errors.push(`Record ${err.index}: ${err.errmsg}`);
      });
      
      return {
        created: error.result?.nUpserted || 0,
        updated: error.result?.nModified || 0,
        failed: writeErrors.length,
        errors,
      };
    }
    
    throw error;
  }
};

/**
 * Get attendance summary statistics
 */
export const getAttendanceSummary = async (
  AttendanceModel: Model<IAttendance>,
  filters?: AttendanceQueryFilters
): Promise<{
  total: number;
  present: number;
  absent: number;
  pto: number;
  sickLeave: number;
  unscheduledAbsence: number;
  byStatus: Record<string, number>;
}> => {
  try {
    const query = filters ? buildAttendanceQuery(filters) : {};

    const [total, present, absent, pto, sickLeave, unscheduledAbsence, byStatus] = await Promise.all([
      AttendanceModel.countDocuments(query),
      AttendanceModel.countDocuments({ ...query, status: 'Present' }),
      AttendanceModel.countDocuments({ ...query, status: { $in: ['Unscheduled Absence', 'Sick Leave'] } }),
      AttendanceModel.countDocuments({ ...query, status: 'PTO' }),
      AttendanceModel.countDocuments({ ...query, status: 'Sick Leave' }),
      AttendanceModel.countDocuments({ ...query, status: 'Unscheduled Absence' }),
      AttendanceModel.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap: Record<string, number> = {};
    byStatus.forEach((item: any) => {
      statusMap[item._id] = item.count;
    });

    return {
      total,
      present,
      absent,
      pto,
      sickLeave,
      unscheduledAbsence,
      byStatus: statusMap,
    };
  } catch (error) {
    logger.error('Error getting attendance summary:', error);
    throw error;
  }
};

