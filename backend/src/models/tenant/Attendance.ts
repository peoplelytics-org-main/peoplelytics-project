import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  attendanceId:string;
  employeeId: string;
  date_time_in: Date;
  date_time_out?: Date;
  status: 'Present' | 'Unscheduled Absence' | 'PTO' | 'Sick Leave';
  createdAt: Date;
  updatedAt: Date;
}

export const AttendanceSchema = new Schema<IAttendance>({
  attendanceId:{
    type: String,
    required: true,
    index: true
  },
  employeeId: {
    type: String,
    ref:"employees",
    required: true,
    index: true
  },
  date_time_in: {
    type: Date,
    required: true,
    index: true
  },
  date_time_out: {
    type: Date,
    required: false,
    index: true
  },
  status: {
    type: String,
    enum: ['Present', 'Unscheduled Absence', 'PTO', 'Sick Leave'],
    required: true,
    index: true
  },
  
}, {
  timestamps: true,
  collection: 'attendance'
});

// Compound index to ensure one record per employee per day (using date_time_in)
AttendanceSchema.index({ employeeId: 1, date_time_in: 1 }, { unique: false });

// Indexes for better query performance
AttendanceSchema.index({ date_time_in: 1, status: 1 });
AttendanceSchema.index({ employeeId: 1, status: 1 });
AttendanceSchema.index({ status: 1 });



// Virtual for is present
AttendanceSchema.virtual('isPresent').get(function() {
  return this.status === 'Present';
});

// Ensure virtual fields are serialized
AttendanceSchema.set('toJSON', {
  virtuals: true
});



