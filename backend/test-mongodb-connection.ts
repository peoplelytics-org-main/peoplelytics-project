/**
 * Test MongoDB Atlas Connection
 * Run with: npx tsx test-mongodb-connection.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('🔍 Testing MongoDB Atlas Connection...\n');
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env file');
    process.exit(1);
  }

  // Mask password in URI for logging
  const maskedUri = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
  console.log(`📡 Connection String: ${maskedUri}\n`);

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    
    const startTime = Date.now();
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    const connectionTime = Date.now() - startTime;
    
    console.log(`✅ Successfully connected to MongoDB Atlas! (${connectionTime}ms)`);
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port || 'N/A (Atlas)'}`);
    
    // Test database operations
    console.log('\n🧪 Testing database operations...');
    
    // List collections
    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log(`📁 Collections found: ${collections?.length || 0}`);
    if (collections && collections.length > 0) {
      console.log('   Collections:', collections.map(c => c.name).join(', '));
    }
    
    // Test ping
    const pingResult = await mongoose.connection.db?.admin().ping();
    console.log(`🏓 Ping result:`, pingResult);
    
    console.log('\n✅ All tests passed! MongoDB Atlas connection is working correctly.\n');
    
    // Close connection
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB Atlas');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Check username and password in connection string');
      console.error('   - Verify database user has proper permissions');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Check internet connection');
      console.error('   - Verify MongoDB Atlas cluster is running');
      console.error('   - Check if IP address is whitelisted in Atlas');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Check if IP address is whitelisted in Atlas');
      console.error('   - Verify network connectivity');
    }
    
    process.exit(1);
  }
}

// Run test
testConnection();


