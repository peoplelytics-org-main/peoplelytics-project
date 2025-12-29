import { body, query, param } from 'express-validator';

export const validateCreateExpense = [
  body('expenseId').notEmpty().isString().trim(),
  body('category').notEmpty().isString().trim(),
  body('amount').notEmpty().isNumeric().isFloat({ min: 0 }),
  body('currency').optional().isString().trim().isLength({ min: 3, max: 3 }),
  body('description').notEmpty().isString().trim(),
  body('expenseDate').notEmpty().isISO8601(),
  body('employeeId').optional().isString().trim(),
  body('employeeName').optional().isString().trim(),
  body('department').optional().isString().trim(),
  body('receiptUrl').optional().isString().trim(),
  body('status').optional().isIn(['Pending', 'Approved', 'Rejected', 'Paid']),
];

export const validateUpdateExpense = [
  param('expenseId').notEmpty(),
  body('category').optional().isString().trim(),
  body('amount').optional().isNumeric().isFloat({ min: 0 }),
  body('currency').optional().isString().trim().isLength({ min: 3, max: 3 }),
  body('description').optional().isString().trim(),
  body('expenseDate').optional().isISO8601(),
  body('employeeId').optional().isString().trim(),
  body('employeeName').optional().isString().trim(),
  body('department').optional().isString().trim(),
  body('receiptUrl').optional().isString().trim(),
  body('status').optional().isIn(['Pending', 'Approved', 'Rejected', 'Paid']),
  body('approvedBy').optional().isString().trim(),
  body('approvedAt').optional().isISO8601(),
];

export const validateGetExpenses = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('employeeId').optional().isString(),
  query('department').optional().isString(),
  query('category').optional().isString(),
  query('status').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('search').optional().isString().trim(),
];

export const validateGetExpense = [param('expenseId').notEmpty()];
export const validateDeleteExpense = [param('expenseId').notEmpty()];



