import mongoose, { Schema, Document } from 'mongoose';

export interface IReports extends Document {
  reportId: string;
  name: string;
  type: string;
  generatedBy: string;
  parameters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    departments?: string[];
    [key: string]: any;
  };
  data: any;
  status: 'generating' | 'completed' | 'failed';
  filePath?: string;
  createdAt: Date;
  expiresAt: Date;
}

const ReportsSchema = new Schema<IReports>({
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  generatedBy: {
    type: String,
    required: true,
    index: true
  },
  parameters: {
    dateRange: {
      start: {
        type: Date,
        required: true,
        index: true
      },
      end: {
        type: Date,
        required: true,
        index: true
      }
    },
    departments: [{
      type: String,
      trim: true
    }]
  },
  data: {
    type: Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    required: true,
    default: 'generating',
    index: true
  },
  filePath: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'reports'
});

// Indexes for better query performance
ReportsSchema.index({ reportId: 1 });
ReportsSchema.index({ generatedBy: 1 });
ReportsSchema.index({ type: 1 });
ReportsSchema.index({ status: 1 });
ReportsSchema.index({ createdAt: 1 });
ReportsSchema.index({ expiresAt: 1 });

// Compound indexes
ReportsSchema.index({ generatedBy: 1, type: 1 });
ReportsSchema.index({ status: 1, createdAt: 1 });
ReportsSchema.index({ type: 1, status: 1 });

// Virtual for is expired
ReportsSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for days until expiration
ReportsSchema.virtual('daysUntilExpiration').get(function() {
  const diffTime = this.expiresAt.getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
ReportsSchema.set('toJSON', {
  virtuals: true
});

export const Reports = mongoose.model<IReports>('Reports', ReportsSchema);

