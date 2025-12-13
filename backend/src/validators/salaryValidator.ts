import { body, query, param } from 'express-validator';

export const validateCreateSalary = [
  body('salaryId')
    .notEmpty()
    .withMessage('Salary ID is required')
    .isString()
    .withMessage('Salary ID must be a string')
    .trim(),
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isString()
    .withMessage('Employee ID must be a string')
    .trim(),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim(),
  body('salary')
    .notEmpty()
    .withMessage('Salary is required')
    .isNumeric()
    .withMessage('Salary must be a number')
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  body('bonus')
    .optional()
    .isNumeric()
    .withMessage('Bonus must be a number')
    .isFloat({ min: 0 })
    .withMessage('Bonus must be a positive number'),
  body('lastRaiseAmount')
    .optional()
    .isNumeric()
    .withMessage('Last raise amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Last raise amount must be a positive number'),
  body('lastRaiseDate')
    .optional()
    .isISO8601()
    .withMessage('Last raise date must be a valid ISO 8601 date'),
];

export const validateUpdateSalary = [
  param('salaryId')
    .notEmpty()
    .withMessage('Salary ID is required'),
  body('employeeId')
    .optional()
    .isString()
    .trim(),
  body('name')
    .optional()
    .isString()
    .trim(),
  body('salary')
    .optional()
    .isNumeric()
    .withMessage('Salary must be a number')
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  body('bonus')
    .optional()
    .isNumeric()
    .withMessage('Bonus must be a number')
    .isFloat({ min: 0 })
    .withMessage('Bonus must be a positive number'),
  body('lastRaiseAmount')
    .optional()
    .isNumeric()
    .withMessage('Last raise amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Last raise amount must be a positive number'),
  body('lastRaiseDate')
    .optional()
    .isISO8601()
    .withMessage('Last raise date must be a valid ISO 8601 date'),
];

export const validateGetSalaries = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 100'),
  query('employeeId')
    .optional()
    .isString()
    .trim(),
  query('name')
    .optional()
    .isString()
    .trim(),
  query('search')
    .optional()
    .isString()
    .trim(),
];

export const validateGetSalary = [
  param('salaryId')
    .notEmpty()
    .withMessage('Salary ID is required'),
];

export const validateDeleteSalary = [
  param('salaryId')
    .notEmpty()
    .withMessage('Salary ID is required'),
];



