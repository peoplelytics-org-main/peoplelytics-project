import { Connection, Model } from 'mongoose';
import { IAccounts, AccountsSchema } from '../models/tenant/Accounts';
import { logger } from '../utils/helpers/logger';

export interface AccountsQueryFilters {
  accountType?: string;
  currency?: string;
  isActive?: boolean;
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

export const getAccountsModel = (connection: Connection): Model<IAccounts> => {
  if (connection.models.Accounts) {
    return connection.models.Accounts as Model<IAccounts>;
  }
  return connection.model<IAccounts>('Accounts', AccountsSchema);
};

export const buildAccountsQuery = (filters: AccountsQueryFilters) => {
  const query: any = {};
  if (filters.accountType) query.accountType = filters.accountType;
  if (filters.currency) query.currency = filters.currency;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  if (filters.search) {
    query.$or = [
      { accountName: { $regex: filters.search, $options: 'i' } },
      { accountId: { $regex: filters.search, $options: 'i' } },
    ];
  }
  return query;
};

export const getAccounts = async (
  AccountsModel: Model<IAccounts>,
  filters: AccountsQueryFilters,
  pagination: PaginationOptions
): Promise<PaginatedResult<IAccounts>> => {
  try {
    const query = buildAccountsQuery(filters);
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [accounts, total] = await Promise.all([
      AccountsModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean() as Promise<IAccounts[]>,
      AccountsModel.countDocuments(query),
    ]);
    return { data: accounts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  } catch (error) {
    logger.error('Error fetching accounts:', error);
    throw error;
  }
};

export const getAccountById = async (AccountsModel: Model<IAccounts>, accountId: string): Promise<IAccounts | null> => {
  try {
    return (await AccountsModel.findOne({ accountId }).lean()) as IAccounts | null;
  } catch (error) {
    logger.error('Error fetching account by ID:', error);
    throw error;
  }
};

export const createAccount = async (AccountsModel: Model<IAccounts>, accountData: Partial<IAccounts>): Promise<IAccounts> => {
  try {
    const account = await AccountsModel.create(accountData);
    return account.toObject() as IAccounts;
  } catch (error) {
    logger.error('Error creating account:', error);
    throw error;
  }
};

export const updateAccount = async (AccountsModel: Model<IAccounts>, accountId: string, updateData: Partial<IAccounts>): Promise<IAccounts | null> => {
  try {
    return (await AccountsModel.findOneAndUpdate({ accountId }, { $set: updateData }, { new: true, runValidators: true }).lean()) as IAccounts | null;
  } catch (error) {
    logger.error('Error updating account:', error);
    throw error;
  }
};

export const deleteAccount = async (AccountsModel: Model<IAccounts>, accountId: string): Promise<boolean> => {
  try {
    const result = await AccountsModel.deleteOne({ accountId });
    return result.deletedCount === 1;
  } catch (error) {
    logger.error('Error deleting account:', error);
    throw error;
  }
};

export const getAccountsStats = async (AccountsModel: Model<IAccounts>): Promise<{
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
  totalBalance: number;
  byCurrency: Record<string, number>;
}> => {
  try {
    const [total, active, allAccounts] = await Promise.all([
      AccountsModel.countDocuments(),
      AccountsModel.countDocuments({ isActive: true }),
      AccountsModel.find().lean() as Promise<IAccounts[]>,
    ]);
    const byType: Record<string, number> = {};
    const byCurrency: Record<string, number> = {};
    let totalBalance = 0;
    allAccounts.forEach(acc => {
      byType[acc.accountType] = (byType[acc.accountType] || 0) + 1;
      byCurrency[acc.currency] = (byCurrency[acc.currency] || 0) + acc.balance;
      totalBalance += acc.balance;
    });
    return { total, active, inactive: total - active, byType, totalBalance, byCurrency };
  } catch (error) {
    logger.error('Error fetching accounts stats:', error);
    throw error;
  }
};
