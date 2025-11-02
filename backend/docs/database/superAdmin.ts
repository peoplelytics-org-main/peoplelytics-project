import {masterdbConnection} from "./masterConnection"
import mongoose from 'mongoose';

// Schema for organizations in master_db
const OrganizationSchema = new mongoose.Schema({
  orgId: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  subscriptionStartDate: { type: Date, required: true },
  subscriptionEndDate: { type: Date, required: true },
  status: { type: String, default: 'Active' },
  package: { type: String, default: 'Basic' },
  employeeCount: { type: Number, default: 0 },
  settings: { type: Object, default: {} },
  features: { type: Object, default: {} },
}, {
  timestamps: true // auto adds createdAt and updatedAt
});

export const Organization = masterdbConnection.model('Organization', OrganizationSchema);

// Function to add organization
export const addOrganization = async (orgData: any) => {
  // Check if organization already exists
  const existingOrg = await Organization.findOne({ name: orgData.name });
  if (existingOrg) {
    throw new Error(`Organization "${orgData.name}" already exists`);
  }

  // Auto-generate orgId
  const orgId = `org_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // Set default start and end dates
  const startDate = orgData.subscriptionStartDate
    ? new Date(orgData.subscriptionStartDate)
    : new Date();

  const endDate = orgData.subscriptionEndDate
    ? new Date(orgData.subscriptionEndDate)
    : new Date(startDate.getTime());

  if (!orgData.subscriptionEndDate) {
    endDate.setMonth(startDate.getMonth() + (orgData.duration || 6));
  }

  // Create the new organization
  const newOrg = await Organization.create({
    orgId,
    name: orgData.name,
    subscriptionStartDate: startDate,
    subscriptionEndDate: endDate,
    status: orgData.status || "Active",
    package: orgData.package || "Basic",
    employeeCount: orgData.employeeCount || 0,
  });

  console.log(`✅ Organization "${newOrg.name}" added successfully`);
  return newOrg;
};




