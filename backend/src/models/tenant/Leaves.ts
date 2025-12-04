import { Schema, Document } from 'mongoose';

export interface ILeaves extends Document {
  leaveId: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Other';
  startDate: Date;
  endDate: Date;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const LeavesSchema = new Schema<ILeaves>({
  leaveId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  leaveType: {
    type: String,
    enum: ['Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Unpaid', 'Other'],
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  days: {
    type: Number,
    required: true,
    min: 0.5
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  reason: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: String,
    trim: true
  },
  approvedAt: {
    type: Date
  },
  rejectedReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'leaves'
});

// Indexes for better query performance
LeavesSchema.index({ employeeId: 1, startDate: 1 });
LeavesSchema.index({ leaveType: 1, status: 1 });
LeavesSchema.index({ status: 1, startDate: 1 });
LeavesSchema.index({ startDate: 1, endDate: 1 });

// Compound index to check for overlapping leaves
LeavesSchema.index({ employeeId: 1, startDate: 1, endDate: 1 });



