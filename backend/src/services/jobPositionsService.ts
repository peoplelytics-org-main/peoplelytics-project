import { Connection, Model } from 'mongoose';
import { IJobPositions, JobPositionsSchema } from '../models/tenant/JobPositions';
import { logger } from '../utils/helpers/logger';

export interface JobPositionsQueryFilters {
  department?: string;
  status?: string;
  positionType?: string;
  budgetStatus?: string;
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
 * Get JobPositions model for a specific organization connection
 */
export const getJobPositionsModel = (connection: Connection): Model<IJobPositions> => {
  if (connection.models.JobPositions) {
    return connection.models.JobPositions as Model<IJobPositions>;
  }
  return connection.model<IJobPositions>('JobPositions', JobPositionsSchema);
};

/**
 * Build query filters for job positions search
 */
export const buildJobPositionsQuery = (filters: JobPositionsQueryFilters) => {
  const query: any = {};

  if (filters.department) {
    query.department = filters.department;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.positionType) {
    query.positionType = filters.positionType;
  }

  if (filters.budgetStatus) {
    query.budgetStatus = filters.budgetStatus;
  }

  return query;
};

/**
 * Get job positions with pagination and filters
 */
export const getJobPositions = async (
  JobPositionsModel: Model<IJobPositions>,
  filters: JobPositionsQueryFilters,
  pagination: PaginationOptions
): Promise<PaginatedResult<IJobPositions>> => {
  try {
    const query = buildJobPositionsQuery(filters);
    
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [data, total] = await Promise.all([
      JobPositionsModel.find(query)
        .sort({ openDate: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      JobPositionsModel.countDocuments(query),
    ]);

    return {
      data: data as unknown as IJobPositions[],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  } catch (error) {
    logger.error('Error fetching job positions:', error);
    throw error;
  }
};

/**
 * Get job position by ID
 */
export const getJobPositionById = async (
  JobPositionsModel: Model<IJobPositions>,
  positionId: string
): Promise<IJobPositions | null> => {
  try {
    return await JobPositionsModel.findOne({ positionId }).lean() as unknown as IJobPositions | null;
  } catch (error) {
    logger.error(`Error fetching job position ${positionId}:`, error);
    throw error;
  }
};

/**
 * Create a new job position
 */
export const createJobPosition = async (
  JobPositionsModel: Model<IJobPositions>,
  positionData: Partial<IJobPositions>
): Promise<IJobPositions> => {
  try {
    // Check if position with same positionId already exists
    const existing = await JobPositionsModel.findOne({ positionId: positionData.positionId });
    if (existing) {
      throw new Error(`Job position with ID ${positionData.positionId} already exists`);
    }

    // Set default openDate if not provided
    if (!positionData.openDate) {
      positionData.openDate = new Date();
    }

    // Set default status if not provided
    if (!positionData.status) {
      positionData.status = 'Open';
    }

    const position = new JobPositionsModel(positionData);
    return await position.save();
  } catch (error) {
    logger.error('Error creating job position:', error);
    throw error;
  }
};

/**
 * Update a job position
 */
export const updateJobPosition = async (
  JobPositionsModel: Model<IJobPositions>,
  positionId: string,
  updateData: Partial<IJobPositions>
): Promise<IJobPositions | null> => {
  try {
    // If updating positionId, check for conflicts
    if (updateData.positionId && updateData.positionId !== positionId) {
      const existing = await JobPositionsModel.findOne({ positionId: updateData.positionId });
      if (existing) {
        throw new Error(`Job position with ID ${updateData.positionId} already exists`);
      }
    }

    const position = await JobPositionsModel.findOneAndUpdate(
      { positionId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return position;
  } catch (error) {
    logger.error(`Error updating job position ${positionId}:`, error);
    throw error;
  }
};

/**
 * Delete a job position
 */
export const deleteJobPosition = async (
  JobPositionsModel: Model<IJobPositions>,
  positionId: string
): Promise<boolean> => {
  try {
    const result = await JobPositionsModel.deleteOne({ positionId });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`Error deleting job position ${positionId}:`, error);
    throw error;
  }
};

/**
 * Get job positions statistics
 */
export const getJobPositionsStats = async (
  JobPositionsModel: Model<IJobPositions>
): Promise<{
  total: number;
  open: number;
  closed: number;
  onHold: number;
  byDepartment: Record<string, number>;
  byPositionType: Record<string, number>;
  byBudgetStatus: Record<string, number>;
}> => {
  try {
    const [total, open, closed, onHold, byDepartment, byPositionType, byBudgetStatus] = await Promise.all([
      JobPositionsModel.countDocuments(),
      JobPositionsModel.countDocuments({ status: 'Open' }),
      JobPositionsModel.countDocuments({ status: 'Closed' }),
      JobPositionsModel.countDocuments({ status: 'On Hold' }),
      JobPositionsModel.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]),
      JobPositionsModel.aggregate([
        { $group: { _id: '$positionType', count: { $sum: 1 } } },
      ]),
      JobPositionsModel.aggregate([
        { $group: { _id: '$budgetStatus', count: { $sum: 1 } } },
      ]),
    ]);

    const departmentMap: Record<string, number> = {};
    byDepartment.forEach((item: any) => {
      departmentMap[item._id] = item.count;
    });

    const typeMap: Record<string, number> = {};
    byPositionType.forEach((item: any) => {
      typeMap[item._id] = item.count;
    });

    const budgetMap: Record<string, number> = {};
    byBudgetStatus.forEach((item: any) => {
      budgetMap[item._id] = item.count;
    });

    return {
      total,
      open,
      closed,
      onHold,
      byDepartment: departmentMap,
      byPositionType: typeMap,
      byBudgetStatus: budgetMap,
    };
  } catch (error) {
    logger.error('Error getting job positions stats:', error);
    throw error;
  }
};



