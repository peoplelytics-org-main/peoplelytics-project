import mongoose, { Schema, Document } from 'mongoose';

export interface IRecruitmentFunnels extends Document {
  positionId: string;
  shortlisted: number;
  interviewed: number;
  offersExtended: number;
  offersAccepted: number;
  joined: number;
  conversionRates: {
    shortlistToInterview: number;
    interviewToOffer: number;
    offerToAccept: number;
    acceptToJoin: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RecruitmentFunnelsSchema = new Schema<IRecruitmentFunnels>({
  positionId: {
    type: String,
    required: true,
    unique: true,
    index: true
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
  },
  conversionRates: {
    shortlistToInterview: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    interviewToOffer: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    offerToAccept: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    acceptToJoin: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    }
  }
}, {
  timestamps: true,
  collection: 'recruitment_funnels'
});

// Indexes for better query performance
RecruitmentFunnelsSchema.index({ positionId: 1 });
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

export const RecruitmentFunnels = mongoose.model<IRecruitmentFunnels>('RecruitmentFunnels', RecruitmentFunnelsSchema);

