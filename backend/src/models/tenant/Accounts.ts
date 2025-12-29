import { Schema, Document } from 'mongoose';

export interface IAccounts extends Document {
  accountId: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const AccountsSchema = new Schema<IAccounts>({
  accountId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  accountName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  accountType: {
    type: String,
    enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
    required: true,
    index: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'accounts'
});

// Indexes for better query performance
AccountsSchema.index({ accountType: 1, isActive: 1 });
AccountsSchema.index({ currency: 1 });
AccountsSchema.index({ balance: 1 });



