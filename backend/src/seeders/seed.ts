import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/shared/User.js'; // Assuming .js output from .ts
import { Organization } from '../models/shared/Organization.js'; // Assuming .js output from .ts
import dotenv from 'dotenv';
dotenv.config();

/**
 * Defines the permissions for each role.
 * Your application's middleware or guards will check against these permissions.
 */
const rolePermissions = {
  'Super Admin': [
    'MANAGE_PLATFORM',
    'MANAGE_ORGANIZATIONS',
    'MANAGE_SUBSCRIPTIONS',
    'VIEW_SYSTEM_LOGS'
  ],
  'Org Admin': [
    'MANAGE_TENANT_USERS',
    'MANAGE_DEPARTMENTS',
    'MANAGE_EMPLOYEES',
    'VIEW_ALL_ANALYTICS',
    'CONFIGURE_ORGANIZATION_SETTINGS',
    'MANAGE_PERFORMANCE_REVIEWS'
  ],
  'HR Analyst': [
    'VIEW_EMPLOYEES',
    'VIEW_SOME_ANALYTICS',
    'EXPORT_REPORTS',
    'MANAGE_ATTENDANCE'
  ],
  'Executive': [
    'VIEW_DASHBOARD',
    'VIEW_REPORT_SUMMARY',
    'VIEW_HIGH_LEVEL_ANALYTICS'
  ]
};

/**
 * Default preferences for a new user.
 */
const defaultPreferences = {
  theme: 'light',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false
  }
};


const seed = async () => {
  try {
    // 1. Connect to the core database - MongoDB Atlas ONLY
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

    // 2. Clear old data from 'users' and 'organizations' collections
    await User.deleteMany({});
    await Organization.deleteMany({});
    console.log('🧹 Cleared old Users & Organizations');

    // 3. Create root system organization
    const rootOrg = await Organization.create({
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
    console.log('🏢 Root Organization seeded:', rootOrg.name);

    // 4. Create Super Admin user
    const superAdminPassword = await bcrypt.hash('SuperAdminP@ss123!', 10);
    const superAdmin = await User.create({
      username: 'superadmin@123',
      email:"superadmin123@gmail.com",
      password: superAdminPassword,
      role: 'Super Admin',
      isActive: true,
      organizationId: rootOrg.orgId, // 'root'
      organizationName: rootOrg.name,
      profile: {
        firstName: 'Root',
        lastName: 'Admin',
        email: 'admin@peoplelytics.com'
      },
      permissions: rolePermissions['Super Admin'],
      preferences: defaultPreferences
    });
    console.log('👑 Super Admin created:', superAdmin.username);
    console.log('---');

    // ----------------------------------------------------
    // SEED A TENANT ORGANIZATION AND ITS USERS
    // ----------------------------------------------------

    // 5. Create a specific tenant organization (e.g., Acme Corp)
    const acmeOrg = await Organization.create({
      orgId: 'org_001',
      name: 'Acme Corporation',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      package: 'Pro',
      status: 'Active',
      employeeCount: 150,
      settings: { timezone: 'America/New_York', currency: 'USD', dateFormat: 'MM/DD/YYYY' },
      features: {
        hasPredictiveAnalytics: true,
        hasAIAssistant: true,
        hasROIAnalyzer: true,
        hasCustomization: true,
        hasAdvancedReports: true,
        hasIntegrations: false,
        hasAIStory: false,
        hasKeyDriverAnalysis: true,
        hasSuccessionPlanning: false,
        hasUserManagementAccess: true
      }
    });
    console.log('🏢 Tenant Organization seeded:', acmeOrg.name);

    // 6. Hash passwords for tenant users
    const [orgAdminPass, hrAnalystPass, execPass] = await Promise.all([
      bcrypt.hash('OrgAdminP@ss123!', 10),  // Password for acme_admin
      bcrypt.hash('HrAnalystP@ss123!', 10), // Password for acme_hr
      bcrypt.hash('ExecP@ss123!', 10)       // Password for acme_exec
    ]);

    // 7. Create tenant users and associate them with 'org_001'
    const [orgAdmin, hrAnalyst, executive] = await Promise.all([
      // Org Admin
      User.create({
        username: 'acmeAdmin@123',
        password: orgAdminPass,
        role: 'Org Admin',
        isActive: true,
        organizationId: acmeOrg.orgId, // 'org_001'
        organizationName: acmeOrg.name,
        profile: {
          firstName: 'Alice',
          lastName: 'Admin',
          email: 'admin@acme.com'
        },
        permissions: rolePermissions['Org Admin'],
        preferences: defaultPreferences
      }),
      // HR Analyst
      User.create({
        username: 'acme_hr',
        password: hrAnalystPass,
        role: 'HR Analyst',
        isActive: true,
        organizationId: acmeOrg.orgId, // 'org_001'
        organizationName: acmeOrg.name,
        profile: {
          firstName: 'Henry',
          lastName: 'Ross',
          email: 'hr@acme.com'
        },
        permissions: rolePermissions['HR Analyst'],
        preferences: defaultPreferences
      }),
      // Executive
      User.create({
        username: 'acme_exec',
        password: execPass,
        role: 'Executive',
        isActive: true,
        organizationId: acmeOrg.orgId, // 'org_001'
        organizationName: acmeOrg.name,
        profile: {
          firstName: 'Eliza',
          lastName: 'Vance',
          email: 'exec@acme.com'
        },
        permissions: rolePermissions['Executive'],
        preferences: { ...defaultPreferences, theme: 'dark' } // Example: different pref
      })
    ]);

    console.log('👤 Org Admin created:', orgAdmin.username);
    console.log('👤 HR Analyst created:', hrAnalyst.username);
    console.log('👤 Executive created:', executive.username);
    
    console.log('---');
    console.log('✨ Seeder Completed Successfully!');
    console.log('---');
    console.log('Login Credentials:');
    console.log(`  Super Admin:`);
    console.log(`    Username: ${superAdmin.username}`);
    console.log(`    Email: ${superAdmin.profile.email}`);
    console.log(`    Password: SuperAdminP@ss123!`);
    console.log(`    Organization ID: (leave empty for Super Admin)`);
    console.log('');
    console.log(`  Org Admin (Acme):`);
    console.log(`    Username: ${orgAdmin.username}`);
    console.log(`    Email: ${orgAdmin.profile.email}`);
    console.log(`    Password: OrgAdminP@ss123!`);
    console.log(`    Organization ID: ${acmeOrg.orgId}`);
    console.log('');
    console.log(`  HR Analyst (Acme):`);
    console.log(`    Username: ${hrAnalyst.username}`);
    console.log(`    Email: ${hrAnalyst.profile.email}`);
    console.log(`    Password: HrAnalystP@ss123!`);
    console.log(`    Organization ID: ${acmeOrg.orgId}`);
    console.log('');
    console.log(`  Executive (Acme):`);
    console.log(`    Username: ${executive.username}`);
    console.log(`    Email: ${executive.profile.email}`);
    console.log(`    Password: ExecP@ss123!`);
    console.log(`    Organization ID: ${acmeOrg.orgId}`);


    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seed();