import { body, query, param } from 'express-validator';

export const validateCreateEmployeeFeedback = [
  body('satisId')
    .notEmpty()
    .withMessage('Satisfaction ID is required')
    .isString()
    .withMessage('Satisfaction ID must be a string')
    .trim(),
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isString()
    .withMessage('Employee ID must be a string')
    .trim(),
  body('engagementScore')
    .notEmpty()
    .withMessage('Engagement score is required')
    .isInt({ min: 0, max: 100 })
    .withMessage('Engagement score must be an integer between 0 and 100'),
  body('compensationSatisfaction')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Compensation satisfaction must be an integer between 0 and 100'),
  body('benefitsSatisfaction')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Benefits satisfaction must be an integer between 0 and 100'),
  body('managementSatisfaction')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Management satisfaction must be an integer between 0 and 100'),
  body('trainingSatisfaction')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Training satisfaction must be an integer between 0 and 100'),
];

export const validateUpdateEmployeeFeedback = [
  param('satisId')
    .notEmpty()
    .withMessage('Satisfaction ID is required'),
  body('satisId')
    .optional()
    .isString()
    .trim(),
  body('employeeId')
    .optional()
    .isString()
    .trim(),
  body('engagementScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Engagement score must be an integer between 0 and 100'),
  body('compensationSatisfaction')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Compensation satisfaction must be an integer between 0 and 100'),
  body('benefitsSatisfaction')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Benefits satisfaction must be an integer between 0 and 100'),
  body('managementSatisfaction')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Management satisfaction must be an integer between 0 and 100'),
  body('trainingSatisfaction')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Training satisfaction must be an integer between 0 and 100'),
];

export const validateGetEmployeeFeedback = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('employeeId')
    .optional()
    .isString()
    .trim(),
  query('minEngagementScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Min engagement score must be between 0 and 100'),
  query('maxEngagementScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Max engagement score must be between 0 and 100'),
];

export const validateGetEmployeeFeedbackById = [
  param('satisId')
    .notEmpty()
    .withMessage('Satisfaction ID is required'),
];

export const validateGetEmployeeFeedbackByEmployee = [
  param('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required'),
];

export const validateDeleteEmployeeFeedback = [
  param('satisId')
    .notEmpty()
    .withMessage('Satisfaction ID is required'),
];

