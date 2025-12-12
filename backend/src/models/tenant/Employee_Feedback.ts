import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeFeedback extends Document {
satisId:string;
  employeeId: string;
  engagementScore:number;
  compensationSatisfaction?:number;
  benefitsSatisfaction?:number;
  managementSatisfaction?:number;
  trainingSatisfaction?:number;
  createdAt: Date;
  updatedAt: Date;
}

export const EmployeeFeedbackSchema = new Schema<IEmployeeFeedback>({
    satisId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
  employeeId: {
    type: String,
    ref:"employees",
    required: true,
    index: true
  },
  engagementScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true
  },
  compensationSatisfaction:{
    type:Number,
    min:0,
    max:100
  },
  benefitsSatisfaction:{
    type:Number,
    min:0,
    max:100
  },
  managementSatisfaction:{
    type:Number,
    min:0,
    max:100
  },
  trainingSatisfaction:{
    type:Number,
    min:0,
    max:100
  },

  
}, {
  timestamps: true,
  collection: 'employee_feedback'
});

// Indexes for better query performance
EmployeeFeedbackSchema.index({ employeeId: 1, createdAt: -1 });
EmployeeFeedbackSchema.index({ engagementScore: 1 });

