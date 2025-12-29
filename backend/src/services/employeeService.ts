import { Connection, Model } from 'mongoose';
import { IEmployee, EmployeeSchema } from '../models/tenant/Employee';
import { logger } from '../utils/helpers/logger';

export interface EmployeeQueryFilters {
  department?: string;
  location?: string;
  jobTitle?: string;
  isActive?: boolean;
  search?: string;
  managerId?: string;
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
 * Get Employee model for a specific organization connection
 */
export const getEmployeeModel = (connection: Connection): Model<IEmployee> => {
  if (connection.models.Employee) {
    return connection.models.Employee as Model<IEmployee>;
  }
  return connection.model<IEmployee>('Employee', EmployeeSchema);
};

/**
 * Build query filters for employee search
 */
export const buildEmployeeQuery = (filters: EmployeeQueryFilters) => {
  const query: any = {};

  if (filters.department) {
    query.department = filters.department;
  }

  if (filters.location) {
    query.location = filters.location;
  }

  if (filters.jobTitle) {
    query.jobTitle = filters.jobTitle;
  }

  if (filters.managerId) {
    query.managerId = filters.managerId;
  }

  if (filters.isActive !== undefined) {
    if (filters.isActive) {
      query.terminationDate = { $exists: false };
    } else {
      query.terminationDate = { $exists: true };
    }
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { employeeId: { $regex: filters.search, $options: 'i' } },
      { jobTitle: { $regex: filters.search, $options: 'i' } },
      { department: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return query;
};

/**
 * Get employees with pagination and filters
 */
export const getEmployees = async (
  EmployeeModel: Model<IEmployee>,
  filters: EmployeeQueryFilters,
  pagination: PaginationOptions
): Promise<PaginatedResult<IEmployee>> => {
  try {
    const query = buildEmployeeQuery(filters);
    
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [data, total] = await Promise.all([
      EmployeeModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      EmployeeModel.countDocuments(query),
    ]);

    return {
      data: data as unknown as IEmployee[],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  } catch (error) {
    logger.error('Error fetching employees:', error);
    throw error;
  }
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (
  EmployeeModel: Model<IEmployee>,
  employeeId: string
): Promise<IEmployee | null> => {
  try {
    return await EmployeeModel.findOne({ employeeId }).lean() as unknown as IEmployee | null;
  } catch (error) {
    logger.error(`Error fetching employee ${employeeId}:`, error);
    throw error;
  }
};

/**
 * Create a new employee
 */
export const createEmployee = async (
  EmployeeModel: Model<IEmployee>,
  employeeData: Partial<IEmployee>
): Promise<IEmployee> => {
  try {
    // Check if employee with same employeeId already exists
    const existing = await EmployeeModel.findOne({ employeeId: employeeData.employeeId });
    if (existing) {
      throw new Error(`Employee with ID ${employeeData.employeeId} already exists`);
    }

    const employee = new EmployeeModel(employeeData);
    return await employee.save();
  } catch (error) {
    logger.error('Error creating employee:', error);
    throw error;
  }
};

/**
 * Update an employee
 */
export const updateEmployee = async (
  EmployeeModel: Model<IEmployee>,
  employeeId: string,
  updateData: Partial<IEmployee>
): Promise<IEmployee | null> => {
  try {
    // If updating employeeId, check for conflicts
    if (updateData.employeeId && updateData.employeeId !== employeeId) {
      const existing = await EmployeeModel.findOne({ employeeId: updateData.employeeId });
      if (existing) {
        throw new Error(`Employee with ID ${updateData.employeeId} already exists`);
      }
    }

    const employee = await EmployeeModel.findOneAndUpdate(
      { employeeId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return employee;
  } catch (error) {
    logger.error(`Error updating employee ${employeeId}:`, error);
    throw error;
  }
};

/**
 * Delete an employee
 */
export const deleteEmployee = async (
  EmployeeModel: Model<IEmployee>,
  employeeId: string
): Promise<boolean> => {
  try {
    const result = await EmployeeModel.deleteOne({ employeeId });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`Error deleting employee ${employeeId}:`, error);
    throw error;
  }
};

/**
 * Bulk create employees
 */
export const bulkCreateEmployees = async (
  EmployeeModel: Model<IEmployee>,
  employees: Partial<IEmployee>[]
): Promise<{ created: number; failed: number; errors: string[] }> => {
  try {
    const errors: string[] = [];
    let created = 0;
    let failed = 0;

    for (const employeeData of employees) {
      try {
        // Check if employee already exists
        const existing = await EmployeeModel.findOne({ employeeId: employeeData.employeeId });
        if (existing) {
          errors.push(`Employee ${employeeData.employeeId} already exists`);
          failed++;
          continue;
        }

        const employee = new EmployeeModel(employeeData);
        await employee.save();
        created++;
      } catch (error: any) {
        errors.push(`Failed to create employee ${employeeData.employeeId}: ${error.message}`);
        failed++;
      }
    }

    return { created, failed, errors };
  } catch (error) {
    logger.error('Error in bulk create employees:', error);
    throw error;
  }
};

/**
 * Get employee statistics
 */
export const getEmployeeStats = async (
  EmployeeModel: Model<IEmployee>
): Promise<{
  total: number;
  active: number;
  terminated: number;
  byDepartment: Record<string, number>;
  byLocation: Record<string, number>;
}> => {
  try {
    const [total, active, terminated, byDepartment, byLocation] = await Promise.all([
      EmployeeModel.countDocuments(),
      EmployeeModel.countDocuments({ terminationDate: { $exists: false } }),
      EmployeeModel.countDocuments({ terminationDate: { $exists: true } }),
      EmployeeModel.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]),
      EmployeeModel.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
      ]),
    ]);

    const departmentMap: Record<string, number> = {};
    byDepartment.forEach((item: any) => {
      departmentMap[item._id] = item.count;
    });

    const locationMap: Record<string, number> = {};
    byLocation.forEach((item: any) => {
      locationMap[item._id] = item.count;
    });

    return {
      total,
      active,
      terminated,
      byDepartment: departmentMap,
      byLocation: locationMap,
    };
  } catch (error) {
    logger.error('Error getting employee stats:', error);
    throw error;
  }
};

