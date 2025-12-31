import { Connection, Model } from 'mongoose';
import { ILeaves, LeavesSchema } from '../models/tenant/Leaves';
import { logger } from '../utils/helpers/logger';

export interface LeavesQueryFilters {
  employeeId?: string;
  leaveType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
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

export const getLeavesModel = (connection: Connection): Model<ILeaves> => {
  if (connection.models.Leaves) {
    return connection.models.Leaves as Model<ILeaves>;
  }
  return connection.model<ILeaves>('Leaves', LeavesSchema);
};

export const buildLeavesQuery = (filters: LeavesQueryFilters) => {
  const query: any = {};
  if (filters.employeeId) query.employeeId = filters.employeeId;
  if (filters.leaveType) query.leaveType = filters.leaveType;
  if (filters.status) query.status = filters.status;
  if (filters.startDate || filters.endDate) {
    query.$or = [
      { startDate: { $gte: filters.startDate ? new Date(filters.startDate) : undefined, $lte: filters.endDate ? new Date(filters.endDate) : undefined } },
      { endDate: { $gte: filters.startDate ? new Date(filters.startDate) : undefined, $lte: filters.endDate ? new Date(filters.endDate) : undefined } },
    ];
    if (!filters.startDate) delete query.$or[0].startDate.$gte;
    if (!filters.endDate) delete query.$or[0].startDate.$lte;
    if (!filters.startDate) delete query.$or[1].endDate.$gte;
    if (!filters.endDate) delete query.$or[1].endDate.$lte;
  }
  if (filters.search) {
    query.$or = [
      { employeeName: { $regex: filters.search, $options: 'i' } },
      { leaveId: { $regex: filters.search, $options: 'i' } },
      { reason: { $regex: filters.search, $options: 'i' } },
    ];
  }
  return query;
};

export const getLeaves = async (
  LeavesModel: Model<ILeaves>,
  filters: LeavesQueryFilters,
  pagination: PaginationOptions
): Promise<PaginatedResult<ILeaves>> => {
  try {
    const query = buildLeavesQuery(filters);
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [leaves, total] = await Promise.all([
      LeavesModel.find(query).sort({ startDate: -1 }).skip(skip).limit(limit).lean().exec() as unknown as Promise<ILeaves[]>,
      LeavesModel.countDocuments(query),
    ]);
    return { data: leaves, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  } catch (error) {
    logger.error('Error fetching leaves:', error);
    throw error;
  }
};

export const getLeaveById = async (LeavesModel: Model<ILeaves>, leaveId: string): Promise<ILeaves | null> => {
  try {
    return (await LeavesModel.findOne({ leaveId }).lean()) as ILeaves | null;
  } catch (error) {
    logger.error('Error fetching leave by ID:', error);
    throw error;
  }
};

export const createLeave = async (LeavesModel: Model<ILeaves>, leaveData: Partial<ILeaves>): Promise<ILeaves> => {
  try {
    const leave = await LeavesModel.create(leaveData);
    return leave.toObject() as ILeaves;
  } catch (error) {
    logger.error('Error creating leave:', error);
    throw error;
  }
};

export const updateLeave = async (LeavesModel: Model<ILeaves>, leaveId: string, updateData: Partial<ILeaves>): Promise<ILeaves | null> => {
  try {
    return (await LeavesModel.findOneAndUpdate({ leaveId }, { $set: updateData }, { new: true, runValidators: true }).lean()) as ILeaves | null;
  } catch (error) {
    logger.error('Error updating leave:', error);
    throw error;
  }
};

export const deleteLeave = async (LeavesModel: Model<ILeaves>, leaveId: string): Promise<boolean> => {
  try {
    const result = await LeavesModel.deleteOne({ leaveId });
    return result.deletedCount === 1;
  } catch (error) {
    logger.error('Error deleting leave:', error);
    throw error;
  }
};

export const getLeavesStats = async (LeavesModel: Model<ILeaves>): Promise<{
  total: number;
  totalDays: number;
  averageDays: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  pendingApproval: number;
}> => {
  try {
    const allLeaves = await LeavesModel.find().lean() as unknown as ILeaves[];
    const total = allLeaves.length;
    const totalDays = allLeaves.reduce((sum, leave) => sum + (leave.days || 0), 0);
    const averageDays = total > 0 ? totalDays / total : 0;
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let pendingApproval = 0;
    allLeaves.forEach(leave => {
      byType[leave.leaveType] = (byType[leave.leaveType] || 0) + 1;
      byStatus[leave.status] = (byStatus[leave.status] || 0) + 1;
      if (leave.status === 'Pending') pendingApproval++;
    });
    return { total, totalDays, averageDays, byType, byStatus, pendingApproval };
  } catch (error) {
    logger.error('Error fetching leaves stats:', error);
    throw error;
  }
};



