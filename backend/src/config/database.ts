import mongoose from 'mongoose';
import { logger } from '@/utils/helpers/logger';

// Get MongoDB URI from environment - MongoDB Atlas ONLY (no local fallback)
const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    logger.error('❌ MONGODB_URI environment variable is not set!');
    logger.error('Please set MONGODB_URI in your .env file with your MongoDB Atlas connection string.');
    throw new Error('MONGODB_URI environment variable is required. Application requires MongoDB Atlas connection.');
  }
  
  // Ensure it's MongoDB Atlas (mongodb+srv://) and not local MongoDB
  if (uri.includes('mongodb://localhost') || uri.includes('127.0.0.1')) {
    logger.error('❌ Local MongoDB connection detected!');
    logger.error('This application only supports MongoDB Atlas. Please use a MongoDB Atlas connection string.');
    throw new Error('Local MongoDB connections are not allowed. Use MongoDB Atlas connection string.');
  }
  
  // If URI doesn't contain a database name, append master_db
  // MongoDB Atlas URIs might not have database name
  if (uri.includes('mongodb+srv://') || uri.includes('mongodb://')) {
    // Check if URI already has a database name (contains /[database-name] or /[database-name]?)
    const hasDbName = /\/[^\/\?]+(\?|$)/.test(uri.split('@')[1] || '');
    
    if (!hasDbName) {
      // Append database name before query parameters
      const separator = uri.includes('?') ? '/' : '/';
      const queryIndex = uri.indexOf('?');
      if (queryIndex !== -1) {
        return `${uri.substring(0, queryIndex)}/master_db${uri.substring(queryIndex)}`;
      }
      return `${uri}/master_db`;
    }
  }
  
  return uri;
};

const MONGODB_URI = getMongoUri();
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
  
  // Extract base URI without database name
  let baseUri = MONGODB_URI;
  // Remove database name from URI (handle both /master_db and /database-name patterns)
  baseUri = baseUri.replace(/\/[^\/\?]+(\?|$)/, '');
  // If there's a query string, preserve it
  const queryString = MONGODB_URI.includes('?') ? MONGODB_URI.substring(MONGODB_URI.indexOf('?')) : '';
  
  // Create a new connection for the organization database
  const orgConnection = mongoose.createConnection(
    `${baseUri}/${orgDbName}${queryString}`,
    MONGODB_OPTIONS
  );

  return orgConnection;
};

// Get core database connection (for shared data)
export const getCoreDatabase = (): mongoose.Connection => {
  const coreDbName = 'peoplelytics_core';
  
  // Extract base URI without database name
  let baseUri = MONGODB_URI;
  // Remove database name from URI
  baseUri = baseUri.replace(/\/[^\/\?]+(\?|$)/, '');
  // Preserve query string if exists
  const queryString = MONGODB_URI.includes('?') ? MONGODB_URI.substring(MONGODB_URI.indexOf('?')) : '';
  
  const coreConnection = mongoose.createConnection(
    `${baseUri}/${coreDbName}${queryString}`,
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
