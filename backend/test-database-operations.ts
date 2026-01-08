/**
 * Test Database Operations with MongoDB Atlas
 * Run with: npx tsx test-database-operations.ts
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

// Test Schema
const TestSchema = new mongoose.Schema({
  name: String,
  value: Number,
  createdAt: { type: Date, default: Date.now }
});

const TestModel = mongoose.model('Test', TestSchema);

async function testDatabaseOperations() {
  console.log('🧪 Testing Database Operations with MongoDB Atlas...\n');
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env file');
    process.exit(1);
  }

  try {
    // Connect
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas\n');

    // Test 1: Create a document
    console.log('📝 Test 1: Creating a test document...');
    const testDoc = new TestModel({
      name: 'test-document',
      value: 42
    });
    const savedDoc = await testDoc.save();
    console.log(`✅ Document created with ID: ${savedDoc._id}`);

    // Test 2: Read the document
    console.log('\n📖 Test 2: Reading the test document...');
    const foundDoc = await TestModel.findById(savedDoc._id);
    if (foundDoc) {
      console.log(`✅ Document found: ${foundDoc.name} = ${foundDoc.value}`);
    } else {
      throw new Error('Document not found');
    }

    // Test 3: Update the document
    console.log('\n✏️  Test 3: Updating the test document...');
    foundDoc.value = 100;
    await foundDoc.save();
    console.log(`✅ Document updated: value = ${foundDoc.value}`);

    // Test 4: Query documents
    console.log('\n🔍 Test 4: Querying documents...');
    const allDocs = await TestModel.find({});
    console.log(`✅ Found ${allDocs.length} document(s) in collection`);

    // Test 5: Delete the document
    console.log('\n🗑️  Test 5: Deleting the test document...');
    await TestModel.deleteOne({ _id: savedDoc._id });
    console.log('✅ Document deleted');

    // Test 6: Verify deletion
    console.log('\n🔍 Test 6: Verifying deletion...');
    const deletedDoc = await TestModel.findById(savedDoc._id);
    if (!deletedDoc) {
      console.log('✅ Document successfully deleted');
    } else {
      throw new Error('Document still exists after deletion');
    }

    // Test 7: Test organization database connection (using databaseService)
    console.log('\n🏢 Test 7: Testing organization database connection...');
    const { DatabaseService } = await import('./src/services/tenant/databaseService.js');
    const dbService = new DatabaseService();
    const orgConnection = dbService.getOrganizationConnection('test-org');
    console.log('✅ Organization database connection created');

    // Test 8: Test core database connection
    console.log('\n🔧 Test 8: Testing core database connection...');
    const coreConnection = dbService.getCoreConnection();
    console.log('✅ Core database connection created');

    console.log('\n✅ All database operation tests passed!\n');
    
    // Close connections
    await mongoose.disconnect();
    await orgConnection.close();
    await coreConnection.close();
    console.log('👋 Disconnected from all databases');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // Cleanup on error
    try {
      await TestModel.deleteMany({ name: 'test-document' });
      await mongoose.disconnect();
    } catch (e) {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
}

// Run tests
testDatabaseOperations();


