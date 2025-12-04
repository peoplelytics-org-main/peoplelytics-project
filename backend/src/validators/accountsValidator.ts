import { body, query, param } from 'express-validator';

export const validateCreateAccount = [
  body('accountId')
    .notEmpty()
    .withMessage('Account ID is required')
    .isString()
    .trim(),
  body('accountName')
    .notEmpty()
    .withMessage('Account name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 }),
  body('accountType')
    .notEmpty()
    .withMessage('Account type is required')
    .isIn(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']),
  body('balance')
    .optional()
    .isNumeric()
    .withMessage('Balance must be a number'),
  body('currency')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 3 }),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('isActive')
    .optional()
    .isBoolean(),
];

export const validateUpdateAccount = [
  param('accountId').notEmpty(),
  body('accountName').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('accountType').optional().isIn(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']),
  body('balance').optional().isNumeric(),
  body('currency').optional().isString().trim().isLength({ min: 3, max: 3 }),
  body('description').optional().isString().trim(),
  body('isActive').optional().isBoolean(),
];

export const validateGetAccounts = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('accountType').optional().isString(),
  query('currency').optional().isString(),
  query('isActive').optional().isBoolean(),
  query('search').optional().isString().trim(),
];

export const validateGetAccount = [param('accountId').notEmpty()];
export const validateDeleteAccount = [param('accountId').notEmpty()];



