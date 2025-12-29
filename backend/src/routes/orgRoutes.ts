import express from 'express';
import {addOrganization, searchOrganizations} from "../controllers/orgController"
import DatabaseService from '../services/tenant/databaseService';
import { logger } from '../utils/helpers/logger';
import {addUserToOrganization, deleteUserFromOrganization, getAllUsersFromAllOrganizations, getAllUsersFromOrganization, getUserById, updateUserInOrganization} from "../controllers/addUserToOrganization"
import { deleteOrganization, getAllOrganizations, getOrganizationById, listOrganizationDatabases, restoreOrganization, softDeleteOrganization, updateOrganization, getOrganizationStats, checkOrganizationHealth } from '../controllers/orgController';
import {
  validateCreateOrganization,
  validateUpdateOrganization,
  validateGetOrganizations,
  validateGetOrganizationById,
  validateDeleteOrganization,
} from '../validators/organizationValidator';

const router = express.Router();



router.post('/add-organization', validateCreateOrganization, async (req: express.Request, res: express.Response) => {
  try {
    const orgData = req.body;

    // 1. Add org info in master_db (Organizations collection)
    const org = await addOrganization(orgData);

    // 2. Create a new org DB dynamically
    const dbService = DatabaseService.getInstance();
    const created = await dbService.createOrganizationDatabase(org.orgId);

    if (!created) {
      throw new Error('Failed to create organization database');
    }

    // 3. Initialize default collections in that DB
    // MongoDB creates collections lazily, so we create them explicitly
    const orgConnection = dbService.getOrganizationConnection(org.orgId);
    
    // Wait for connection to be ready
    if (orgConnection.readyState !== 1) {
      await new Promise<void>((resolve, reject) => {
        orgConnection.once('connected', () => resolve());
        orgConnection.once('error', (err) => reject(err));
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
    }

    if (!orgConnection.db) {
      throw new Error('Organization database connection not available');
    }

    // Create collections (MongoDB will create them if they don't exist)
    // We use insertOne with empty document to ensure collections are created
    // Collections match the structure shown in the database UI
    const db = orgConnection.db as any;
    
    // Define all collections that should be created for each organization
    const collectionsToCreate = [
      'accounts',
      'analytics',
      'attendance',
      'departments',
      'employees',
      'employee_feedback',
      'exit_interviews',
      'expenses',
      'job_positions',
      'leaves',
      'performance_and_engagement',
      'recruitment_funnels',
      'reports',
      'salary_and_compensation',
      'skills',
      // Note: 'users' collection is NOT created here as users are stored in master_db
    ];
    
    try {
      // Create collections by inserting initialization documents
      const initPromises = collectionsToCreate.map(collectionName =>
        db.collection(collectionName).insertOne({ 
          _init: true, 
          createdAt: new Date(),
          note: 'Initialization document - can be deleted'
        }).catch((err: any) => {
          logger.warn(`Failed to create collection ${collectionName}:`, err.message);
        })
      );
      
      await Promise.all(initPromises);

      // Remove initialization documents after collections are created
      const cleanupPromises = collectionsToCreate.map(collectionName =>
        db.collection(collectionName).deleteOne({ _init: true }).catch((err: any) => {
          logger.warn(`Failed to cleanup init document from ${collectionName}:`, err.message);
        })
      );
      
      await Promise.all(cleanupPromises);

      logger.info(`✅ Organization ${org.name} (${org.orgId}) database initialized with collections`);
    } catch (error) {
      logger.warn(`⚠️  Some collections may not have been initialized for ${org.name}:`, error);
      // Don't fail the organization creation if collection initialization fails
    }

    res.status(201).json({
      message: 'Organization created successfully',
      org,
    });
  } catch (error: any) {
    logger.error('❌ Error creating organization:', error);
    res.status(500).json({ error: error.message || 'Failed to add organization' });
  }
});


// Get all organizations (with optional filters)
router.get('/', validateGetOrganizations, getAllOrganizations);


// Get organization by ID (includes database stats)
router.get('/:orgId', validateGetOrganizationById, getOrganizationById);

// Get organization statistics
router.get('/:orgId/stats', validateGetOrganizationById, getOrganizationStats);

// Check organization health
router.get('/:orgId/health', validateGetOrganizationById, checkOrganizationHealth);

// Update organization
router.put('/:orgId', validateUpdateOrganization, updateOrganization);
router.patch('/:orgId', validateUpdateOrganization, updateOrganization);

// Soft delete (deactivate)
router.patch('/:orgId/deactivate', validateGetOrganizationById, softDeleteOrganization);

// Hard delete (permanent) - Deletes from master_db AND drops org database
router.delete('/:orgId/hard', validateDeleteOrganization, deleteOrganization);
router.delete('/:orgId/permanent', validateDeleteOrganization, deleteOrganization);

// Restore inactive organization
router.patch('/:orgId/activate', validateGetOrganizationById, restoreOrganization);

// List all organization databases
router.get('/databases/list', listOrganizationDatabases);
router.get('/databases/all', listOrganizationDatabases);

router.post("/:orgId/add-user",addUserToOrganization );

router.get("/:orgId/allusers", getAllUsersFromOrganization);
router.get("/:orgId/users/:userId", getUserById);
router.put("/:orgId/users/:userId", updateUserInOrganization);
router.delete("/:orgId/delete-user/:userId", deleteUserFromOrganization);

// Get ALL users from ALL organizations
router.get('/users/global/all', getAllUsersFromAllOrganizations);


export default router;