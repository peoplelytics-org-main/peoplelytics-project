import { body, query, param } from 'express-validator';

export const validateCreateJobPosition = [
  body('positionId')
    .notEmpty()
    .withMessage('Position ID is required')
    .isString()
    .withMessage('Position ID must be a string')
    .trim(),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .trim(),
  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .isString()
    .withMessage('Department must be a string')
    .trim(),
  body('status')
    .optional()
    .isIn(['Open', 'Closed', 'On Hold'])
    .withMessage('Status must be Open, Closed, or On Hold'),
  body('openDate')
    .optional()
    .isISO8601()
    .withMessage('Open date must be a valid ISO 8601 date'),
  body('closeDate')
    .optional()
    .isISO8601()
    .withMessage('Close date must be a valid ISO 8601 date'),
  body('hiredEmployeeId')
    .optional()
    .isString()
    .trim(),
  body('onHoldDate')
    .optional()
    .isISO8601()
    .withMessage('On hold date must be a valid ISO 8601 date'),
  body('heldBy')
    .optional()
    .isString()
    .trim(),
  body('positionType')
    .notEmpty()
    .withMessage('Position type is required')
    .isIn(['Replacement', 'New'])
    .withMessage('Position type must be Replacement or New'),
  body('budgetStatus')
    .notEmpty()
    .withMessage('Budget status is required')
    .isIn(['Budgeted', 'Non-Budgeted'])
    .withMessage('Budget status must be Budgeted or Non-Budgeted'),
];

export const validateUpdateJobPosition = [
  param('positionId')
    .notEmpty()
    .withMessage('Position ID is required'),
  body('title')
    .optional()
    .isString()
    .trim(),
  body('department')
    .optional()
    .isString()
    .trim(),
  body('status')
    .optional()
    .isIn(['Open', 'Closed', 'On Hold']),
  body('openDate')
    .optional()
    .isISO8601(),
  body('closeDate')
    .optional()
    .isISO8601(),
  body('hiredEmployeeId')
    .optional()
    .isString(),
  body('onHoldDate')
    .optional()
    .isISO8601(),
  body('heldBy')
    .optional()
    .isString(),
  body('positionType')
    .optional()
    .isIn(['Replacement', 'New']),
  body('budgetStatus')
    .optional()
    .isIn(['Budgeted', 'Non-Budgeted']),
];

export const validateGetJobPositions = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('department')
    .optional()
    .isString()
    .trim(),
  query('status')
    .optional()
    .isIn(['Open', 'Closed', 'On Hold']),
  query('positionType')
    .optional()
    .isIn(['Replacement', 'New']),
  query('budgetStatus')
    .optional()
    .isIn(['Budgeted', 'Non-Budgeted']),
];

export const validateGetJobPosition = [
  param('positionId')
    .notEmpty()
    .withMessage('Position ID is required'),
];

export const validateDeleteJobPosition = [
  param('positionId')
    .notEmpty()
    .withMessage('Position ID is required'),
];



