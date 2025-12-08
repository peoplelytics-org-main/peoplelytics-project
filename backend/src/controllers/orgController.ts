import { Request, Response } from 'express';
import { Organization } from '../models/shared/Organization'
import { DatabaseService } from "../services/tenant/databaseService";
import { logger } from '../utils/helpers/logger';
import mongoose from 'mongoose';

const dbService = DatabaseService.getInstance();


// Function to add organization
export const addOrganization = async (orgData: any) => {
  // Check if organization already exists
  const existingOrg = await Organization.findOne({ name: orgData.name });
  if (existingOrg) {
    throw new Error(`Organization "${orgData.name}" already exists`);
  }

  // Auto-generate orgId

  const orgSlug = orgData.name
  .toLowerCase()
  .replace(/\s+/g, '-')     // Replace one or more spaces with a single hyphen
  .replace(/[^a-z0-9-]/g, '');

  const orgId = `org_${orgSlug}`;

  // Set default start and end dates
  const startDate = orgData.subscriptionStartDate
    ? new Date(orgData.subscriptionStartDate)
    : new Date();

  const endDate = orgData.subscriptionEndDate
    ? new Date(orgData.subscriptionEndDate)
    : new Date(startDate.getTime());

  if (!orgData.subscriptionEndDate) {
    endDate.setMonth(startDate.getMonth() + (orgData.duration || 6));
  }

  // Create the new organization
  const newOrg = await Organization.create({
    orgId,
    name: orgData.name,
    subscriptionStartDate: startDate,
    subscriptionEndDate: endDate,
    status: orgData.status || "Active",
    package: orgData.package || "Basic",
    quota: orgData.quota || 0,
  });

  console.log(`✅ Organization "${newOrg.name}" added successfully`);
  return newOrg;
};

/**
 * Get all organizations
 */
export const getAllOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, package: pkg } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (pkg) filter.package = pkg;

    const organizations = await Organization.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations
    });
  } catch (error) {
    logger.error('Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get organization by ID or orgId
 */
export const getOrganizationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgId } = req.params;

    const organization = await Organization.findOne({ orgId: orgId });

    if (!organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
      return;
    }

    // Get database stats
    const stats = await dbService.getOrganizationStats(organization.orgId);

    res.status(200).json({
      success: true,
      data: {
        ...organization.toObject(),
        databaseStats: stats
      }
    });
  } catch (error) {
    logger.error('Error fetching organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const searchOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query; // Get search term from query params (e.g., ?query=inn)

    console.log('------------------------------------------------');
    console.log('1. Search Query:', query);
    console.log('2. Current DB Name:', mongoose.connection.name); 
    console.log('3. Host:', mongoose.connection.host);

    // If query is empty or too short, return empty array
    if (!query || typeof query !== 'string' || query.length < 2) {
      res.status(200).json({
        success: true,
        data: []
      });
      return;
    }

    // Perform a case-insensitive Regex search on both Name and OrgID
    // .select('orgId name') ensures we ONLY send back what is needed (Security best practice)
    // .limit(5) ensures the UI isn't overwhelmed with huge lists
    const organizations = await Organization.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { orgId: { $regex: query, $options: 'i' } }
      ]
    })
    .select('orgId name') 
    .limit(5);

    res.status(200).json({
      success: true,
      data: organizations
    });

  } catch (error) {
    // logger.error('Error searching organizations:', error); 
    // Use console.error if logger is not available in context
    console.error('Error searching organizations:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to search organizations'
    });
  }
};

/**
 * Update organization
 */
export const updateOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgId } = req.params;
    const { name, subscriptionStartDate, subscriptionEndDate, status, package: pkg, quota, settings, features } = req.body;

    const updateData: any = {};
    
    if (name !== undefined) {
      // Check if new name already exists (excluding current org)
      const existingOrg = await Organization.findOne({ 
        name, 
        orgId: { $ne: orgId } // Find if name exists on a *different* org
      });
      if (existingOrg) {
        res.status(409).json({
          success: false,
          message: `Organization name "${name}" is already taken`
        });
        return;
      }
      updateData.name = name;
    }
    
    if (subscriptionStartDate !== undefined) updateData.subscriptionStartDate = new Date(subscriptionStartDate);
    if (subscriptionEndDate !== undefined) updateData.subscriptionEndDate = new Date(subscriptionEndDate);
    if (status !== undefined) updateData.status = status;
    if (pkg !== undefined) updateData.package = pkg;
    if (quota !== undefined) updateData.quota = quota;
    if (settings !== undefined) updateData.settings = settings;
    if (features !== undefined) updateData.features = features;

    const updatedOrg = await Organization.findOneAndUpdate(
      
      { orgId: orgId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedOrg) {
      res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
      return;
    }

    logger.info(`✅ Organization "${updatedOrg.name}" updated successfully`);

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: updatedOrg
    });
  } catch (error) {
    logger.error('Error updating organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Soft delete organization (mark as Inactive)
 */
export const softDeleteOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgId } = req.params;

    const organization = await Organization.findOneAndUpdate(
      { orgId: orgId },
      { 
        $set: { 
          status: 'Inactive',
          updatedAt: new Date()
        } 
      },
      { new: true }
    );

    if (!organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
      return;
    }

    logger.info(`⚠️  Organization "${organization.name}" marked as Inactive`);

    res.status(200).json({
      success: true,
      message: 'Organization deactivated successfully',
      data: organization
    });
  } catch (error) {
    logger.error('Error deactivating organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate organization',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete organization permanently (hard delete)
 * Deletes from both master_db and drops organization database
 */
export const deleteOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgId } = req.params;
    const { confirm } = req.body;

    // Safety check - require confirmation
    if (confirm !== 'DELETE') {
      res.status(400).json({
        success: false,
        message: 'Please confirm deletion by sending { "confirm": "DELETE" } in request body'
      });
      return;
    }

    // Find organization first
    const organization = await Organization.findOne({ orgId: orgId });

    if (!organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
      return;
    }

    const orgName = organization.name;
    const actualOrgId = organization.orgId;

    logger.warn(`⚠️  Starting permanent deletion of organization: ${orgName} (${actualOrgId})`);

    let masterDbDeleted = false;
    let orgDbDeleted = false;
    const errors: string[] = [];

    try {
      // Step 1: Delete organization database
      orgDbDeleted = await dbService.deleteOrganizationDatabase(actualOrgId);
      if (!orgDbDeleted) {
        errors.push('Failed to delete organization database');
      }
    } catch (error) {
      errors.push(`Database deletion error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      // Step 2: Delete from master_db
      const deleteResult = await Organization.findByIdAndDelete(organization._id);
      masterDbDeleted = deleteResult !== null;
      if (!masterDbDeleted) {
        errors.push('Failed to delete organization from master_db');
      }
    } catch (error) {
      errors.push(`Master DB deletion error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const success = masterDbDeleted && orgDbDeleted;

    if (success) {
      logger.info(`✅ Successfully deleted organization: ${orgName} (${actualOrgId})`);
      res.status(200).json({
        success: true,
        message: 'Organization deleted permanently',
        details: {
          organizationName: orgName,
          orgId: actualOrgId,
          masterDbDeleted,
          databaseDeleted: orgDbDeleted
        }
      });
    } else {
      logger.error(`❌ Partial deletion for organization: ${orgName}. Errors: ${errors.join(', ')}`);
      res.status(500).json({
        success: false,
        message: 'Failed to delete organization completely',
        details: {
          organizationName: orgName,
          orgId: actualOrgId,
          masterDbDeleted,
          databaseDeleted: orgDbDeleted,
          errors
        }
      });
    }
  } catch (error) {
    logger.error('Error deleting organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete organization',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Restore organization (change status back to Active)
 */
export const restoreOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgId } = req.params;

    const organization = await Organization.findOneAndUpdate(
      {orgId:orgId},
      { 
        $set: { 
          status: 'Active',
          updatedAt: new Date()
        } 
      },
      { new: true }
    );

    if (!organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
      return;
    }

    logger.info(`✅ Organization "${organization.name}" restored to Active`);

    res.status(200).json({
      success: true,
      message: 'Organization restored successfully',
      data: organization
    });
  } catch (error) {
    logger.error('Error restoring organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore organization',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get organization database statistics
 */
export const getOrganizationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgId } = req.params;

    // Find organization to get actual orgId
    const organization = await Organization.findOne({ orgId: orgId });

    if (!organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
      return;
    }

    const stats = await dbService.getOrganizationStats(organization.orgId);

    if (!stats) {
      res.status(404).json({
        success: false,
        message: 'Organization database not found or not accessible'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching organization stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Check organization database health
 */
export const checkOrganizationHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgId } = req.params;

    // Find organization to get actual orgId
    const organization = await Organization.findOne({ orgId: orgId });

    if (!organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found in master_db'
      });
      return;
    }

    const dbExists = await dbService.organizationDatabaseExists(organization.orgId);

    res.status(200).json({
      success: true,
      data: {
        organizationName: organization.name,
        orgId: organization.orgId,
        status: organization.status,
        databaseExists: dbExists,
        databaseHealth: dbExists ? 'healthy' : 'not_found'
      }
    });
  } catch (error) {
    logger.error('Error checking organization health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check organization health',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * List all organization databases
 */
export const listOrganizationDatabases = async (req: Request, res: Response): Promise<void> => {
  try {
    const databases = await dbService.listOrganizationDatabases();

    res.status(200).json({
      success: true,
      count: databases.length,
      data: databases
    });
  } catch (error) {
    logger.error('Error listing organization databases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list organization databases',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};