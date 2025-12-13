import mongoose, { Connection } from 'mongoose';
import { logger } from '../../utils/helpers/logger';
import { Schema } from "mongoose";
import { UserSchema, IUser } from "../../models/shared/User";

export class DatabaseService {
  private static instance: DatabaseService;
  private coreConnection: Connection | null = null;
  private orgConnections: Map<string, Connection> = new Map();

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  

  /**
   * Get base MongoDB URI without database name
   */
  private getBaseUri(): string {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/master_db';
    // Remove any database name from URI
    return mongoUri.replace(/\/[^\/]+$/, '');
  }

  /**
   * Normalize organization ID (remove 'org_' prefix if exists)
   */
  private normalizeOrgId(orgId: string): string {
    return orgId.startsWith('org_') ? orgId.substring(4) : orgId;
  }

  public getTenantUserModel(orgId: string): mongoose.Model<IUser> {
    // 1. Get the specific connection
    const connection = this.getOrganizationConnection(orgId);

    // 2. Check if the model is already compiled on this connection to avoid OverwriteModelError
    // Mongoose stores models on the connection instance
    if (connection.models.User) {
      return connection.models.User as mongoose.Model<IUser>;
    }

    // 3. Compile the model on this specific connection
    return connection.model<IUser>('User', UserSchema);
  }

  /**
   * Get or create connection to core database
   */
  public getCoreConnection(): Connection {
    if (!this.coreConnection) {
      const coreDbName = 'peoplelytics_core';
      const baseUri = this.getBaseUri();
      
      this.coreConnection = mongoose.createConnection(
        `${baseUri}/${coreDbName}`,
        {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        }
      );

      this.coreConnection.on('error', (error) => {
        logger.error('Core database connection error:', error);
      });

      this.coreConnection.on('connected', () => {
        logger.info(`✅ Core database connected: ${coreDbName}`);
      });
    }

    return this.coreConnection;
  }

  /**
   * Get or create connection to organization-specific database
   */
  public getOrganizationConnection(orgId: string): Connection {
    const normalizedOrgId = this.normalizeOrgId(orgId);
    
    if (this.orgConnections.has(normalizedOrgId)) {
      return this.orgConnections.get(normalizedOrgId)!;
    }

    const orgDbName = `org_${normalizedOrgId}`;
    const baseUri = this.getBaseUri();
    
    const orgConnection = mongoose.createConnection(
      `${baseUri}/${orgDbName}`,
      {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );

    orgConnection.on('error', (error) => {
      logger.error(`Organization ${normalizedOrgId} database connection error:`, error);
    });

    orgConnection.on('disconnected', () => {
      logger.warn(`Organization ${normalizedOrgId} database disconnected`);
    });

    orgConnection.on('connected', () => {
      logger.info(`✅ Organization database connected: ${orgDbName}`);
    });

    this.orgConnections.set(normalizedOrgId, orgConnection);
    return orgConnection;
  }

  /**
   * Create a new organization database
   * MongoDB creates databases lazily, so we need to write data to trigger creation
   */
  public async createOrganizationDatabase(orgId: string): Promise<boolean> {
    try {
      const normalizedOrgId = this.normalizeOrgId(orgId);
      const connection = this.getOrganizationConnection(normalizedOrgId);

      // Wait for connection with timeout
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          if (connection.readyState === 1) {
            resolve();
          } else {
            connection.once('connected', () => resolve());
            connection.once('error', (err) => reject(err));
          }
        }),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        )
      ]);

      // Test connection by pinging
      if (!connection.db) {
        throw new Error('Database connection not available');
      }
      await (connection.db as any).admin().ping();

      // MongoDB creates databases lazily - we need to write data to actually create it
      // Create an initialization collection with a metadata document
      const initCollection = connection.db.collection('_init');
      await initCollection.insertOne({
        orgId: normalizedOrgId,
        createdAt: new Date(),
        initialized: true,
        version: '1.0.0'
      });

      // Verify the database was created by checking if it exists
      const admin = (connection.db as any).admin();
      const databases = await admin.listDatabases();
      const dbName = `org_${normalizedOrgId}`;
      const dbExists = databases.databases.some((db: any) => db.name === dbName);

      if (dbExists) {
        logger.info(`✅ Created organization database: ${dbName}`);
        return true;
      } else {
        logger.warn(`⚠️  Database ${dbName} connection established but database not yet created`);
        // Still return true as the database will be created on first write
        return true;
      }
    } catch (error) {
      logger.error(`❌ Failed to create organization database for ${orgId}:`, error);
      return false;
    }
  }

  /**
   * Check if organization database exists
   */
  public async organizationDatabaseExists(orgId: string): Promise<boolean> {
    try {
      const normalizedOrgId = this.normalizeOrgId(orgId);
      const connection = this.getOrganizationConnection(normalizedOrgId);
      
      // Wait for connection
      if (connection.readyState !== 1) {
        await new Promise<void>((resolve, reject) => {
          connection.once('connected', () => resolve());
          connection.once('error', (err) => reject(err));
          setTimeout(() => reject(new Error('Connection timeout')), 5000);
        });
      }

      if (!connection.db) {
        return false;
      }
      
      await (connection.db as any).admin().ping();
      return true;
    } catch (error) {
      logger.error(`Failed to check organization database for ${orgId}:`, error);
      return false;
    }
  }

  /**
   * Get list of all organization databases
   */
  public async listOrganizationDatabases(): Promise<string[]> {
    try {
      const baseUri = this.getBaseUri();
      const adminConnection = mongoose.createConnection(baseUri);
      
      // Wait for admin connection
      await new Promise<void>((resolve, reject) => {
        adminConnection.once('connected', () => resolve());
        adminConnection.once('error', (err) => reject(err));
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });

      if (!adminConnection.db) {
        await adminConnection.close();
        return [];
      }

      const admin = (adminConnection.db as any).admin();
      const databases = await admin.listDatabases();
      
      const orgDatabases = databases.databases
        .filter((db: any) => db.name.startsWith('org_'))
        .map((db: any) => db.name);
      
      await adminConnection.close();
      return orgDatabases;
    } catch (error) {
      logger.error('Failed to list organization databases:', error);
      return [];
    }
  }

  /**
   * Close organization connection
   */
  public async closeOrganizationConnection(orgId: string): Promise<void> {
    const normalizedOrgId = this.normalizeOrgId(orgId);
    const connection = this.orgConnections.get(normalizedOrgId);
    if (connection) {
      await connection.close();
      this.orgConnections.delete(normalizedOrgId);
      logger.info(`Closed connection for organization: ${normalizedOrgId}`);
    }
  }

  /**
   * Close all connections
   */
  public async closeAllConnections(): Promise<void> {
    // Close core connection
    if (this.coreConnection) {
      await this.coreConnection.close();
      this.coreConnection = null;
    }

    // Close all organization connections
    for (const [orgId, connection] of this.orgConnections) {
      await connection.close();
      logger.info(`Closed connection for organization: ${orgId}`);
    }
    this.orgConnections.clear();

    logger.info('All database connections closed');
  }

  /**
   * Get database statistics for an organization
   */
  public async getOrganizationStats(orgId: string): Promise<any> {
    try {
      const normalizedOrgId = this.normalizeOrgId(orgId);
      const connection = this.getOrganizationConnection(normalizedOrgId);
      
      // Ensure connection is ready
      if (connection.readyState !== 1) {
        await new Promise<void>((resolve, reject) => {
          connection.once('connected', () => resolve());
          connection.once('error', (err) => reject(err));
          setTimeout(() => reject(new Error('Connection timeout')), 5000);
        });
      }

      if (!connection.db) {
        return null;
      }

      const stats = await (connection.db as any).stats();
      return {
        database: `org_${normalizedOrgId}`,
        collections: stats.collections || 0,
        dataSize: stats.dataSize || 0,
        storageSize: stats.storageSize || 0,
        indexes: stats.indexes || 0,
        objects: stats.objects || 0
      };
    } catch (error) {
      logger.error(`Failed to get stats for organization ${orgId}:`, error);
      return null;
    }
  }

  /**
   * Health check for all connections
   */
  public async healthCheck(): Promise<{
    core: boolean;
    organizations: { [orgId: string]: boolean };
  }> {
    const result = {
      core: false,
      organizations: {} as { [orgId: string]: boolean }
    };

    // Check core connection
    try {
      if (this.coreConnection && this.coreConnection.readyState === 1 && this.coreConnection.db) {
        await (this.coreConnection.db as any).admin().ping();
        result.core = true;
      }
    } catch (error) {
      logger.error('Core database health check failed:', error);
    }

    // Check organization connections
    for (const [orgId, connection] of this.orgConnections) {
      try {
        if (connection.readyState === 1 && connection.db) {
          await (connection.db as any).admin().ping();
          result.organizations[orgId] = true;
        } else {
          result.organizations[orgId] = false;
        }
      } catch (error) {
        logger.error(`Organization ${orgId} database health check failed:`, error);
        result.organizations[orgId] = false;
      }
    }

    return result;
  }

  public async deleteOrganizationDatabase(orgId: string): Promise<boolean> {
    try {
      const normalizedOrgId = this.normalizeOrgId(orgId);
      const orgDbName = `org_${normalizedOrgId}`;
      
      logger.info(`🗑️  Starting deletion of organization database: ${orgDbName}`);

      // Get connection to the organization database
      const connection = this.getOrganizationConnection(normalizedOrgId);
      
      // Wait for connection
      if (connection.readyState !== 1) {
        await new Promise<void>((resolve, reject) => {
          connection.once('connected', () => resolve());
          connection.once('error', (err) => reject(err));
          setTimeout(() => reject(new Error('Connection timeout')), 5000);
        });
      }

      // Get all collections in the database
      if (!connection.db) {
        throw new Error('Database connection not available');
      }
      
      const db = connection.db as any;
      const collections = await db.listCollections().toArray();
      logger.info(`Found ${collections.length} collections to delete in ${orgDbName}`);

      // Drop all collections
      for (const collection of collections) {
        await db.dropCollection(collection.name);
        logger.info(`  ✓ Dropped collection: ${collection.name}`);
      }

      // Drop the entire database
      await db.dropDatabase();
      logger.info(`  ✓ Dropped database: ${orgDbName}`);

      // Close and remove the connection from pool
      await connection.close();
      this.orgConnections.delete(normalizedOrgId);
      logger.info(`  ✓ Closed connection for: ${normalizedOrgId}`);

      logger.info(`✅ Successfully deleted organization database: ${orgDbName}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to delete organization database for ${orgId}:`, error);
      return false;
    }
  }
  

}



export default DatabaseService;