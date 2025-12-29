import mongoose, { Schema, Document } from 'mongoose';

export interface IExitInterviews extends Document {
  employeeId: string;
  orgId:string,
  primaryReasonForLeaving: string;
  secondaryReasonForLeaving?: string;
  management: {
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    quote: string;
    summary: string;
  };
  compensation: {
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    quote: string;
    summary: string;
  };
  culture: {
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    quote: string;
    summary: string;
  };
  analyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const ExitInterviewsSchema = new Schema<IExitInterviews>({
  employeeId: {
    type: String,
    ref:"employees",
    required: true,
    
  },
  orgId:{
    type:String,
    required:true,
  },
  primaryReasonForLeaving: {
    type: String,
    required: true,
    trim: true,
    
  },
  secondaryReasonForLeaving: {
    type: String,
    trim: true
  },
  management: {
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
      required: true,
      
    },
    quote: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    }
  },
  compensation: {
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
      required: true,
      
    },
    quote: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    }
  },
  culture: {
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
      required: true,
      
    },
    quote: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    }
  },
  analyzedAt: {
    type: Date,
    required: true,
    default: Date.now,
    
  }
}, {
  timestamps: true,
  collection: 'exit_interviews'
});

// Indexes for better query performance
ExitInterviewsSchema.index({ employeeId: 1 });
ExitInterviewsSchema.index({ primaryReasonForLeaving: 1 });
ExitInterviewsSchema.index({ 'management.sentiment': 1 });
ExitInterviewsSchema.index({ 'compensation.sentiment': 1 });
ExitInterviewsSchema.index({ 'culture.sentiment': 1 });
ExitInterviewsSchema.index({ analyzedAt: 1 });

// Compound indexes for sentiment analysis
ExitInterviewsSchema.index({ 
  'management.sentiment': 1, 
  'compensation.sentiment': 1, 
  'culture.sentiment': 1 
});

// Virtual for overall sentiment score
ExitInterviewsSchema.virtual('overallSentiment').get(function() {
  const sentiments = [
    this.management.sentiment,
    this.compensation.sentiment,
    this.culture.sentiment
  ];
  
  const positiveCount = sentiments.filter(s => s === 'Positive').length;
  const negativeCount = sentiments.filter(s => s === 'Negative').length;
  
  if (positiveCount > negativeCount) return 'Positive';
  if (negativeCount > positiveCount) return 'Negative';
  return 'Neutral';
});

// Ensure virtual fields are serialized
ExitInterviewsSchema.set('toJSON', {
  virtuals: true
});

//export const ExitInterviews = mongoose.model<IExitInterviews>('ExitInterviews', ExitInterviewsSchema);

