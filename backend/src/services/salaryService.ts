import { Connection, Model } from 'mongoose';
import { ISalaryAndCompensation, SalaryAndCompensationSchema } from '../models/tenant/Salary';
import { logger } from '../utils/helpers/logger';

export interface SalaryQueryFilters {
  employeeId?: string;
  name?: string;
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
 * Get Salary model for a specific organization connection
 */
export const getSalaryModel = (connection: Connection): Model<ISalaryAndCompensation> => {
  if (connection.models.SalaryAndCompensation) {
    return connection.models.SalaryAndCompensation as Model<ISalaryAndCompensation>;
  }
  return connection.model<ISalaryAndCompensation>('SalaryAndCompensation', SalaryAndCompensationSchema);
};

/**
 * Build query filters for salary search
 */
export const buildSalaryQuery = (filters: SalaryQueryFilters) => {
  const query: any = {};

  if (filters.employeeId) {
    query.employeeId = filters.employeeId;
  }

  if (filters.name) {
    query.name = { $regex: filters.name, $options: 'i' };
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { salaryId: { $regex: filters.search, $options: 'i' } },
      { employeeId: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return query;
};

/**
 * Get all salary records with pagination and filters
 */
export const getSalaryRecords = async (
  SalaryModel: Model<ISalaryAndCompensation>,
  filters: SalaryQueryFilters,
  pagination: PaginationOptions
): Promise<PaginatedResult<ISalaryAndCompensation>> => {
  try {
    const query = buildSalaryQuery(filters);
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [salaries, total] = await Promise.all([
      SalaryModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec() as unknown as Promise<ISalaryAndCompensation[]>,
      SalaryModel.countDocuments(query),
    ]);

    return {
      data: salaries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error fetching salary records:', error);
    throw error;
  }
};

/**
 * Get salary by ID
 */
export const getSalaryById = async (
  SalaryModel: Model<ISalaryAndCompensation>,
  salaryId: string
): Promise<ISalaryAndCompensation | null> => {
  try {
    const salary = (await SalaryModel.findOne({ salaryId }).lean()) as ISalaryAndCompensation | null;
    return salary;
  } catch (error) {
    logger.error('Error fetching salary by ID:', error);
    throw error;
  }
};

/**
 * Get salary by employee ID
 */
export const getSalaryByEmployeeId = async (
  SalaryModel: Model<ISalaryAndCompensation>,
  employeeId: string
): Promise<ISalaryAndCompensation | null> => {
  try {
    const salary = (await SalaryModel.findOne({ employeeId }).lean()) as ISalaryAndCompensation | null;
    return salary;
  } catch (error) {
    logger.error('Error fetching salary by employee ID:', error);
    throw error;
  }
};

/**
 * Create a new salary record
 */
export const createSalary = async (
  SalaryModel: Model<ISalaryAndCompensation>,
  salaryData: Partial<ISalaryAndCompensation>
): Promise<ISalaryAndCompensation> => {
  try {
    const salary = await SalaryModel.create(salaryData);
    return salary.toObject() as ISalaryAndCompensation;
  } catch (error) {
    logger.error('Error creating salary:', error);
    throw error;
  }
};

/**
 * Update a salary record
 */
export const updateSalary = async (
  SalaryModel: Model<ISalaryAndCompensation>,
  salaryId: string,
  updateData: Partial<ISalaryAndCompensation>
): Promise<ISalaryAndCompensation | null> => {
  try {
    const salary = (await SalaryModel.findOneAndUpdate(
      { salaryId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean()) as ISalaryAndCompensation | null;
    return salary;
  } catch (error) {
    logger.error('Error updating salary:', error);
    throw error;
  }
};

/**
 * Delete a salary record
 */
export const deleteSalary = async (
  SalaryModel: Model<ISalaryAndCompensation>,
  salaryId: string
): Promise<boolean> => {
  try {
    const result = await SalaryModel.deleteOne({ salaryId });
    return result.deletedCount === 1;
  } catch (error) {
    logger.error('Error deleting salary:', error);
    throw error;
  }
};

/**
 * Get salary statistics
 */
export const getSalaryStats = async (
  SalaryModel: Model<ISalaryAndCompensation>
): Promise<{
  total: number;
  totalSalary: number;
  averageSalary: number;
  totalBonus: number;
  averageBonus: number;
  employeesWithRaises: number;
}> => {
  try {
    const allSalaries = await SalaryModel.find().lean() as unknown as ISalaryAndCompensation[];
    
    const total = allSalaries.length;
    const totalSalary = allSalaries.reduce((sum, sal) => sum + (sal.salary || 0), 0);
    const averageSalary = total > 0 ? totalSalary / total : 0;
    const totalBonus = allSalaries.reduce((sum, sal) => sum + (sal.bonus || 0), 0);
    const averageBonus = total > 0 ? totalBonus / total : 0;
    const employeesWithRaises = allSalaries.filter(sal => sal.lastRaiseAmount && sal.lastRaiseAmount > 0).length;

    return {
      total,
      totalSalary,
      averageSalary,
      totalBonus,
      averageBonus,
      employeesWithRaises,
    };
  } catch (error) {
    logger.error('Error fetching salary stats:', error);
    throw error;
  }
};



