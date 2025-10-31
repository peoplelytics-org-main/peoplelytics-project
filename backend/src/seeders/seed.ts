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
    // 1. Connect to the core database
    const dbUri = process.env.MONGO_URI || "mongodb://localhost:27017/master_db";
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
      username: 'superadmin',
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
        username: 'acme_admin',
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
    console.log(`  Super Admin: \n Email:admin@peoplelytics.com  \n   user: superadmin \n    pass: SuperAdminP@ss123!`);
    console.log(`  Org Admin (Acme): \n Email: admin@acme.com   user: acme_admin \n    pass: 'OrgAdminP@ss123!`);
    console.log(`  HR Analyst (Acme): \n Email:hr@acme.com \n   user: acme_hr \n    pass: HrAnalystP@ss123!`);
    console.log(`  Executive (Acme): \n Email: exec@acme.com \n   user: acme_exec \n    pass: ExecP@ss123!`);


    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seed();