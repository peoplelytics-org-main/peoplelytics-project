import { body, query, param } from 'express-validator';

export const validateCreateAttendance = [
  body('attendanceId')
    .notEmpty()
    .withMessage('Attendance ID is required')
    .isString()
    .withMessage('Attendance ID must be a string')
    .trim(),
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isString()
    .withMessage('Employee ID must be a string')
    .trim(),
  body('date_time_in')
    .notEmpty()
    .withMessage('Date time in is required')
    .isISO8601()
    .withMessage('Date time in must be a valid ISO 8601 date'),
  body('date_time_out')
    .optional()
    .isISO8601()
    .withMessage('Date time out must be a valid ISO 8601 date'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Present', 'Unscheduled Absence', 'PTO', 'Sick Leave'])
    .withMessage('Status must be Present, Unscheduled Absence, PTO, or Sick Leave'),
];

export const validateUpdateAttendance = [
  param('attendanceId')
    .notEmpty()
    .withMessage('Attendance ID is required'),
  body('employeeId')
    .optional()
    .isString()
    .trim(),
  body('date_time_in')
    .optional()
    .isISO8601()
    .withMessage('Date time in must be a valid ISO 8601 date'),
  body('date_time_out')
    .optional()
    .isISO8601()
    .withMessage('Date time out must be a valid ISO 8601 date'),
  body('status')
    .optional()
    .isIn(['Present', 'Unscheduled Absence', 'PTO', 'Sick Leave'])
    .withMessage('Status must be Present, Unscheduled Absence, PTO, or Sick Leave'),
];

export const validateGetAttendance = [
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
  query('status')
    .optional()
    .isIn(['Present', 'Unscheduled Absence', 'PTO', 'Sick Leave']),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
];

export const validateGetAttendanceById = [
  param('attendanceId')
    .notEmpty()
    .withMessage('Attendance ID is required'),
];

export const validateDeleteAttendance = [
  param('attendanceId')
    .notEmpty()
    .withMessage('Attendance ID is required'),
];

export const validateBulkCreateAttendance = [
  body('attendanceRecords')
    .isArray({ min: 1 })
    .withMessage('Attendance records must be a non-empty array'),
  body('attendanceRecords.*.attendanceId')
    .notEmpty()
    .withMessage('Each record must have an attendanceId'),
  body('attendanceRecords.*.employeeId')
    .notEmpty()
    .withMessage('Each record must have an employeeId'),
  body('attendanceRecords.*.date_time_in')
    .notEmpty()
    .withMessage('Each record must have a date_time_in'),
  body('attendanceRecords.*.status')
    .notEmpty()
    .isIn(['Present', 'Unscheduled Absence', 'PTO', 'Sick Leave'])
    .withMessage('Each record must have a valid status'),
];



