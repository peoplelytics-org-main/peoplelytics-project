import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  employeeId: string;
  date: Date;
  status: 'Present' | 'Unscheduled Absence' | 'PTO' | 'Sick Leave';
  hoursWorked?: number;
  checkIn?: Date;
  checkOut?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AttendanceSchema = new Schema<IAttendance>({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Present', 'Unscheduled Absence', 'PTO', 'Sick Leave'],
    required: true,
    index: true
  },
  hoursWorked: {
    type: Number,
    min: 0,
    max: 24
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true,
  collection: 'attendance'
});

// Compound index to ensure one record per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Indexes for better query performance
AttendanceSchema.index({ date: 1, status: 1 });
AttendanceSchema.index({ employeeId: 1, status: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ status: 1 });

// Virtual for work duration
AttendanceSchema.virtual('workDuration').get(function() {
  if (this.checkIn && this.checkOut) {
    const diffTime = this.checkOut.getTime() - this.checkIn.getTime();
    return Math.round(diffTime / (1000 * 60 * 60)); // Hours
  }
  return this.hoursWorked || 0;
});

// Virtual for is present
AttendanceSchema.virtual('isPresent').get(function() {
  return this.status === 'Present';
});

// Ensure virtual fields are serialized
AttendanceSchema.set('toJSON', {
  virtuals: true
});



