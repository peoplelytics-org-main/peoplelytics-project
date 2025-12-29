import mongoose, { Schema, Document } from 'mongoose';

export interface IJobPositions extends Document {
  positionId: string;
  title: string;
  department: string;
  status: 'Open' | 'Closed' | 'On Hold';
  openDate: Date;
  closeDate?: Date;
  hiredEmployeeId?: string;
  onHoldDate?: Date;
  heldBy?: string;
  positionType: 'Replacement' | 'New';
  budgetStatus: 'Budgeted' | 'Non-Budgeted';
  createdAt: Date;
  updatedAt: Date;
}

export const JobPositionsSchema = new Schema<IJobPositions>({
  positionId: {
    type: String,
    required: true,
    unique: true,
    
  },
  title: {
    type: String,
    required: true,
    trim: true,
    
  },
  department: {
    type: String,
    required: true,
    trim: true,
    
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'On Hold'],
    required: true,
    default: 'Open',
    
  },
  openDate: {
    type: Date,
    required: true,
    default: Date.now,
    
  },
  closeDate: {
    type: Date,
    
  },
  hiredEmployeeId: {
    type: String,
    ref:"employees",
    
  },
  onHoldDate: {
    type: Date,
    
  },
  heldBy: {
    type: String,
    ref:"employees",
    trim: true
  },
  positionType: {
    type: String,
    enum: ['Replacement', 'New'],
    required: true,
    
  },
  budgetStatus: {
    type: String,
    enum: ['Budgeted', 'Non-Budgeted'],
    required: true,
    
  },
  
}, {
  timestamps: true,
  collection: 'job_positions'
});

// Indexes for better query performance
JobPositionsSchema.index({ department: 1, status: 1 });
JobPositionsSchema.index({ positionType: 1, budgetStatus: 1 });
JobPositionsSchema.index({ openDate: 1, closeDate: 1 });
JobPositionsSchema.index({ hiredEmployeeId: 1 });
JobPositionsSchema.index({ status: 1, department: 1 });

// Virtual for days open
JobPositionsSchema.virtual('daysOpen').get(function() {
  const endDate = this.closeDate || new Date();
  const diffTime = Math.abs(endDate.getTime() - this.openDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is currently open
JobPositionsSchema.virtual('isOpen').get(function() {
  return this.status === 'Open';
});

// Ensure virtual fields are serialized
JobPositionsSchema.set('toJSON', {
  virtuals: true
});

//export const JobPositions = mongoose.model<IJobPositions>('JobPositions', JobPositionsSchema);

