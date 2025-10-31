import mongoose from 'mongoose';
import { getOrgConnection } from './orgConnection';

// Define schemas once
const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  role: String
});

const attendanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: Date,
  status: String, // present, absent, etc.
});

const accountSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  balance: Number,
  lastUpdated: Date,
});

const expenseSchema = new mongoose.Schema({
  category: String,
  amount: Number,
  date: Date,
});

const leaveSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  startDate: Date,
  endDate: Date,
  reason: String,
  status: String,
});

// Return all models for one org
export const getOrgModels = (orgName: string) => {
  const conn = getOrgConnection(orgName);

  return {
    User: conn.model('Users', userSchema),
    Account: conn.model('Accounts', accountSchema),
    Attendance: conn.model('Attendance', attendanceSchema),
    Expense: conn.model('Expenses', expenseSchema),
    Leave: conn.model('Leaves', leaveSchema),
  };
};



