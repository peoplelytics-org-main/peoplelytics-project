import { Connection, Model } from 'mongoose';
import { IPerformanceAndEngagement, PerformanceAndEngagementSchema } from '../models/tenant/PerformanceReviews';
import { logger } from '../utils/helpers/logger';

export interface PerformanceReviewQueryFilters {
  employeeId?: string;
  performanceRating?: number;
  potentialRating?: number;
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
 * Get PerformanceAndEngagement model for a specific organization connection
 */
export const getPerformanceReviewModel = (connection: Connection): Model<IPerformanceAndEngagement> => {
  if (connection.models.PerformanceAndEngagement) {
    return connection.models.PerformanceAndEngagement as Model<IPerformanceAndEngagement>;
  }
  return connection.model<IPerformanceAndEngagement>('PerformanceAndEngagement', PerformanceAndEngagementSchema);
};

/**
 * Build query filters for performance review search
 */
export const buildPerformanceReviewQuery = (filters: PerformanceReviewQueryFilters) => {
  const query: any = {};

  if (filters.employeeId) {
    query.employeeId = filters.employeeId;
  }

  if (filters.performanceRating !== undefined) {
    query.performanceRating = filters.performanceRating;
  }

  if (filters.potentialRating !== undefined) {
    query.potentialRating = filters.potentialRating;
  }

  return query;
};

/**
 * Get all performance reviews with pagination and filtering
 */
export const getPerformanceReviews = async (
  PerformanceReviewModel: Model<IPerformanceAndEngagement>,
  filters: PerformanceReviewQueryFilters,
  pagination: PaginationOptions
): Promise<PaginatedResult<IPerformanceAndEngagement>> => {
  try {
    const query = buildPerformanceReviewQuery(filters);
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      PerformanceReviewModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PerformanceReviewModel.countDocuments(query),
    ]);

    return {
      data: data as unknown as IPerformanceAndEngagement[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    logger.error('Error fetching performance reviews:', error);
    throw new Error(`Failed to fetch performance reviews: ${error.message}`);
  }
};

/**
 * Get a single performance review by ID
 */
export const getPerformanceReviewById = async (
  PerformanceReviewModel: Model<IPerformanceAndEngagement>,
  id: string
): Promise<IPerformanceAndEngagement | null> => {
  try {
    const review = await PerformanceReviewModel.findById(id).lean();
    return review as IPerformanceAndEngagement | null;
  } catch (error: any) {
    logger.error('Error fetching performance review by ID:', error);
    throw new Error(`Failed to fetch performance review: ${error.message}`);
  }
};

/**
 * Create a new performance review
 */
export const createPerformanceReview = async (
  PerformanceReviewModel: Model<IPerformanceAndEngagement>,
  data: Partial<IPerformanceAndEngagement>
): Promise<IPerformanceAndEngagement> => {
  try {
    const review = new PerformanceReviewModel({
      employeeId: data.employeeId,
      name: data.name,
      performanceRating: data.performanceRating,
      potentialRating: data.potentialRating,
      flightRiskScore: data.flightRiskScore || 0,
      impactScore: data.impactScore || 0,
      trainingCompleted: data.trainingCompleted || 0,
      trainingTotal: data.trainingTotal || 8,
      weeklyHours: data.weeklyHours || 40,
      hasGrievance: data.hasGrievance || false,
    });
    const saved = await review.save();
    return saved.toObject() as IPerformanceAndEngagement;
  } catch (error: any) {
    logger.error('Error creating performance review:', error);
    throw new Error(`Failed to create performance review: ${error.message}`);
  }
};

/**
 * Update a performance review
 */
export const updatePerformanceReview = async (
  PerformanceReviewModel: Model<IPerformanceAndEngagement>,
  id: string,
  data: Partial<IPerformanceAndEngagement>
): Promise<IPerformanceAndEngagement | null> => {
  try {
    const updateData: any = {};
    if (data.performanceRating !== undefined) updateData.performanceRating = data.performanceRating;
    if (data.potentialRating !== undefined) updateData.potentialRating = data.potentialRating;
    if (data.flightRiskScore !== undefined) updateData.flightRiskScore = data.flightRiskScore;
    if (data.impactScore !== undefined) updateData.impactScore = data.impactScore;
    if (data.trainingCompleted !== undefined) updateData.trainingCompleted = data.trainingCompleted;
    if (data.trainingTotal !== undefined) updateData.trainingTotal = data.trainingTotal;
    if (data.weeklyHours !== undefined) updateData.weeklyHours = data.weeklyHours;
    if (data.hasGrievance !== undefined) updateData.hasGrievance = data.hasGrievance;

    const updated = await PerformanceReviewModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
    return updated as IPerformanceAndEngagement | null;
  } catch (error: any) {
    logger.error('Error updating performance review:', error);
    throw new Error(`Failed to update performance review: ${error.message}`);
  }
};

/**
 * Delete a performance review
 */
export const deletePerformanceReview = async (
  PerformanceReviewModel: Model<IPerformanceAndEngagement>,
  id: string
): Promise<boolean> => {
  try {
    const result = await PerformanceReviewModel.findByIdAndDelete(id);
    return !!result;
  } catch (error: any) {
    logger.error('Error deleting performance review:', error);
    throw new Error(`Failed to delete performance review: ${error.message}`);
  }
};

/**
 * Get performance review statistics
 */
export const getPerformanceReviewStats = async (
  PerformanceReviewModel: Model<IPerformanceAndEngagement>
): Promise<{
  totalReviews: number;
  averagePerformanceRating: number;
  averagePotentialRating: number;
  averageFlightRiskScore: number;
  averageImpactScore: number;
  highPerformers: number;
  highPotential: number;
  atRiskEmployees: number;
}> => {
  try {
    const reviews = await PerformanceReviewModel.find({}).lean();
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averagePerformanceRating: 0,
        averagePotentialRating: 0,
        averageFlightRiskScore: 0,
        averageImpactScore: 0,
        highPerformers: 0,
        highPotential: 0,
        atRiskEmployees: 0,
      };
    }

    const totals = reviews.reduce(
      (acc, review) => ({
        performanceRating: acc.performanceRating + (review.performanceRating || 0),
        potentialRating: acc.potentialRating + (review.potentialRating || 0),
        flightRiskScore: acc.flightRiskScore + (review.flightRiskScore || 0),
        impactScore: acc.impactScore + (review.impactScore || 0),
        highPerformers: acc.highPerformers + (review.performanceRating >= 4 ? 1 : 0),
        highPotential: acc.highPotential + (review.potentialRating >= 2 ? 1 : 0),
        atRiskEmployees: acc.atRiskEmployees + (review.flightRiskScore >= 3 ? 1 : 0),
      }),
      {
        performanceRating: 0,
        potentialRating: 0,
        flightRiskScore: 0,
        impactScore: 0,
        highPerformers: 0,
        highPotential: 0,
        atRiskEmployees: 0,
      }
    );

    return {
      totalReviews,
      averagePerformanceRating: totals.performanceRating / totalReviews,
      averagePotentialRating: totals.potentialRating / totalReviews,
      averageFlightRiskScore: totals.flightRiskScore / totalReviews,
      averageImpactScore: totals.impactScore / totalReviews,
      highPerformers: totals.highPerformers,
      highPotential: totals.highPotential,
      atRiskEmployees: totals.atRiskEmployees,
    };
  } catch (error: any) {
    logger.error('Error fetching performance review stats:', error);
    throw new Error(`Failed to fetch performance review statistics: ${error.message}`);
  }
};

