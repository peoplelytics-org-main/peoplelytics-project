import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/shared/User.js';
import { Organization } from '../models/shared/Organization.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Create a new Super Admin user
 */
const createSuperAdmin = async () => {
  try {
    // Connect to the core database - MongoDB Atlas ONLY
    const dbUri = process.env.MONGODB_URI;
    
    if (!dbUri) {
      console.error('❌ MONGODB_URI environment variable is not set!');
      console.error('Please set MONGODB_URI in your .env file with your MongoDB Atlas connection string.');
      process.exit(1);
    }
    
    // Ensure it's MongoDB Atlas and not local MongoDB
    if (dbUri.includes('mongodb://localhost') || dbUri.includes('127.0.0.1')) {
      console.error('❌ Local MongoDB connection detected!');
      console.error('This application only supports MongoDB Atlas. Please use a MongoDB Atlas connection string.');
      process.exit(1);
    }
    
    await mongoose.connect(dbUri);
    console.log('✅ Connected to DB:', dbUri);

    // Find or create root organization
    let rootOrg = await Organization.findOne({ orgId: 'root' });
    if (!rootOrg) {
      rootOrg = await Organization.create({
        orgId: 'root',
        name: 'Peoplelytics Global',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 99)),
        package: 'Enterprise',
        status: 'Active',
        employeeCount: 1,
        settings: { timezone: 'UTC', currency: 'USD', dateFormat: 'MM/DD/YYYY' },
        features: {
          hasPredictiveAnalytics: true,
          hasAIAssistant: true,
          hasROIAnalyzer: true,
          hasCustomization: true,
          hasAdvancedReports: true,
          hasIntegrations: true,
          hasAIStory: true,
          hasKeyDriverAnalysis: true,
          hasSuccessionPlanning: true,
          hasUserManagementAccess: true
        }
      });
      console.log('🏢 Root Organization created:', rootOrg.name);
    }

    // Create Super Admin user
    const username = 'superadmin';
    const password = 'SuperAdmin@2024!';
    const email = 'admin@peoplelytics.com';

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('⚠️  User already exists. Updating password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
      existingUser.isActive = true;
      await existingUser.save();
      console.log('✅ Super Admin password updated');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const superAdmin = await User.create({
        username: username,
        password: hashedPassword,
        role: 'Super Admin',
        isActive: true,
        organizationId: rootOrg.orgId,
        organizationName: rootOrg.name,
        profile: {
          firstName: 'Root',
          lastName: 'Admin',
          email: email
        },
        permissions: [
          'MANAGE_PLATFORM',
          'MANAGE_ORGANIZATIONS',
          'MANAGE_SUBSCRIPTIONS',
          'VIEW_SYSTEM_LOGS'
        ],
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      });
      console.log('✅ Super Admin created');
    }

    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: ' + username);
    console.log('Password: ' + password);
    console.log('Email:    ' + email);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from database');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
createSuperAdmin();



