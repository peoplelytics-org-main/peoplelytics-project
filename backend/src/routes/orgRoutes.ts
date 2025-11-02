import express from 'express';
import {addOrganization} from "../../docs/database/superAdmin"
import DatabaseService from '../services/tenant/databaseService';
import { logger } from '@/utils/helpers/logger';
import { deleteOrganization, getAllOrganizations, getOrganizationById, listOrganizationDatabases, restoreOrganization, softDeleteOrganization, updateOrganization } from '@/controllers/orgController';

const router = express.Router();

router.post('/add-organization', async (req, res) => {
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

    // 3. (Optional) Initialize default collections in that DB
    const orgConnection = dbService.getOrganizationConnection(org.orgId);

    await Promise.all([
      orgConnection.createCollection('users'),
      orgConnection.createCollection('expenses'),
      orgConnection.createCollection('leaves'),
      orgConnection.createCollection('attendance'),
    ]);

    logger.info(`✅ Organization ${org.name} database initialized`);

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
router.get('/', getAllOrganizations);

// Get organization by ID (includes database stats)
router.get('/:orgId', getOrganizationById);

// Update organization
router.put('/:orgId', updateOrganization);
router.patch('/:orgId', updateOrganization);


router.patch('/:orgId/deactivate', softDeleteOrganization);

// Hard delete (permanent) - Deletes from master_db AND drops org database
router.delete('/:orgId/hard', deleteOrganization);
router.delete('/:orgId/permanent', deleteOrganization);

// Restore inactive organization
router.patch('/:orgId/activate', restoreOrganization);

// List all organization databases
router.get('/databases/list', listOrganizationDatabases);
router.get('/databases/all', listOrganizationDatabases);


export default router;