import { Connection, Model } from 'mongoose';
import { IRecruitmentFunnels, RecruitmentFunnelsSchema } from '../models/tenant/RecruitmentFunnels';
import { logger } from '../utils/helpers/logger';

export interface RecruitmentFunnelQueryFilters {
  positionId?: string;
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


export const getRecruitmentFunnelsModel = (connection: Connection): Model<any> => {
 // Check if model is already compiled to avoid OverwriteModelError
 if (connection.models.RecruitmentFunnel) {
   return connection.models.RecruitmentFunnel;
 }
 console.log("Got it")
 return connection.model('RecruitmentFunnel', RecruitmentFunnelsSchema);
};

export const bulkCreateRecruitmentFunnels = async (
 RecruitmentFunnelModel: Model<any>, 
 funnels: any[]
): Promise<{ created: number; failed: number; errors: string[] }> => {
 let created = 0;
 let failed = 0;
 const errors: string[] = [];

 console.log(`[BulkCreate] Attempting to create ${funnels.length} records...`);

 for (const funnelData of funnels) {
   try {
     // Generate ID
     const rec_funnel_id = `rf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

     const newFunnel = new RecruitmentFunnelModel({
       rec_funnel_id: rec_funnel_id,
       positionId: funnelData.positionId,
       orgId: funnelData.organizationId, // Map organizationId to orgId
       shortlisted: funnelData.shortlisted || 0,
       interviewed: funnelData.interviewed || 0,
       offersExtended: funnelData.offersExtended || 0,
       offersAccepted: funnelData.offersAccepted || 0,
       joined: funnelData.joined || 0,
     });

     console.log(`[BulkCreate] Attempting to save funnel for position: ${funnelData.positionId}`);
     await newFunnel.save();
     console.log(`[BulkCreate] Successfully saved funnel for position: ${funnelData.positionId}`);
     created++;
   } catch (error: any) {
     failed++;
     const errorMsg = `Position ${funnelData.positionId}: ${error.message}`;
     errors.push(errorMsg);
     // Log the full error to server console for debugging
     logger.error(`[BulkCreate Error] Position: ${funnelData.positionId}`, {
       error: error.message,
       code: error.code,
       keyValue: error.keyValue,
       stack: error.stack
     }); 
   }
 }

 console.log(`[BulkCreate] Finished. Created: ${created}, Failed: ${failed}`);
 return { created, failed, errors };
};

/**
* Build query filters for recruitment funnel search
*/
export const buildRecruitmentFunnelQuery = (filters: RecruitmentFunnelQueryFilters) => {
 const query: any = {};

 if (filters.positionId) {
   query.positionId = filters.positionId;
 }

 return query;
};

/**
* Get all recruitment funnels with pagination and filtering
*/
export const getRecruitmentFunnels = async (
 RecruitmentFunnelsModel: Model<IRecruitmentFunnels>,
 filters: RecruitmentFunnelQueryFilters,
 pagination: PaginationOptions
): Promise<PaginatedResult<IRecruitmentFunnels>> => {
 try {
   const query = buildRecruitmentFunnelQuery(filters);
   const { page, limit } = pagination;
   const skip = (page - 1) * limit;

   const [data, total] = await Promise.all([
     RecruitmentFunnelsModel.find(query)
       .sort({ createdAt: -1 })
       .skip(skip)
       .limit(limit)
       .lean(),
     RecruitmentFunnelsModel.countDocuments(query),
   ]);

   return {
     data: data as unknown as IRecruitmentFunnels[],
     pagination: {
       page,
       limit,
       total,
       totalPages: Math.ceil(total / limit),
     },
   };
 } catch (error: any) {
   logger.error('Error fetching recruitment funnels:', error);
   throw new Error(`Failed to fetch recruitment funnels: ${error.message}`);
 }
};

/**
* Get a single recruitment funnel by ID
*/
export const getRecruitmentFunnelById = async (
 RecruitmentFunnelsModel: Model<IRecruitmentFunnels>,
 id: string
): Promise<IRecruitmentFunnels | null> => {
 try {
   const funnel = await RecruitmentFunnelsModel.findById(id).lean();
   return funnel as IRecruitmentFunnels | null;
 } catch (error: any) {
   logger.error('Error fetching recruitment funnel by ID:', error);
   throw new Error(`Failed to fetch recruitment funnel: ${error.message}`);
 }
};

/**
* Create a new recruitment funnel
*/
export const createRecruitmentFunnel = async (
 RecruitmentFunnelsModel: Model<IRecruitmentFunnels>,
 data: Partial<IRecruitmentFunnels>
): Promise<IRecruitmentFunnels> => {
 try {
   const funnel = new RecruitmentFunnelsModel({
     rec_funnel_id: data.rec_funnel_id,
     positionId: data.positionId,
     orgId: data.orgId,
     shortlisted: data.shortlisted || 0,
     interviewed: data.interviewed || 0,
     offersExtended: data.offersExtended || 0,
     offersAccepted: data.offersAccepted || 0,
     joined: data.joined || 0,
   });
   const saved = await funnel.save();
   return saved.toObject() as IRecruitmentFunnels;
 } catch (error: any) {
   logger.error('Error creating recruitment funnel:', error);
   if (error.code === 11000) {
     throw new Error('Recruitment funnel with this ID already exists');
   }
   throw new Error(`Failed to create recruitment funnel: ${error.message}`);
 }
};

/**
* Update a recruitment funnel
*/
export const updateRecruitmentFunnel = async (
 RecruitmentFunnelsModel: Model<IRecruitmentFunnels>,
 id: string,
 data: Partial<IRecruitmentFunnels>
): Promise<IRecruitmentFunnels | null> => {
 try {
   const updated = await RecruitmentFunnelsModel.findByIdAndUpdate(
     id,
     {
       $set: {
         ...(data.shortlisted !== undefined && { shortlisted: data.shortlisted }),
         ...(data.interviewed !== undefined && { interviewed: data.interviewed }),
         ...(data.offersExtended !== undefined && { offersExtended: data.offersExtended }),
         ...(data.offersAccepted !== undefined && { offersAccepted: data.offersAccepted }),
         ...(data.joined !== undefined && { joined: data.joined }),
       },
     },
     { new: true, runValidators: true }
   ).lean();
   return updated as IRecruitmentFunnels | null;
 } catch (error: any) {
   logger.error('Error updating recruitment funnel:', error);
   throw new Error(`Failed to update recruitment funnel: ${error.message}`);
 }
};

/**
* Delete a recruitment funnel
*/
export const deleteRecruitmentFunnel = async (
 RecruitmentFunnelsModel: Model<IRecruitmentFunnels>,
 id: string
): Promise<boolean> => {
 try {
   const result = await RecruitmentFunnelsModel.findByIdAndDelete(id);
   return !!result;
 } catch (error: any) {
   logger.error('Error deleting recruitment funnel:', error);
   throw new Error(`Failed to delete recruitment funnel: ${error.message}`);
 }
};

/**
* Get recruitment funnel statistics
*/
export const getRecruitmentFunnelStats = async (
 RecruitmentFunnelsModel: Model<IRecruitmentFunnels>
): Promise<{
 totalFunnels: number;
 totalShortlisted: number;
 totalInterviewed: number;
 totalOffersExtended: number;
 totalOffersAccepted: number;
 totalJoined: number;
 averageConversionRate: number;
}> => {
 try {
   const funnels = await RecruitmentFunnelsModel.find({}).lean();
   const totalFunnels = funnels.length;
   
   const totals = funnels.reduce(
     (acc, funnel) => ({
       shortlisted: acc.shortlisted + (funnel.shortlisted || 0),
       interviewed: acc.interviewed + (funnel.interviewed || 0),
       offersExtended: acc.offersExtended + (funnel.offersExtended || 0),
       offersAccepted: acc.offersAccepted + (funnel.offersAccepted || 0),
       joined: acc.joined + (funnel.joined || 0),
     }),
     { shortlisted: 0, interviewed: 0, offersExtended: 0, offersAccepted: 0, joined: 0 }
   );

   const averageConversionRate =
     totals.shortlisted > 0 ? totals.joined / totals.shortlisted : 0;

   return {
     totalFunnels,
     totalShortlisted: totals.shortlisted,
     totalInterviewed: totals.interviewed,
     totalOffersExtended: totals.offersExtended,
     totalOffersAccepted: totals.offersAccepted,
     totalJoined: totals.joined,
     averageConversionRate,
   };
 } catch (error: any) {
   logger.error('Error fetching recruitment funnel stats:', error);
   throw new Error(`Failed to fetch recruitment funnel statistics: ${error.message}`);
 }
};