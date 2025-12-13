import { body, query, param } from 'express-validator';

export const validateCreateSkill = [
  body('skillLevelId')
    .notEmpty()
    .withMessage('Skill level ID is required')
    .isString()
    .withMessage('Skill level ID must be a string')
    .trim(),
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isString()
    .withMessage('Employee ID must be a string')
    .trim(),
  body('employeeName')
    .notEmpty()
    .withMessage('Employee name is required')
    .isString()
    .withMessage('Employee name must be a string')
    .trim(),
  body('skillName')
    .notEmpty()
    .withMessage('Skill name is required')
    .isString()
    .withMessage('Skill name must be a string')
    .trim(),
  body('skillLevel')
    .notEmpty()
    .withMessage('Skill level is required')
    .isIn(['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'])
    .withMessage('Skill level must be Novice, Beginner, Competent, Proficient, or Expert'),
];

export const validateUpdateSkill = [
  param('skillLevelId')
    .notEmpty()
    .withMessage('Skill level ID is required'),
  body('skillLevel')
    .optional()
    .isIn(['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'])
    .withMessage('Skill level must be Novice, Beginner, Competent, Proficient, or Expert'),
  body('skillName')
    .optional()
    .isString()
    .trim(),
];

export const validateGetSkills = [
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
  query('skillName')
    .optional()
    .isString()
    .trim(),
  query('skillLevel')
    .optional()
    .isIn(['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert']),
];

export const validateGetSkill = [
  param('skillLevelId')
    .notEmpty()
    .withMessage('Skill level ID is required'),
];

export const validateDeleteSkill = [
  param('skillLevelId')
    .notEmpty()
    .withMessage('Skill level ID is required'),
];

export const validateBulkCreateSkills = [
  body('skills')
    .isArray({ min: 1 })
    .withMessage('Skills must be a non-empty array'),
  body('skills.*.skillLevelId')
    .notEmpty()
    .withMessage('Each skill must have a skillLevelId'),
  body('skills.*.employeeId')
    .notEmpty()
    .withMessage('Each skill must have an employeeId'),
  body('skills.*.employeeName')
    .notEmpty()
    .withMessage('Each skill must have an employeeName'),
  body('skills.*.skillName')
    .notEmpty()
    .withMessage('Each skill must have a skillName'),
  body('skills.*.skillLevel')
    .notEmpty()
    .isIn(['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'])
    .withMessage('Each skill must have a valid skillLevel'),
];



