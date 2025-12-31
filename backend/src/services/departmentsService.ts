import { Connection, Model } from 'mongoose';
import { IDepartments, DepartmentsSchema } from '../models/tenant/Departments';
import { logger } from '../utils/helpers/logger';

export interface DepartmentsQueryFilters {
  name?: string;
  location?: string;
  headOfDepartment?: string;
  isActive?: boolean;
  search?: string;
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
 * Get Departments model for a specific organization connection
 */
export const getDepartmentsModel = (connection: Connection): Model<IDepartments> => {
  if (connection.models.Departments) {
    return connection.models.Departments as Model<IDepartments>;
  }
  return connection.model<IDepartments>('Departments', DepartmentsSchema);
};

/**
 * Build query filters for departments search
 */
export const buildDepartmentsQuery = (filters: DepartmentsQueryFilters) => {
  const query: any = {};

  if (filters.name) {
    query.name = { $regex: filters.name, $options: 'i' };
  }

  if (filters.location) {
    query.location = filters.location;
  }

  if (filters.headOfDepartment) {
    query.headOfDepartment = filters.headOfDepartment;
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { departmentId: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { headOfDepartment: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return query;
};

/**
 * Get all departments with pagination and filters
 */
export const getDepartments = async (
  DepartmentsModel: Model<IDepartments>,
  filters: DepartmentsQueryFilters,
  pagination: PaginationOptions
): Promise<PaginatedResult<IDepartments>> => {
  try {
    const query = buildDepartmentsQuery(filters);
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      DepartmentsModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec() as unknown as Promise<IDepartments[]>,
      DepartmentsModel.countDocuments(query),
    ]);

    return {
      data: departments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error fetching departments:', error);
    throw error;
  }
};

/**
 * Get department by ID
 */
export const getDepartmentById = async (
  DepartmentsModel: Model<IDepartments>,
  departmentId: string
): Promise<IDepartments | null> => {
  try {
    const department = (await DepartmentsModel.findOne({ departmentId }).lean()) as IDepartments | null;
    return department;
  } catch (error) {
    logger.error('Error fetching department by ID:', error);
    throw error;
  }
};

/**
 * Create a new department
 */
export const createDepartment = async (
  DepartmentsModel: Model<IDepartments>,
  departmentData: Partial<IDepartments>
): Promise<IDepartments> => {
  try {
    const department = await DepartmentsModel.create(departmentData);
    return department.toObject() as IDepartments;
  } catch (error) {
    logger.error('Error creating department:', error);
    throw error;
  }
};

/**
 * Update a department
 */
export const updateDepartment = async (
  DepartmentsModel: Model<IDepartments>,
  departmentId: string,
  updateData: Partial<IDepartments>
): Promise<IDepartments | null> => {
  try {
    const department = (await DepartmentsModel.findOneAndUpdate(
      { departmentId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean()) as IDepartments | null;
    return department;
  } catch (error) {
    logger.error('Error updating department:', error);
    throw error;
  }
};

/**
 * Delete a department
 */
export const deleteDepartment = async (
  DepartmentsModel: Model<IDepartments>,
  departmentId: string
): Promise<boolean> => {
  try {
    const result = await DepartmentsModel.deleteOne({ departmentId });
    return result.deletedCount === 1;
  } catch (error) {
    logger.error('Error deleting department:', error);
    throw error;
  }
};

/**
 * Get departments statistics
 */
export const getDepartmentsStats = async (
  DepartmentsModel: Model<IDepartments>
): Promise<{
  total: number;
  active: number;
  inactive: number;
  totalBudget: number;
  byLocation: Record<string, number>;
}> => {
  try {
    const [total, active, allDepartments] = await Promise.all([
      DepartmentsModel.countDocuments(),
      DepartmentsModel.countDocuments({ isActive: true }),
      DepartmentsModel.find().lean().exec() as unknown as Promise<IDepartments[]>,
    ]);

    const totalBudget = allDepartments.reduce((sum, dept) => sum + (dept.budget || 0), 0);
    const byLocation: Record<string, number> = {};
    
    allDepartments.forEach(dept => {
      const loc = dept.location || 'Unknown';
      byLocation[loc] = (byLocation[loc] || 0) + 1;
    });

    return {
      total,
      active,
      inactive: total - active,
      totalBudget,
      byLocation,
    };
  } catch (error) {
    logger.error('Error fetching departments stats:', error);
    throw error;
  }
};



