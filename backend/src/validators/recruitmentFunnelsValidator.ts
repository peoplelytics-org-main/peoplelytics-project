import { body, query, param } from 'express-validator';

export const validateCreateRecruitmentFunnel = [
  body('rec_funnel_id')
    .notEmpty()
    .withMessage('Recruitment funnel ID is required')
    .isString()
    .withMessage('Recruitment funnel ID must be a string')
    .trim(),
  body('positionId')
    .notEmpty()
    .withMessage('Position ID is required')
    .isString()
    .withMessage('Position ID must be a string')
    .trim(),
  body('shortlisted')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Shortlisted must be a non-negative integer'),
  body('interviewed')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Interviewed must be a non-negative integer'),
  body('offersExtended')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offers extended must be a non-negative integer'),
  body('offersAccepted')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offers accepted must be a non-negative integer'),
  body('joined')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Joined must be a non-negative integer'),
];

export const validateUpdateRecruitmentFunnel = [
  param('id')
    .notEmpty()
    .withMessage('Recruitment funnel ID is required'),
  body('shortlisted')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Shortlisted must be a non-negative integer'),
  body('interviewed')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Interviewed must be a non-negative integer'),
  body('offersExtended')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offers extended must be a non-negative integer'),
  body('offersAccepted')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offers accepted must be a non-negative integer'),
  body('joined')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Joined must be a non-negative integer'),
];

export const validateGetRecruitmentFunnels = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('positionId')
    .optional()
    .isString()
    .withMessage('Position ID must be a string')
    .trim(),
];

export const validateGetRecruitmentFunnelById = [
  param('id')
    .notEmpty()
    .withMessage('Recruitment funnel ID is required'),
];

export const validateDeleteRecruitmentFunnel = [
  param('id')
    .notEmpty()
    .withMessage('Recruitment funnel ID is required'),
];



