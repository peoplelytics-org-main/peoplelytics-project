import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  name: string;
  department: string;
  jobTitle: string;
  location: string;
  hireDate: Date;
  terminationDate?: Date;
  terminationReason?: 'Voluntary' | 'Involuntary';
  gender: 'Male' | 'Female' | 'Other';
  managerId?: string;
  successionStatus: 'Ready Now' | 'Ready in 1-2 Years' | 'Future Potential' | 'Not Assessed';
  // Additional fields expected by frontend
  salary?: number;
  performanceRating?: number; // 1-5
  potentialRating?: number; // 1-3
  engagementScore?: number; // 1-100
  skills?: Array<{ name: string; level: 'Novice' | 'Beginner' | 'Competent' | 'Proficient' | 'Expert' }>;
  compensationSatisfaction?: number; // 1-100
  benefitsSatisfaction?: number; // 1-100
  managementSatisfaction?: number; // 1-100
  trainingSatisfaction?: number; // 1-100
  trainingCompleted?: number;
  trainingTotal?: number;
  bonus?: number;
  lastRaiseAmount?: number;
  hasGrievance?: boolean;
  weeklyHours?: number;
  snapshotDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const EmployeeSchema = new Schema<IEmployee>({
  employeeId: {
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
  department: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  hireDate: {
    type: Date,
    required: true,
    index: true
  },
  terminationDate: {
    type: Date,
    index: true
  },
  terminationReason: {
    type: String,
    enum: ['Voluntary', 'Involuntary']
  },
 
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
    index: true
  },
  
  managerId: {
    type: String,
    index: true
  },
 
  successionStatus: {
    type: String,
    enum: ['Ready Now', 'Ready in 1-2 Years', 'Future Potential', 'Not Assessed'],
    default: 'Not Assessed',
    index: true
  },
  // Additional fields expected by frontend
  salary: {
    type: Number,
    default: 0,
    index: true
  },
  performanceRating: {
    type: Number,
    min: 1,
    max: 5,
    index: true
  },
  potentialRating: {
    type: Number,
    min: 1,
    max: 3,
    index: true
  },
  engagementScore: {
    type: Number,
    min: 1,
    max: 100,
    index: true
  },
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'],
      required: true
    }
  }],
  compensationSatisfaction: {
    type: Number,
    min: 1,
    max: 100
  },
  benefitsSatisfaction: {
    type: Number,
    min: 1,
    max: 100
  },
  managementSatisfaction: {
    type: Number,
    min: 1,
    max: 100
  },
  trainingSatisfaction: {
    type: Number,
    min: 1,
    max: 100
  },
  trainingCompleted: {
    type: Number,
    default: 0
  },
  trainingTotal: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  lastRaiseAmount: {
    type: Number
  },
  hasGrievance: {
    type: Boolean,
    default: false
  },
  weeklyHours: {
    type: Number,
    default: 40
  },
  snapshotDate: {
    type: Date,
    index: true
  }
}, {
  timestamps: true,
  collection: 'employees'
});

// Indexes for better query performance
EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ department: 1, location: 1 });
EmployeeSchema.index({ jobTitle: 1 });
EmployeeSchema.index({ managerId: 1 });
EmployeeSchema.index({ terminationDate: 1 });
EmployeeSchema.index({ hireDate: 1 });

// Compound indexes for common queries
EmployeeSchema.index({ location: 1, gender: 1 });
EmployeeSchema.index({ department: 1, terminationDate: 1 });

// Virtual for tenure calculation
EmployeeSchema.virtual('tenure').get(function(this: IEmployee) {
  const endDate = this.terminationDate || new Date();
  const diffTime = Math.abs(endDate.getTime() - this.hireDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365.25); // Years
});

// Virtual for active status
EmployeeSchema.virtual('isActive').get(function(this: IEmployee) {
  return !this.terminationDate;
});

// Ensure virtual fields are serialized
EmployeeSchema.set('toJSON', {
  virtuals: true
});

// export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
