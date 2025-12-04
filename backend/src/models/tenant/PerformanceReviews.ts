import mongoose, { Schema, Document } from 'mongoose';

export interface IPerformanceAndEngagement extends Document {
  employeeId: string;
  name:string;
  performanceRating:number;
  potentialRating:number;
  flightRiskScore:number;
  impactScore:number;
  trainingCompleted:number;
  trainingTotal:number;
  weeklyHours:number;
  hasGrievance:boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const PerformanceAndEngagementSchema = new Schema<IPerformanceAndEngagement>({
  employeeId: {
    type: String,
    ref:"employees",
    required: true,
    index: true
  },
  name:{
    type:String,
    required:true,
  },
  performanceRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  potentialRating: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
    index: true
  },
  
  flightRiskScore:{
    type:Number,
    default:0.0,
    min:0.0,
    max:5.0,
  },
  impactScore:{
    type:Number,
    default:0.0,
    min:0.0,
    max:10.0
  },
  trainingCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  trainingTotal: {
    type: Number,
    default: 8,
    min: 0
  },
  weeklyHours: {
    type: Number,
    min: 1,
    max: 168,
    default: 40
  },
  hasGrievance: {
    type: Boolean,
    default: false
  },

}, {
  timestamps: true,
  collection: 'performance_and_engagement'
});

// // Indexes for better query performance
// PerformanceReviewsSchema.index({ employeeId: 1, reviewPeriod: 1 });
// PerformanceReviewsSchema.index({ reviewerId: 1 });
// PerformanceReviewsSchema.index({ rating: 1 });
// PerformanceReviewsSchema.index({ reviewDate: 1 });
// PerformanceReviewsSchema.index({ reviewPeriod: 1 });

// // Compound indexes
// PerformanceReviewsSchema.index({ employeeId: 1, rating: 1 });
// PerformanceReviewsSchema.index({ reviewPeriod: 1, rating: 1 });

// // Virtual for goal completion rate
// PerformanceReviewsSchema.virtual('goalCompletionRate').get(function() {
//   if (this.goals.length === 0) return 0;
//   const completedGoals = this.goals.filter(goal => goal.status === 'Completed').length;
//   return completedGoals / this.goals.length;
// });

// // Virtual for weighted goal completion
// PerformanceReviewsSchema.virtual('weightedGoalCompletion').get(function() {
//   if (this.goals.length === 0) return 0;
//   const totalWeight = this.goals.reduce((sum, goal) => sum + goal.weight, 0);
//   const completedWeight = this.goals
//     .filter(goal => goal.status === 'Completed')
//     .reduce((sum, goal) => sum + goal.weight, 0);
  
//   return totalWeight > 0 ? completedWeight / totalWeight : 0;
// });

// // Ensure virtual fields are serialized
// PerformanceReviewsSchema.set('toJSON', {
//   virtuals: true
// });

//export const PerformanceReviews = mongoose.model<IPerformanceReviews>('PerformanceReviews', PerformanceReviewsSchema);


// reviewPeriod: {
//   type: String,
//   required: true,
//   trim: true,
//   index: true
// },
// reviewDate: {
//   type: Date,
//   required: true,
//   index: true
// },
// reviewerId: {
//   type: String,
//   required: true,
//   index: true
// },
// rating: {
//   type: Number,
//   required: true,
//   min: 1,
//   max: 5,
//   index: true
// },
// goals: [{
//   goal: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   status: {
//     type: String,
//     enum: ['Completed', 'In Progress', 'Not Started', 'Overdue'],
//     required: true,
//     index: true
//   },
//   weight: {
//     type: Number,
//     required: true,
//     min: 0,
//     max: 1
//   }
// }],
// strengths: [{
//   type: String,
//   trim: true
// }],
// areasForImprovement: [{
//   type: String,
//   trim: true
// }],
// nextPeriodGoals: [{
//   type: String,
//   trim: true
// }],
// overallComments: {
//   type: String,
//   required: true,
//   trim: true
// }