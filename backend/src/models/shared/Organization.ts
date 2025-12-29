import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  orgId: string;
  name: string;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  status: 'Active' | 'Inactive';
  package: 'Basic' |'Pro' | 'Enterprise';
  quota?: number;
  createdAt: Date;
  updatedAt: Date;
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
  };
  features: {
    hasPredictiveAnalytics: boolean;
    hasAIAssistant: boolean;
    hasROIAnalyzer: boolean;
    hasCustomization: boolean;
    hasAdvancedReports: boolean;
    hasIntegrations: boolean;
    hasAIStory: boolean;
    hasKeyDriverAnalysis: boolean;
    hasSuccessionPlanning: boolean;
    hasUserManagementAccess: boolean;
  };
}

const OrganizationSchema = new Schema<IOrganization>({
  orgId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  subscriptionStartDate: {
    type: Date,
    required: true
  },
  subscriptionEndDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  package: {
    type: String,
    enum: ['Basic','Intermediate', 'Pro', 'Enterprise'],
    required: true
  },
  quota: {
    type: Number,
    default: 0
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    }
  },
  features: {
    hasPredictiveAnalytics: {
      type: Boolean,
      default: false
    },
    hasAIAssistant: {
      type: Boolean,
      default: false
    },
    hasROIAnalyzer: {
      type: Boolean,
      default: false
    },
    hasCustomization: {
      type: Boolean,
      default: false
    },
    hasAdvancedReports: {
      type: Boolean,
      default: false
    },
    hasIntegrations: {
      type: Boolean,
      default: false
    },
    hasAIStory: {
      type: Boolean,
      default: false
    },
    hasKeyDriverAnalysis: {
      type: Boolean,
      default: false
    },
    hasSuccessionPlanning: {
      type: Boolean,
      default: false
    },
    hasUserManagementAccess: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  collection: 'organizations'
});

// Indexes for better query performance
OrganizationSchema.index({ orgId: 1 });
OrganizationSchema.index({ name: 1 }); // Index for semantic search on organization name
OrganizationSchema.index({ status: 1 });
OrganizationSchema.index({ package: 1 });
OrganizationSchema.index({ subscriptionEndDate: 1 });
// Compound index for search queries (name + status)
OrganizationSchema.index({ name: 1, status: 1 });

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);

