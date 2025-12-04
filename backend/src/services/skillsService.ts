import { Connection, Model } from 'mongoose';
import { ISkills, SkillsSchema } from '../models/tenant/Skills';
import { logger } from '../utils/helpers/logger';

export interface SkillsQueryFilters {
  employeeId?: string;
  skillName?: string;
  skillLevel?: string;
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
 * Get Skills model for a specific organization connection
 */
export const getSkillsModel = (connection: Connection): Model<ISkills> => {
  if (connection.models.Skills) {
    return connection.models.Skills as Model<ISkills>;
  }
  return connection.model<ISkills>('Skills', SkillsSchema);
};

/**
 * Build query filters for skills search
 */
export const buildSkillsQuery = (filters: SkillsQueryFilters) => {
  const query: any = {};

  if (filters.employeeId) {
    query.employeeId = filters.employeeId;
  }

  if (filters.skillName) {
    query.skillName = { $regex: filters.skillName, $options: 'i' };
  }

  if (filters.skillLevel) {
    query.skillLevel = filters.skillLevel;
  }

  return query;
};

/**
 * Get skills with pagination and filters
 */
export const getSkills = async (
  SkillsModel: Model<ISkills>,
  filters: SkillsQueryFilters,
  pagination: PaginationOptions
): Promise<PaginatedResult<ISkills>> => {
  try {
    const query = buildSkillsQuery(filters);
    
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [data, total] = await Promise.all([
      SkillsModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      SkillsModel.countDocuments(query),
    ]);

    return {
      data: data as unknown as ISkills[],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  } catch (error) {
    logger.error('Error fetching skills:', error);
    throw error;
  }
};

/**
 * Get skill by ID
 */
export const getSkillById = async (
  SkillsModel: Model<ISkills>,
  skillLevelId: string
): Promise<ISkills | null> => {
  try {
    return await SkillsModel.findOne({ skillLevelId }).lean() as unknown as ISkills | null;
  } catch (error) {
    logger.error(`Error fetching skill ${skillLevelId}:`, error);
    throw error;
  }
};

/**
 * Create a new skill
 */
export const createSkill = async (
  SkillsModel: Model<ISkills>,
  skillData: Partial<ISkills>
): Promise<ISkills> => {
  try {
    // Check if skill with same employeeId and skillName already exists
    const existing = await SkillsModel.findOne({ 
      employeeId: skillData.employeeId, 
      skillName: skillData.skillName 
    });
    if (existing) {
      throw new Error(`Skill "${skillData.skillName}" already exists for employee ${skillData.employeeId}`);
    }

    const skill = new SkillsModel(skillData);
    return await skill.save();
  } catch (error) {
    logger.error('Error creating skill:', error);
    throw error;
  }
};

/**
 * Update a skill
 */
export const updateSkill = async (
  SkillsModel: Model<ISkills>,
  skillLevelId: string,
  updateData: Partial<ISkills>
): Promise<ISkills | null> => {
  try {
    // If updating skillName or employeeId, check for conflicts
    if (updateData.skillName || updateData.employeeId) {
      const existing = await SkillsModel.findOne({ 
        employeeId: updateData.employeeId || (await SkillsModel.findOne({ skillLevelId }))?.employeeId,
        skillName: updateData.skillName || (await SkillsModel.findOne({ skillLevelId }))?.skillName,
        skillLevelId: { $ne: skillLevelId }
      });
      if (existing) {
        throw new Error(`Skill "${updateData.skillName}" already exists for this employee`);
      }
    }

    const skill = await SkillsModel.findOneAndUpdate(
      { skillLevelId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return skill;
  } catch (error) {
    logger.error(`Error updating skill ${skillLevelId}:`, error);
    throw error;
  }
};

/**
 * Delete a skill
 */
export const deleteSkill = async (
  SkillsModel: Model<ISkills>,
  skillLevelId: string
): Promise<boolean> => {
  try {
    const result = await SkillsModel.deleteOne({ skillLevelId });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`Error deleting skill ${skillLevelId}:`, error);
    throw error;
  }
};

/**
 * Bulk create skills
 */
export const bulkCreateSkills = async (
  SkillsModel: Model<ISkills>,
  skills: Partial<ISkills>[]
): Promise<{ created: number; failed: number; errors: string[] }> => {
  try {
    const errors: string[] = [];
    let created = 0;
    let failed = 0;

    for (const skillData of skills) {
      try {
        // Check if skill already exists
        const existing = await SkillsModel.findOne({ 
          employeeId: skillData.employeeId, 
          skillName: skillData.skillName 
        });
        if (existing) {
          errors.push(`Skill "${skillData.skillName}" already exists for employee ${skillData.employeeId}`);
          failed++;
          continue;
        }

        const skill = new SkillsModel(skillData);
        await skill.save();
        created++;
      } catch (error: any) {
        errors.push(`Failed to create skill ${skillData.skillName} for employee ${skillData.employeeId}: ${error.message}`);
        failed++;
      }
    }

    return { created, failed, errors };
  } catch (error) {
    logger.error('Error in bulk create skills:', error);
    throw error;
  }
};

/**
 * Get skills summary statistics
 */
export const getSkillsSummary = async (
  SkillsModel: Model<ISkills>
): Promise<{
  total: number;
  bySkillLevel: Record<string, number>;
  bySkillName: Record<string, number>;
  topSkills: Array<{ skillName: string; count: number }>;
}> => {
  try {
    const [total, bySkillLevel, bySkillName, topSkills] = await Promise.all([
      SkillsModel.countDocuments(),
      SkillsModel.aggregate([
        { $group: { _id: '$skillLevel', count: { $sum: 1 } } },
      ]),
      SkillsModel.aggregate([
        { $group: { _id: '$skillName', count: { $sum: 1 } } },
      ]),
      SkillsModel.aggregate([
        { $group: { _id: '$skillName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const levelMap: Record<string, number> = {};
    bySkillLevel.forEach((item: any) => {
      levelMap[item._id] = item.count;
    });

    const nameMap: Record<string, number> = {};
    bySkillName.forEach((item: any) => {
      nameMap[item._id] = item.count;
    });

    return {
      total,
      bySkillLevel: levelMap,
      bySkillName: nameMap,
      topSkills: topSkills.map((item: any) => ({
        skillName: item._id,
        count: item.count,
      })),
    };
  } catch (error) {
    logger.error('Error getting skills summary:', error);
    throw error;
  }
};



