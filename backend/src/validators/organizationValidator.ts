import { body, query, param } from 'express-validator';

export const validateCreateOrganization = [
  body('name')
    .notEmpty()
    .withMessage('Organization name is required')
    .isString()
    .withMessage('Organization name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),
  body('subscriptionStartDate')
    .optional()
    .isISO8601()
    .withMessage('Subscription start date must be a valid ISO 8601 date'),
  body('subscriptionEndDate')
    .optional()
    .isISO8601()
    .withMessage('Subscription end date must be a valid ISO 8601 date'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
  body('package')
    .optional()
    .isIn(['Basic', 'Intermediate', 'Pro', 'Enterprise'])
    .withMessage('Package must be Basic, Intermediate, Pro, or Enterprise'),
  body('employeeCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Employee count must be a non-negative integer'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (months)'),
];

export const validateUpdateOrganization = [
  param('orgId')
    .notEmpty()
    .withMessage('Organization ID is required'),
  body('name')
    .optional()
    .isString()
    .withMessage('Organization name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),
  body('subscriptionStartDate')
    .optional()
    .isISO8601()
    .withMessage('Subscription start date must be a valid ISO 8601 date'),
  body('subscriptionEndDate')
    .optional()
    .isISO8601()
    .withMessage('Subscription end date must be a valid ISO 8601 date'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
  body('package')
    .optional()
    .isIn(['Basic', 'Intermediate', 'Pro', 'Enterprise'])
    .withMessage('Package must be Basic, Intermediate, Pro, or Enterprise'),
  body('employeeCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Employee count must be a non-negative integer'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be an object'),
  body('features')
    .optional()
    .isObject()
    .withMessage('Features must be an object'),
];

export const validateGetOrganizations = [
  query('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
  query('package')
    .optional()
    .isIn(['Basic', 'Intermediate', 'Pro', 'Enterprise'])
    .withMessage('Package must be Basic, Intermediate, Pro, or Enterprise'),
];

export const validateGetOrganizationById = [
  param('orgId')
    .notEmpty()
    .withMessage('Organization ID is required'),
];

export const validateDeleteOrganization = [
  param('orgId')
    .notEmpty()
    .withMessage('Organization ID is required'),
  body('confirm')
    .equals('DELETE')
    .withMessage('Please confirm deletion by sending { "confirm": "DELETE" }'),
];



