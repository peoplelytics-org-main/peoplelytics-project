import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartments extends Document {
  departmentId: string;
  name: string;
  description: string;
  headOfDepartment: string;
  budget: number;
  location: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const DepartmentsSchema = new Schema<IDepartments>({
  departmentId: {
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
  description: {
    type: String,
    required: true,
    trim: true
  },
  headOfDepartment: {
    type: String,
    required: true,
    index: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'departments'
});

// Indexes for better query performance
DepartmentsSchema.index({ name: 1 });
DepartmentsSchema.index({ headOfDepartment: 1 });
DepartmentsSchema.index({ location: 1 });
DepartmentsSchema.index({ isActive: 1 });
DepartmentsSchema.index({ budget: 1 });

// Compound indexes
DepartmentsSchema.index({ location: 1, isActive: 1 });
DepartmentsSchema.index({ headOfDepartment: 1, isActive: 1 });

//export const Departments = mongoose.model<IDepartments>('Departments', DepartmentsSchema);

