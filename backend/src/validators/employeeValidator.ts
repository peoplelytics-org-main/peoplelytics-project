import { body, query, param } from 'express-validator';

export const validateCreateEmployee = [
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
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .isString()
    .withMessage('Department must be a string')
    .trim(),
  body('jobTitle')
    .notEmpty()
    .withMessage('Job title is required')
    .isString()
    .withMessage('Job title must be a string')
    .trim(),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isString()
    .withMessage('Location must be a string')
    .trim(),
  body('hireDate')
    .notEmpty()
    .withMessage('Hire date is required')
    .isISO8601()
    .withMessage('Hire date must be a valid ISO 8601 date'),
  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('terminationDate')
    .optional()
    .isISO8601()
    .withMessage('Termination date must be a valid ISO 8601 date'),
  body('terminationReason')
    .optional()
    .isIn(['Voluntary', 'Involuntary'])
    .withMessage('Termination reason must be Voluntary or Involuntary'),
  body('managerId')
    .optional()
    .isString()
    .withMessage('Manager ID must be a string'),
  body('successionStatus')
    .optional()
    .isIn(['Ready Now', 'Ready in 1-2 Years', 'Future Potential', 'Not Assessed'])
    .withMessage('Invalid succession status'),
];

export const validateUpdateEmployee = [
  param('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required'),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('department')
    .optional()
    .isString()
    .trim(),
  body('jobTitle')
    .optional()
    .isString()
    .trim(),
  body('location')
    .optional()
    .isString()
    .trim(),
  body('hireDate')
    .optional()
    .isISO8601()
    .withMessage('Hire date must be a valid ISO 8601 date'),
  body('terminationDate')
    .optional()
    .isISO8601()
    .withMessage('Termination date must be a valid ISO 8601 date'),
  body('terminationReason')
    .optional()
    .isIn(['Voluntary', 'Involuntary'])
    .withMessage('Termination reason must be Voluntary or Involuntary'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('managerId')
    .optional()
    .isString(),
  body('successionStatus')
    .optional()
    .isIn(['Ready Now', 'Ready in 1-2 Years', 'Future Potential', 'Not Assessed']),
];

export const validateGetEmployees = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 100'),
  query('department')
    .optional()
    .isString()
    .trim(),
  query('location')
    .optional()
    .isString()
    .trim(),
  query('jobTitle')
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

export const validateGetEmployee = [
  param('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required'),
];

export const validateDeleteEmployee = [
  param('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required'),
];

export const validateBulkCreateEmployees = [
  body('employees')
    .isArray({ min: 1 })
    .withMessage('Employees must be a non-empty array'),
  body('employees.*.employeeId')
    .notEmpty()
    .withMessage('Each employee must have an employeeId'),
  body('employees.*.name')
    .notEmpty()
    .withMessage('Each employee must have a name'),
  body('employees.*.department')
    .notEmpty()
    .withMessage('Each employee must have a department'),
  body('employees.*.jobTitle')
    .notEmpty()
    .withMessage('Each employee must have a jobTitle'),
  body('employees.*.location')
    .notEmpty()
    .withMessage('Each employee must have a location'),
  body('employees.*.hireDate')
    .notEmpty()
    .withMessage('Each employee must have a hireDate'),
  body('employees.*.gender')
    .notEmpty()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Each employee must have a valid gender'),
];



