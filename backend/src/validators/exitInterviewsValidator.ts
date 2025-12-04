import { body, query, param } from 'express-validator';

export const validateCreateExitInterview = [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isString()
    .withMessage('Employee ID must be a string')
    .trim(),
  body('primaryReasonForLeaving')
    .notEmpty()
    .withMessage('Primary reason for leaving is required')
    .isString()
    .withMessage('Primary reason must be a string')
    .trim(),
  body('secondaryReasonForLeaving')
    .optional()
    .isString()
    .withMessage('Secondary reason must be a string')
    .trim(),
  body('management.sentiment')
    .notEmpty()
    .withMessage('Management sentiment is required')
    .isIn(['Positive', 'Neutral', 'Negative'])
    .withMessage('Management sentiment must be Positive, Neutral, or Negative'),
  body('management.quote')
    .notEmpty()
    .withMessage('Management quote is required')
    .isString()
    .withMessage('Management quote must be a string')
    .trim(),
  body('management.summary')
    .notEmpty()
    .withMessage('Management summary is required')
    .isString()
    .withMessage('Management summary must be a string')
    .trim(),
  body('compensation.sentiment')
    .notEmpty()
    .withMessage('Compensation sentiment is required')
    .isIn(['Positive', 'Neutral', 'Negative'])
    .withMessage('Compensation sentiment must be Positive, Neutral, or Negative'),
  body('compensation.quote')
    .notEmpty()
    .withMessage('Compensation quote is required')
    .isString()
    .withMessage('Compensation quote must be a string')
    .trim(),
  body('compensation.summary')
    .notEmpty()
    .withMessage('Compensation summary is required')
    .isString()
    .withMessage('Compensation summary must be a string')
    .trim(),
  body('culture.sentiment')
    .notEmpty()
    .withMessage('Culture sentiment is required')
    .isIn(['Positive', 'Neutral', 'Negative'])
    .withMessage('Culture sentiment must be Positive, Neutral, or Negative'),
  body('culture.quote')
    .notEmpty()
    .withMessage('Culture quote is required')
    .isString()
    .withMessage('Culture quote must be a string')
    .trim(),
  body('culture.summary')
    .notEmpty()
    .withMessage('Culture summary is required')
    .isString()
    .withMessage('Culture summary must be a string')
    .trim(),
];

export const validateUpdateExitInterview = [
  param('id')
    .notEmpty()
    .withMessage('Exit interview ID is required'),
  body('primaryReasonForLeaving')
    .optional()
    .isString()
    .withMessage('Primary reason must be a string')
    .trim(),
  body('secondaryReasonForLeaving')
    .optional()
    .isString()
    .withMessage('Secondary reason must be a string')
    .trim(),
  body('management.sentiment')
    .optional()
    .isIn(['Positive', 'Neutral', 'Negative'])
    .withMessage('Management sentiment must be Positive, Neutral, or Negative'),
  body('management.quote')
    .optional()
    .isString()
    .withMessage('Management quote must be a string')
    .trim(),
  body('management.summary')
    .optional()
    .isString()
    .withMessage('Management summary must be a string')
    .trim(),
  body('compensation.sentiment')
    .optional()
    .isIn(['Positive', 'Neutral', 'Negative'])
    .withMessage('Compensation sentiment must be Positive, Neutral, or Negative'),
  body('compensation.quote')
    .optional()
    .isString()
    .withMessage('Compensation quote must be a string')
    .trim(),
  body('compensation.summary')
    .optional()
    .isString()
    .withMessage('Compensation summary must be a string')
    .trim(),
  body('culture.sentiment')
    .optional()
    .isIn(['Positive', 'Neutral', 'Negative'])
    .withMessage('Culture sentiment must be Positive, Neutral, or Negative'),
  body('culture.quote')
    .optional()
    .isString()
    .withMessage('Culture quote must be a string')
    .trim(),
  body('culture.summary')
    .optional()
    .isString()
    .withMessage('Culture summary must be a string')
    .trim(),
];

export const validateGetExitInterviews = [
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
    .withMessage('Employee ID must be a string')
    .trim(),
  query('primaryReasonForLeaving')
    .optional()
    .isString()
    .withMessage('Primary reason must be a string')
    .trim(),
  query('sentiment')
    .optional()
    .isIn(['Positive', 'Neutral', 'Negative'])
    .withMessage('Sentiment must be Positive, Neutral, or Negative'),
];

export const validateGetExitInterviewById = [
  param('id')
    .notEmpty()
    .withMessage('Exit interview ID is required'),
];

export const validateDeleteExitInterview = [
  param('id')
    .notEmpty()
    .withMessage('Exit interview ID is required'),
];



