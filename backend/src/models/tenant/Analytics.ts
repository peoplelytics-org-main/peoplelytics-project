import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  metricType: string;
  period: string;
  value: number;
  breakdown: {
    byDepartment?: { [key: string]: number };
    byTenure?: { [key: string]: number };
    byGender?: { [key: string]: number };
    byLocation?: { [key: string]: number };
    [key: string]: any;
  };
  calculatedAt: Date;
  dataSource: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  metricType: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  period: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  value: {
    type: Number,
    required: true,
    index: true
  },
  breakdown: {
    byDepartment: {
      type: Schema.Types.Mixed
    },
    byTenure: {
      type: Schema.Types.Mixed
    },
    byGender: {
      type: Schema.Types.Mixed
    },
    byLocation: {
      type: Schema.Types.Mixed
    }
  },
  calculatedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  dataSource: {
    type: String,
    required: true,
    trim: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'analytics'
});

// Indexes for better query performance
AnalyticsSchema.index({ metricType: 1, period: 1 });
AnalyticsSchema.index({ metricType: 1, calculatedAt: 1 });
AnalyticsSchema.index({ period: 1, calculatedAt: 1 });
AnalyticsSchema.index({ dataSource: 1 });
AnalyticsSchema.index({ value: 1 });

// Compound indexes for common queries
AnalyticsSchema.index({ metricType: 1, period: 1, calculatedAt: 1 });
AnalyticsSchema.index({ dataSource: 1, metricType: 1 });

// Virtual for is recent (within last 30 days)
AnalyticsSchema.virtual('isRecent').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.calculatedAt > thirtyDaysAgo;
});

// Virtual for age in days
AnalyticsSchema.virtual('ageInDays').get(function() {
  const diffTime = new Date().getTime() - this.calculatedAt.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
AnalyticsSchema.set('toJSON', {
  virtuals: true
});

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

