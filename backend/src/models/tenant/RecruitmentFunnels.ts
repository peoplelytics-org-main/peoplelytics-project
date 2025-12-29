import mongoose, { Schema, Document } from 'mongoose';

export interface IRecruitmentFunnels extends Document {
  rec_funnel_id: string;
  positionId: string;
  shortlisted: number;
  interviewed: number;
  offersExtended: number;
  offersAccepted: number;
  joined: number;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RecruitmentFunnelsSchema = new Schema<IRecruitmentFunnels>({
  rec_funnel_id: {
    type: String,
    required: true,
    unique: true
  },
  positionId: {
    type: String,
    required: true  // REMOVED unique: true - same position can exist across orgs
  },
  orgId: {
    type: String,
    required: true
  },
  shortlisted: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  interviewed: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  offersExtended: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  offersAccepted: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  joined: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'recruitment_funnels'
});

// Compound index for orgId + positionId (unique per organization)
RecruitmentFunnelsSchema.index({ orgId: 1, positionId: 1 }, { unique: true });
RecruitmentFunnelsSchema.index({ createdAt: 1 });

// Virtual for total candidates
RecruitmentFunnelsSchema.virtual('totalCandidates').get(function() {
  return this.shortlisted + this.interviewed + this.offersExtended + this.offersAccepted + this.joined;
});

// Virtual for overall conversion rate
RecruitmentFunnelsSchema.virtual('overallConversionRate').get(function() {
  if (this.shortlisted === 0) return 0;
  return this.joined / this.shortlisted;
});

// Ensure virtual fields are serialized
RecruitmentFunnelsSchema.set('toJSON', {
  virtuals: true
});