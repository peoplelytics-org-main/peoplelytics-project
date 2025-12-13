import { body, query, param } from 'express-validator';

export const validateCreatePerformanceReview = [
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
  body('performanceRating')
    .notEmpty()
    .withMessage('Performance rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Performance rating must be between 1 and 5'),
  body('potentialRating')
    .notEmpty()
    .withMessage('Potential rating is required')
    .isInt({ min: 1, max: 3 })
    .withMessage('Potential rating must be between 1 and 3'),
  body('flightRiskScore')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Flight risk score must be between 0 and 5'),
  body('impactScore')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Impact score must be between 0 and 10'),
  body('trainingCompleted')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Training completed must be a non-negative integer'),
  body('trainingTotal')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Training total must be a non-negative integer'),
  body('weeklyHours')
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage('Weekly hours must be between 1 and 168'),
  body('hasGrievance')
    .optional()
    .isBoolean()
    .withMessage('Has grievance must be a boolean'),
];

export const validateUpdatePerformanceReview = [
  param('id')
    .notEmpty()
    .withMessage('Performance review ID is required'),
  body('performanceRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Performance rating must be between 1 and 5'),
  body('potentialRating')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Potential rating must be between 1 and 3'),
  body('flightRiskScore')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Flight risk score must be between 0 and 5'),
  body('impactScore')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Impact score must be between 0 and 10'),
  body('trainingCompleted')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Training completed must be a non-negative integer'),
  body('trainingTotal')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Training total must be a non-negative integer'),
  body('weeklyHours')
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage('Weekly hours must be between 1 and 168'),
  body('hasGrievance')
    .optional()
    .isBoolean()
    .withMessage('Has grievance must be a boolean'),
];

export const validateGetPerformanceReviews = [
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
    .withMessage('Employee ID must be a string')
    .trim(),
  query('performanceRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Performance rating must be between 1 and 5'),
  query('potentialRating')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Potential rating must be between 1 and 3'),
];

export const validateGetPerformanceReviewById = [
  param('id')
    .notEmpty()
    .withMessage('Performance review ID is required'),
];

export const validateDeletePerformanceReview = [
  param('id')
    .notEmpty()
    .withMessage('Performance review ID is required'),
];



