import { Connection, Model } from 'mongoose';
import { IExitInterviews, ExitInterviewsSchema } from '../models/tenant/ExitInterviews';
import { logger } from '../utils/helpers/logger';

export interface ExitInterviewQueryFilters {
  employeeId?: string;
  primaryReasonForLeaving?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
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
 * Get ExitInterviews model for a specific organization connection
 */
export const getExitInterviewModel = (connection: Connection): Model<IExitInterviews> => {
  if (connection.models.ExitInterviews) {
    return connection.models.ExitInterviews as Model<IExitInterviews>;
  }
  return connection.model<IExitInterviews>('ExitInterviews', ExitInterviewsSchema);
};

/**
 * Build query filters for exit interview search
 */
export const buildExitInterviewQuery = (filters: ExitInterviewQueryFilters) => {
  const query: any = {};

  if (filters.employeeId) {
    query.employeeId = filters.employeeId;
  }

  if (filters.primaryReasonForLeaving) {
    query.primaryReasonForLeaving = { $regex: filters.primaryReasonForLeaving, $options: 'i' };
  }

  if (filters.sentiment) {
    query.$or = [
      { 'management.sentiment': filters.sentiment },
      { 'compensation.sentiment': filters.sentiment },
      { 'culture.sentiment': filters.sentiment },
    ];
  }

  return query;
};

/**
 * Get all exit interviews with pagination and filtering
 */
export const getExitInterviews = async (
  ExitInterviewModel: Model<IExitInterviews>,
  filters: ExitInterviewQueryFilters,
  pagination: PaginationOptions
): Promise<PaginatedResult<IExitInterviews>> => {
  try {
    const query = buildExitInterviewQuery(filters);
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ExitInterviewModel.find(query)
        .sort({ analyzedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ExitInterviewModel.countDocuments(query),
    ]);

    return {
      data: data as unknown as IExitInterviews[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    logger.error('Error fetching exit interviews:', error);
    throw new Error(`Failed to fetch exit interviews: ${error.message}`);
  }
};

/**
 * Get a single exit interview by ID
 */
export const getExitInterviewById = async (
  ExitInterviewModel: Model<IExitInterviews>,
  id: string
): Promise<IExitInterviews | null> => {
  try {
    const interview = await ExitInterviewModel.findById(id).lean();
    return interview as IExitInterviews | null;
  } catch (error: any) {
    logger.error('Error fetching exit interview by ID:', error);
    throw new Error(`Failed to fetch exit interview: ${error.message}`);
  }
};

/**
 * Create a new exit interview
 */
export const createExitInterview = async (
  ExitInterviewModel: Model<IExitInterviews>,
  data: Partial<IExitInterviews>
): Promise<IExitInterviews> => {
  try {
    const interview = new ExitInterviewModel({
      employeeId: data.employeeId,
      orgId: data.orgId,
      primaryReasonForLeaving: data.primaryReasonForLeaving,
      secondaryReasonForLeaving: data.secondaryReasonForLeaving,
      management: data.management,
      compensation: data.compensation,
      culture: data.culture,
      analyzedAt: data.analyzedAt || new Date(),
    });
    const saved = await interview.save();
    return saved.toObject() as IExitInterviews;
  } catch (error: any) {
    logger.error('Error creating exit interview:', error);
    throw new Error(`Failed to create exit interview: ${error.message}`);
  }
};

/**
 * Update an exit interview
 */
export const updateExitInterview = async (
  ExitInterviewModel: Model<IExitInterviews>,
  id: string,
  data: Partial<IExitInterviews>
): Promise<IExitInterviews | null> => {
  try {
    const updateData: any = {};
    if (data.primaryReasonForLeaving !== undefined) updateData.primaryReasonForLeaving = data.primaryReasonForLeaving;
    if (data.secondaryReasonForLeaving !== undefined) updateData.secondaryReasonForLeaving = data.secondaryReasonForLeaving;
    if (data.management !== undefined) updateData.management = data.management;
    if (data.compensation !== undefined) updateData.compensation = data.compensation;
    if (data.culture !== undefined) updateData.culture = data.culture;

    const updated = await ExitInterviewModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
    return updated as IExitInterviews | null;
  } catch (error: any) {
    logger.error('Error updating exit interview:', error);
    throw new Error(`Failed to update exit interview: ${error.message}`);
  }
};

/**
 * Delete an exit interview
 */
export const deleteExitInterview = async (
  ExitInterviewModel: Model<IExitInterviews>,
  id: string
): Promise<boolean> => {
  try {
    const result = await ExitInterviewModel.findByIdAndDelete(id);
    return !!result;
  } catch (error: any) {
    logger.error('Error deleting exit interview:', error);
    throw new Error(`Failed to delete exit interview: ${error.message}`);
  }
};

/**
 * Get exit interview statistics
 */
export const getExitInterviewStats = async (
  ExitInterviewModel: Model<IExitInterviews>
): Promise<{
  totalInterviews: number;
  reasonsForLeaving: { [key: string]: number };
  sentimentBreakdown: {
    management: { Positive: number; Neutral: number; Negative: number };
    compensation: { Positive: number; Neutral: number; Negative: number };
    culture: { Positive: number; Neutral: number; Negative: number };
  };
  overallSentiment: { Positive: number; Neutral: number; Negative: number };
}> => {
  try {
    const interviews = await ExitInterviewModel.find({}).lean();
    const totalInterviews = interviews.length;

    const reasonsForLeaving: { [key: string]: number } = {};
    const sentimentBreakdown = {
      management: { Positive: 0, Neutral: 0, Negative: 0 },
      compensation: { Positive: 0, Neutral: 0, Negative: 0 },
      culture: { Positive: 0, Neutral: 0, Negative: 0 },
    };
    const overallSentiment = { Positive: 0, Neutral: 0, Negative: 0 };

    interviews.forEach((interview) => {
      // Count reasons for leaving
      const reason = interview.primaryReasonForLeaving;
      reasonsForLeaving[reason] = (reasonsForLeaving[reason] || 0) + 1;

      // Count sentiment breakdown
      if (interview.management?.sentiment) {
        sentimentBreakdown.management[interview.management.sentiment]++;
      }
      if (interview.compensation?.sentiment) {
        sentimentBreakdown.compensation[interview.compensation.sentiment]++;
      }
      if (interview.culture?.sentiment) {
        sentimentBreakdown.culture[interview.culture.sentiment]++;
      }

      // Calculate overall sentiment (majority wins)
      const sentiments = [
        interview.management?.sentiment,
        interview.compensation?.sentiment,
        interview.culture?.sentiment,
      ].filter(Boolean) as ('Positive' | 'Neutral' | 'Negative')[];

      const positiveCount = sentiments.filter((s) => s === 'Positive').length;
      const negativeCount = sentiments.filter((s) => s === 'Negative').length;

      if (positiveCount > negativeCount) {
        overallSentiment.Positive++;
      } else if (negativeCount > positiveCount) {
        overallSentiment.Negative++;
      } else {
        overallSentiment.Neutral++;
      }
    });

    return {
      totalInterviews,
      reasonsForLeaving,
      sentimentBreakdown,
      overallSentiment,
    };
  } catch (error: any) {
    logger.error('Error fetching exit interview stats:', error);
    throw new Error(`Failed to fetch exit interview statistics: ${error.message}`);
  }
};

