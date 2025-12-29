import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Connection } from 'mongoose';
import { 
  getExpensesModel, 
  getExpenses, 
  getExpenseById, 
  createExpense, 
  updateExpense, 
  deleteExpense, 
  getExpensesStats,
  ExpensesQueryFilters,
  PaginationOptions
} from '../services/expensesService';
import { logger } from '../utils/helpers/logger';
import { DatabaseService } from '../services/tenant/databaseService';

const getOrgConnection = (req: Request): Connection => {
  const orgId = req.organizationId || (req as any).user?.organizationId;
  if (!orgId) throw new Error('Organization ID not found in request');
  const dbService = DatabaseService.getInstance();
  return dbService.getOrganizationConnection(orgId);
};

export const getAllExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const ExpensesModel = getExpensesModel(connection);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: ExpensesQueryFilters = {};
    if (req.query.employeeId) filters.employeeId = req.query.employeeId as string;
    if (req.query.department) filters.department = req.query.department as string;
    if (req.query.category) filters.category = req.query.category as string;
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.startDate) filters.startDate = req.query.startDate as string;
    if (req.query.endDate) filters.endDate = req.query.endDate as string;
    if (req.query.search) filters.search = req.query.search as string;
    const pagination: PaginationOptions = { page, limit };
    const result = await getExpenses(ExpensesModel, filters, pagination);
    return res.status(200).json({ success: true, data: { data: result.data, pagination: result.pagination } });
  } catch (error: any) {
    logger.error('Error in getAllExpenses:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch expenses' });
  }
};

export const getExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const ExpensesModel = getExpensesModel(connection);
    const expense = await getExpenseById(ExpensesModel, req.params.expenseId);
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
    return res.status(200).json({ success: true, data: expense });
  } catch (error: any) {
    logger.error('Error in getExpense:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch expense' });
  }
};

export const createExpenseController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const ExpensesModel = getExpensesModel(connection);
    const expense = await createExpense(ExpensesModel, req.body);
    return res.status(201).json({ success: true, data: expense });
  } catch (error: any) {
    logger.error('Error in createExpense:', error);
    if (error.code === 11000) return res.status(409).json({ success: false, error: 'Expense ID already exists' });
    return res.status(500).json({ success: false, error: error.message || 'Failed to create expense' });
  }
};

export const updateExpenseController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const ExpensesModel = getExpensesModel(connection);
    const expense = await updateExpense(ExpensesModel, req.params.expenseId, req.body);
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
    return res.status(200).json({ success: true, data: expense });
  } catch (error: any) {
    logger.error('Error in updateExpense:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update expense' });
  }
};

export const deleteExpenseController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const ExpensesModel = getExpensesModel(connection);
    const deleted = await deleteExpense(ExpensesModel, req.params.expenseId);
    if (!deleted) return res.status(404).json({ success: false, error: 'Expense not found' });
    return res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: any) {
    logger.error('Error in deleteExpense:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete expense' });
  }
};

export const getExpensesStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const ExpensesModel = getExpensesModel(connection);
    const stats = await getExpensesStats(ExpensesModel);
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Error in getExpensesStats:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch expenses statistics' });
  }
};



