import { Connection, Model } from 'mongoose';
import { IExpenses, ExpensesSchema } from '../models/tenant/Expenses';
import { logger } from '../utils/helpers/logger';

export interface ExpensesQueryFilters {
  employeeId?: string;
  department?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getExpensesModel = (connection: Connection): Model<IExpenses> => {
  if (connection.models.Expenses) {
    return connection.models.Expenses as Model<IExpenses>;
  }
  return connection.model<IExpenses>('Expenses', ExpensesSchema);
};

export const buildExpensesQuery = (filters: ExpensesQueryFilters) => {
  const query: any = {};
  if (filters.employeeId) query.employeeId = filters.employeeId;
  if (filters.department) query.department = filters.department;
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.startDate || filters.endDate) {
    query.expenseDate = {};
    if (filters.startDate) query.expenseDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.expenseDate.$lte = new Date(filters.endDate);
  }
  if (filters.search) {
    query.$or = [
      { description: { $regex: filters.search, $options: 'i' } },
      { expenseId: { $regex: filters.search, $options: 'i' } },
      { employeeName: { $regex: filters.search, $options: 'i' } },
    ];
  }
  return query;
};

export const getExpenses = async (
  ExpensesModel: Model<IExpenses>,
  filters: ExpensesQueryFilters,
  pagination: PaginationOptions
): Promise<PaginatedResult<IExpenses>> => {
  try {
    const query = buildExpensesQuery(filters);
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [expenses, total] = await Promise.all([
      ExpensesModel.find(query).sort({ expenseDate: -1 }).skip(skip).limit(limit).lean() as Promise<IExpenses[]>,
      ExpensesModel.countDocuments(query),
    ]);
    return { data: expenses, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  } catch (error) {
    logger.error('Error fetching expenses:', error);
    throw error;
  }
};

export const getExpenseById = async (ExpensesModel: Model<IExpenses>, expenseId: string): Promise<IExpenses | null> => {
  try {
    return (await ExpensesModel.findOne({ expenseId }).lean()) as IExpenses | null;
  } catch (error) {
    logger.error('Error fetching expense by ID:', error);
    throw error;
  }
};

export const createExpense = async (ExpensesModel: Model<IExpenses>, expenseData: Partial<IExpenses>): Promise<IExpenses> => {
  try {
    const expense = await ExpensesModel.create(expenseData);
    return expense.toObject() as IExpenses;
  } catch (error) {
    logger.error('Error creating expense:', error);
    throw error;
  }
};

export const updateExpense = async (ExpensesModel: Model<IExpenses>, expenseId: string, updateData: Partial<IExpenses>): Promise<IExpenses | null> => {
  try {
    return (await ExpensesModel.findOneAndUpdate({ expenseId }, { $set: updateData }, { new: true, runValidators: true }).lean()) as IExpenses | null;
  } catch (error) {
    logger.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (ExpensesModel: Model<IExpenses>, expenseId: string): Promise<boolean> => {
  try {
    const result = await ExpensesModel.deleteOne({ expenseId });
    return result.deletedCount === 1;
  } catch (error) {
    logger.error('Error deleting expense:', error);
    throw error;
  }
};

export const getExpensesStats = async (ExpensesModel: Model<IExpenses>): Promise<{
  total: number;
  totalAmount: number;
  averageAmount: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byDepartment: Record<string, number>;
}> => {
  try {
    const allExpenses = (await ExpensesModel.find().lean()) as IExpenses[];
    const total = allExpenses.length;
    const totalAmount = allExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const averageAmount = total > 0 ? totalAmount / total : 0;
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};
    allExpenses.forEach(exp => {
      byStatus[exp.status] = (byStatus[exp.status] || 0) + 1;
      byCategory[exp.category] = (byCategory[exp.category] || 0) + (exp.amount || 0);
      if (exp.department) byDepartment[exp.department] = (byDepartment[exp.department] || 0) + (exp.amount || 0);
    });
    return { total, totalAmount, averageAmount, byStatus, byCategory, byDepartment };
  } catch (error) {
    logger.error('Error fetching expenses stats:', error);
    throw error;
  }
};



