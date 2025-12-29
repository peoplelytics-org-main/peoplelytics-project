import { body, query, param } from 'express-validator';

export const validateCreateDepartment = [
  body('departmentId')
    .notEmpty()
    .withMessage('Department ID is required')
    .isString()
    .withMessage('Department ID must be a string')
    .trim(),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .trim(),
  body('headOfDepartment')
    .notEmpty()
    .withMessage('Head of Department is required')
    .isString()
    .withMessage('Head of Department must be a string')
    .trim(),
  body('budget')
    .notEmpty()
    .withMessage('Budget is required')
    .isNumeric()
    .withMessage('Budget must be a number')
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isString()
    .withMessage('Location must be a string')
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const validateUpdateDepartment = [
  param('departmentId')
    .notEmpty()
    .withMessage('Department ID is required'),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('headOfDepartment')
    .optional()
    .isString()
    .trim(),
  body('budget')
    .optional()
    .isNumeric()
    .withMessage('Budget must be a number')
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
  body('location')
    .optional()
    .isString()
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const validateGetDepartments = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('name')
    .optional()
    .isString()
    .trim(),
  query('location')
    .optional()
    .isString()
    .trim(),
  query('headOfDepartment')
    .optional()
    .isString()
    .trim(),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('search')
    .optional()
    .isString()
    .trim(),
];

export const validateGetDepartment = [
  param('departmentId')
    .notEmpty()
    .withMessage('Department ID is required'),
];

export const validateDeleteDepartment = [
  param('departmentId')
    .notEmpty()
    .withMessage('Department ID is required'),
];



