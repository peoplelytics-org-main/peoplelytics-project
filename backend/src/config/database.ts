import mongoose from 'mongoose';
import { logger } from '@/utils/helpers/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/master_db';
const MONGODB_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  // bufferCommands: false,
  // bufferMaxEntries: 0,
};

export const connectDatabase = async (): Promise<void> => {
  try {

    // Set mongoose options globally before connecting
    mongoose.set('bufferCommands', false);
    await mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);
    logger.info('✅ Connected to MongoDB successfully');
    
    // Set up connection event listeners
    mongoose.connection.on('error', (error: Error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('✅ Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
};

// Get organization-specific database connection
export const getOrganizationDatabase = (orgId: string): mongoose.Connection => {
  const orgDbName = `org_${orgId}`;
  
  // Create a new connection for the organization database
  const orgConnection = mongoose.createConnection(
    `${MONGODB_URI.replace('/master_db', '')}/${orgDbName}`,
    MONGODB_OPTIONS
  );

  return orgConnection;
};

// Get core database connection (for shared data)
export const getCoreDatabase = (): mongoose.Connection => {
  const coreDbName = 'peoplelytics_core';
  
  const coreConnection = mongoose.createConnection(
    `${MONGODB_URI.replace('/peoplelytics', '')}/${coreDbName}`,
    MONGODB_OPTIONS
  );

  return coreConnection;
};

// Database health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};
