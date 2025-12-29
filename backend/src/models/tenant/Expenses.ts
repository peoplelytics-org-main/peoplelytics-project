import { Schema, Document } from 'mongoose';

export interface IExpenses extends Document {
  expenseId: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  expenseDate: Date;
  receiptUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const ExpensesSchema = new Schema<IExpenses>({
  expenseId: {
    type: String,
    required: true,
    unique: true,
    
  },
  employeeId: {
    type: String,
    
  },
  employeeName: {
    type: String,
    trim: true,
    
  },
  department: {
    type: String,
    trim: true,
    
  },
  category: {
    type: String,
    required: true,
    trim: true,
    
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  expenseDate: {
    type: Date,
    required: true,
    
  },
  receiptUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending',
    
  },
  approvedBy: {
    type: String,
    trim: true
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'expenses'
});

// Indexes for better query performance
ExpensesSchema.index({ employeeId: 1, expenseDate: 1 });
ExpensesSchema.index({ department: 1, expenseDate: 1 });
ExpensesSchema.index({ category: 1 });
ExpensesSchema.index({ status: 1, expenseDate: 1 });
ExpensesSchema.index({ expenseDate: 1 });



