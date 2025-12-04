import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Connection } from 'mongoose';
import { 
  getAccountsModel, 
  getAccounts, 
  getAccountById, 
  createAccount, 
  updateAccount, 
  deleteAccount, 
  getAccountsStats,
  AccountsQueryFilters,
  PaginationOptions
} from '../services/accountsService';
import { logger } from '../utils/helpers/logger';
import { DatabaseService } from '../services/tenant/databaseService';

const getOrgConnection = (req: Request): Connection => {
  const orgId = req.organizationId || (req as any).user?.organizationId;
  if (!orgId) throw new Error('Organization ID not found in request');
  const dbService = DatabaseService.getInstance();
  return dbService.getOrganizationConnection(orgId);
};

export const getAllAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const AccountsModel = getAccountsModel(connection);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: AccountsQueryFilters = {};
    if (req.query.accountType) filters.accountType = req.query.accountType as string;
    if (req.query.currency) filters.currency = req.query.currency as string;
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
    if (req.query.search) filters.search = req.query.search as string;
    const pagination: PaginationOptions = { page, limit };
    const result = await getAccounts(AccountsModel, filters, pagination);
    return res.status(200).json({ success: true, data: { data: result.data, pagination: result.pagination } });
  } catch (error: any) {
    logger.error('Error in getAllAccounts:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch accounts' });
  }
};

export const getAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const AccountsModel = getAccountsModel(connection);
    const account = await getAccountById(AccountsModel, req.params.accountId);
    if (!account) return res.status(404).json({ success: false, error: 'Account not found' });
    return res.status(200).json({ success: true, data: account });
  } catch (error: any) {
    logger.error('Error in getAccount:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch account' });
  }
};

export const createAccountController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const AccountsModel = getAccountsModel(connection);
    const account = await createAccount(AccountsModel, req.body);
    return res.status(201).json({ success: true, data: account });
  } catch (error: any) {
    logger.error('Error in createAccount:', error);
    if (error.code === 11000) return res.status(409).json({ success: false, error: 'Account ID already exists' });
    return res.status(500).json({ success: false, error: error.message || 'Failed to create account' });
  }
};

export const updateAccountController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const AccountsModel = getAccountsModel(connection);
    const account = await updateAccount(AccountsModel, req.params.accountId, req.body);
    if (!account) return res.status(404).json({ success: false, error: 'Account not found' });
    return res.status(200).json({ success: true, data: account });
  } catch (error: any) {
    logger.error('Error in updateAccount:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update account' });
  }
};

export const deleteAccountController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const connection = getOrgConnection(req);
    const AccountsModel = getAccountsModel(connection);
    const deleted = await deleteAccount(AccountsModel, req.params.accountId);
    if (!deleted) return res.status(404).json({ success: false, error: 'Account not found' });
    return res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error: any) {
    logger.error('Error in deleteAccount:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete account' });
  }
};

export const getAccountsStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getOrgConnection(req);
    const AccountsModel = getAccountsModel(connection);
    const stats = await getAccountsStats(AccountsModel);
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Error in getAccountsStats:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch accounts statistics' });
  }
};



