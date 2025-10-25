import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/tenant/databaseService';
import { logger } from '../utils/helpers/logger';

// Extend Request interface to include organization context
declare global {
  namespace Express {
    interface Request {
      organizationId?: string;
      organizationConnection?: any;
    }
  }
}

/**
 * Middleware to extract organization ID from request
 * Supports multiple methods:
 * 1. Header: X-Organization-ID
 * 2. Query parameter: orgId
 * 3. JWT token payload
 * 4. Subdomain: org123.peoplelytics.com
 */
export const extractOrganizationId = (req: Request, res: Response, next: NextFunction) => {
  try {
    let orgId: string | undefined;

    // Method 1: Header
    if (req.headers['x-organization-id']) {
      orgId = req.headers['x-organization-id'] as string;
    }
    // Method 2: Query parameter
    else if (req.query.orgId) {
      orgId = req.query.orgId as string;
    }
    // Method 3: JWT token (if available in req.user)
    else if ((req as any).user?.organizationId) {
      orgId = (req as any).user.organizationId;
    }
    // Method 4: Subdomain
    else if (req.hostname) {
      const subdomain = req.hostname.split('.')[0];
      if (subdomain && subdomain.startsWith('org')) {
        orgId = subdomain.replace('org', '');
      }
    }

    if (orgId) {
      req.organizationId = orgId;
      logger.info(`Organization ID extracted: ${orgId}`);
    } else {
      logger.warn('No organization ID found in request');
    }

    next();
  } catch (error) {
    logger.error('Error extracting organization ID:', error);
    next(error);
  }
};

/**
 * Middleware to validate organization access and set up database connection
 */
export const validateOrganizationAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.organizationId;

    if (!orgId) {
      return res.status(400).json({
        error: 'Organization ID is required',
        code: 'MISSING_ORG_ID'
      });
    }

    // Validate organization ID format
    if (!/^[a-zA-Z0-9_-]+$/.test(orgId)) {
      return res.status(400).json({
        error: 'Invalid organization ID format',
        code: 'INVALID_ORG_ID'
      });
    }

    const dbService = DatabaseService.getInstance();
    
    // Check if organization database exists
    const orgExists = await dbService.organizationDatabaseExists(orgId);
    
    if (!orgExists) {
      return res.status(404).json({
        error: 'Organization not found',
        code: 'ORG_NOT_FOUND'
      });
    }

    // Get organization-specific database connection
    const orgConnection = dbService.getOrganizationConnection(orgId);
    req.organizationConnection = orgConnection;

    logger.info(`Organization access validated for: ${orgId}`);
    return next();
  } catch (error) {
    logger.error('Error validating organization access:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'ORG_VALIDATION_ERROR'
    });
  }
};

/**
 * Middleware to ensure user has access to the organization
 */
export const checkOrganizationAccess = (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.organizationId;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Super Admin can access any organization
    if (user.role === 'Super Admin') {
      return next();
    }

    // Check if user belongs to the requested organization
    if (user.organizationId !== orgId) {
      return res.status(403).json({
        error: 'Access denied to this organization',
        code: 'ORG_ACCESS_DENIED'
      });
    }

    next();
  } catch (error) {
    logger.error('Error checking organization access:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'ORG_ACCESS_ERROR'
    });
  }
};

/**
 * Middleware to create organization database if it doesn't exist
 * Only for Super Admin or during organization creation
 */
export const createOrganizationDatabase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.organizationId;
    const user = (req as any).user;

    if (!orgId) {
      return res.status(400).json({
        error: 'Organization ID is required',
        code: 'MISSING_ORG_ID'
      });
    }

    // Only Super Admin can create organization databases
    if (!user || user.role !== 'Super Admin') {
      return res.status(403).json({
        error: 'Insufficient permissions to create organization database',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const dbService = DatabaseService.getInstance();
    
    // Check if database already exists
    const orgExists = await dbService.organizationDatabaseExists(orgId);
    
    if (orgExists) {
      return res.status(409).json({
        error: 'Organization database already exists',
        code: 'ORG_DB_EXISTS'
      });
    }

    // Create organization database
    const created = await dbService.createOrganizationDatabase(orgId);
    
    if (!created) {
      return res.status(500).json({
        error: 'Failed to create organization database',
        code: 'ORG_DB_CREATION_FAILED'
      });
    }

    logger.info(`Organization database created for: ${orgId}`);
    return next();
  } catch (error) {
    logger.error('Error creating organization database:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'ORG_DB_CREATION_ERROR'
    });
  }
};

/**
 * Middleware to log organization access for audit purposes
 */
export const auditOrganizationAccess = (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.organizationId;
    const user = (req as any).user;
    const action = req.method;
    const endpoint = req.originalUrl;

    if (orgId && user) {
      logger.info(`Organization access audit: User ${user.username} (${user.role}) accessed ${action} ${endpoint} for organization ${orgId}`);
      
      // Here you could save to an audit log collection
      // await AuditLog.create({
      //   userId: user._id,
      //   organizationId: orgId,
      //   action: action,
      //   endpoint: endpoint,
      //   timestamp: new Date(),
      //   ipAddress: req.ip,
      //   userAgent: req.get('User-Agent')
      // });
    }

    next();
  } catch (error) {
    logger.error('Error in organization access audit:', error);
    // Don't fail the request for audit errors
    next();
  }
};
