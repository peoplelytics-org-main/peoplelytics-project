import { Connection, Model } from 'mongoose';
import { IEmployeeFeedback, EmployeeFeedbackSchema } from '../models/tenant/Employee_Feedback';
import { logger } from '../utils/helpers/logger';

export interface EmployeeFeedbackQueryFilters {
  employeeId?: string;
  minEngagementScore?: number;
  maxEngagementScore?: number;
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
 * Get EmployeeFeedback model for a specific organization connection
 */
export const getEmployeeFeedbackModel = (connection: Connection): Model<IEmployeeFeedback> => {
  if (connection.models.EmployeeFeedback) {
    return connection.models.EmployeeFeedback as Model<IEmployeeFeedback>;
  }
  return connection.model<IEmployeeFeedback>('EmployeeFeedback', EmployeeFeedbackSchema);
};

/**
 * Build query filters for employee feedback search
 */
export const buildEmployeeFeedbackQuery = (filters: EmployeeFeedbackQueryFilters) => {
  const query: any = {};

  if (filters.employeeId) {
    query.employeeId = filters.employeeId;
  }

  if (filters.minEngagementScore !== undefined || filters.maxEngagementScore !== undefined) {
    query.engagementScore = {};
    if (filters.minEngagementScore !== undefined) {
      query.engagementScore.$gte = filters.minEngagementScore;
    }
    if (filters.maxEngagementScore !== undefined) {
      query.engagementScore.$lte = filters.maxEngagementScore;
    }
  }

  return query;
};

/**
 * Get employee feedback records with pagination and filters
 */
export const getEmployeeFeedback = async (
  EmployeeFeedbackModel: Model<IEmployeeFeedback>,
  filters: EmployeeFeedbackQueryFilters,
  pagination: PaginationOptions
): Promise<PaginatedResult<IEmployeeFeedback>> => {
  try {
    const query = buildEmployeeFeedbackQuery(filters);
    
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [data, total] = await Promise.all([
      EmployeeFeedbackModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      EmployeeFeedbackModel.countDocuments(query),
    ]);

    return {
      data: data as unknown as IEmployeeFeedback[],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  } catch (error) {
    logger.error('Error fetching employee feedback:', error);
    throw error;
  }
};

/**
 * Get employee feedback by ID
 */
export const getEmployeeFeedbackById = async (
  EmployeeFeedbackModel: Model<IEmployeeFeedback>,
  satisId: string
): Promise<IEmployeeFeedback | null> => {
  try {
    return await EmployeeFeedbackModel.findOne({ satisId }).lean() as unknown as IEmployeeFeedback | null;
  } catch (error) {
    logger.error(`Error fetching employee feedback ${satisId}:`, error);
    throw error;
  }
};

/**
 * Get employee feedback by employee ID (latest)
 */
export const getEmployeeFeedbackByEmployeeId = async (
  EmployeeFeedbackModel: Model<IEmployeeFeedback>,
  employeeId: string
): Promise<IEmployeeFeedback | null> => {
  try {
    return await EmployeeFeedbackModel.findOne({ employeeId })
      .sort({ createdAt: -1 })
      .lean() as unknown as IEmployeeFeedback | null;
  } catch (error) {
    logger.error(`Error fetching employee feedback for employee ${employeeId}:`, error);
    throw error;
  }
};

/**
 * Create a new employee feedback record
 */
export const createEmployeeFeedback = async (
  EmployeeFeedbackModel: Model<IEmployeeFeedback>,
  feedbackData: Partial<IEmployeeFeedback>
): Promise<IEmployeeFeedback> => {
  try {
    // Check if feedback with same satisId already exists
    const existing = await EmployeeFeedbackModel.findOne({ satisId: feedbackData.satisId });
    if (existing) {
      throw new Error(`Employee feedback with ID ${feedbackData.satisId} already exists`);
    }

    // Validate engagementScore is provided
    if (feedbackData.engagementScore === undefined || feedbackData.engagementScore === null) {
      throw new Error('Engagement score is required');
    }

    const feedback = new EmployeeFeedbackModel(feedbackData);
    return await feedback.save();
  } catch (error) {
    logger.error('Error creating employee feedback:', error);
    throw error;
  }
};

/**
 * Update an employee feedback record
 */
export const updateEmployeeFeedback = async (
  EmployeeFeedbackModel: Model<IEmployeeFeedback>,
  satisId: string,
  updateData: Partial<IEmployeeFeedback>
): Promise<IEmployeeFeedback | null> => {
  try {
    // If updating satisId, check for conflicts
    if (updateData.satisId && updateData.satisId !== satisId) {
      const existing = await EmployeeFeedbackModel.findOne({ satisId: updateData.satisId });
      if (existing) {
        throw new Error(`Employee feedback with ID ${updateData.satisId} already exists`);
      }
    }

    const feedback = await EmployeeFeedbackModel.findOneAndUpdate(
      { satisId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return feedback;
  } catch (error) {
    logger.error(`Error updating employee feedback ${satisId}:`, error);
    throw error;
  }
};

/**
 * Delete an employee feedback record
 */
export const deleteEmployeeFeedback = async (
  EmployeeFeedbackModel: Model<IEmployeeFeedback>,
  satisId: string
): Promise<boolean> => {
  try {
    const result = await EmployeeFeedbackModel.deleteOne({ satisId });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`Error deleting employee feedback ${satisId}:`, error);
    throw error;
  }
};

/**
 * Get employee feedback statistics
 */
export const getEmployeeFeedbackStats = async (
  EmployeeFeedbackModel: Model<IEmployeeFeedback>
): Promise<{
  total: number;
  averageEngagementScore: number;
  averageCompensationSatisfaction: number;
  averageBenefitsSatisfaction: number;
  averageManagementSatisfaction: number;
  averageTrainingSatisfaction: number;
}> => {
  try {
    const [total, stats] = await Promise.all([
      EmployeeFeedbackModel.countDocuments(),
      EmployeeFeedbackModel.aggregate([
        {
          $group: {
            _id: null,
            avgEngagement: { $avg: '$engagementScore' },
            avgCompensation: { $avg: '$compensationSatisfaction' },
            avgBenefits: { $avg: '$benefitsSatisfaction' },
            avgManagement: { $avg: '$managementSatisfaction' },
            avgTraining: { $avg: '$trainingSatisfaction' },
          },
        },
      ]),
    ]);

    const statsResult = stats[0] || {};
    return {
      total,
      averageEngagementScore: statsResult.avgEngagement || 0,
      averageCompensationSatisfaction: statsResult.avgCompensation || 0,
      averageBenefitsSatisfaction: statsResult.avgBenefits || 0,
      averageManagementSatisfaction: statsResult.avgManagement || 0,
      averageTrainingSatisfaction: statsResult.avgTraining || 0,
    };
  } catch (error) {
    logger.error('Error getting employee feedback stats:', error);
    throw error;
  }
};

