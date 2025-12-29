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
  successionStatus: 'Ready Now' | 'Ready in 1-2 Years' | 'Future Potential' | 'Not Assessed';
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
  
  successionStatus: {
    type: String,
    enum: ['Ready Now', 'Ready in 1-2 Years', 'Future Potential', 'Not Assessed'],
    default: 'Not Assessed',
    index: true
  },
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
