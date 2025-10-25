import mongoose, { Connection } from 'mongoose';
import { logger } from '../../utils/helpers/logger';

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
   * Get or create connection to core database
   */
  public getCoreConnection(): Connection {
    if (!this.coreConnection) {
      const coreDbName = 'peoplelytics_core';
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/peoplelytics';
      const baseUri = mongoUri.replace('/peoplelytics', '');
      
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
    }

    return this.coreConnection;
  }

  /**
   * Get or create connection to organization-specific database
   */
  public getOrganizationConnection(orgId: string): Connection {
    if (this.orgConnections.has(orgId)) {
      return this.orgConnections.get(orgId)!;
    }

    const orgDbName = `org_${orgId}`;
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/peoplelytics';
    const baseUri = mongoUri.replace('/peoplelytics', '');
    
    const orgConnection = mongoose.createConnection(
      `${baseUri}/${orgDbName}`,
      {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );

    orgConnection.on('error', (error) => {
      logger.error(`Organization ${orgId} database connection error:`, error);
    });

    orgConnection.on('disconnected', () => {
      logger.warn(`Organization ${orgId} database disconnected`);
    });

    this.orgConnections.set(orgId, orgConnection);
    return orgConnection;
  }

  /**
   * Create a new organization database
   */
  public async createOrganizationDatabase(orgId: string): Promise<boolean> {
    try {
      const connection = this.getOrganizationConnection(orgId);
      
      // Test the connection
      await connection.db.admin().ping();
      
      logger.info(`✅ Created organization database: org_${orgId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to create organization database for ${orgId}:`, error);
      return false;
    }
  }

  /**
   * Check if organization database exists
   */
  public async organizationDatabaseExists(orgId: string): Promise<boolean> {
    try {
      const connection = this.getOrganizationConnection(orgId);
      await connection.db.admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of all organization databases
   */
  public async listOrganizationDatabases(): Promise<string[]> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/peoplelytics';
      const baseUri = mongoUri.replace('/peoplelytics', '');
      const adminConnection = mongoose.createConnection(baseUri);
      
      const admin = adminConnection.db.admin();
      const databases = await admin.listDatabases();
      
      const orgDatabases = databases.databases
        .filter(db => db.name.startsWith('org_'))
        .map(db => db.name);
      
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
    const connection = this.orgConnections.get(orgId);
    if (connection) {
      await connection.close();
      this.orgConnections.delete(orgId);
      logger.info(`Closed connection for organization: ${orgId}`);
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
      const connection = this.getOrganizationConnection(orgId);
      const stats = await connection.db.stats();
      return {
        database: `org_${orgId}`,
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        objects: stats.objects
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
      if (this.coreConnection) {
        await this.coreConnection.db.admin().ping();
        result.core = true;
      }
    } catch (error) {
      logger.error('Core database health check failed:', error);
    }

    // Check organization connections
    for (const [orgId, connection] of this.orgConnections) {
      try {
        await connection.db.admin().ping();
        result.organizations[orgId] = true;
      } catch (error) {
        logger.error(`Organization ${orgId} database health check failed:`, error);
        result.organizations[orgId] = false;
      }
    }

    return result;
  }
}

export default DatabaseService;

