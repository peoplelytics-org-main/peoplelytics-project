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






