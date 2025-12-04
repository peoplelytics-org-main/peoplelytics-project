import { body, query, param } from 'express-validator';

export const validateCreateLeave = [
  body('leaveId').notEmpty().isString().trim(),
  body('employeeId').notEmpty().isString().trim(),
  body('employeeName').notEmpty().isString().trim(),
  body('leaveType').notEmpty().isIn(['Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Unpaid', 'Other']),
  body('startDate').notEmpty().isISO8601(),
  body('endDate').notEmpty().isISO8601(),
  body('days').notEmpty().isNumeric().isFloat({ min: 0.5 }),
  body('status').optional().isIn(['Pending', 'Approved', 'Rejected', 'Cancelled']),
  body('reason').optional().isString().trim(),
];

export const validateUpdateLeave = [
  param('leaveId').notEmpty(),
  body('employeeId').optional().isString().trim(),
  body('employeeName').optional().isString().trim(),
  body('leaveType').optional().isIn(['Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Unpaid', 'Other']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('days').optional().isNumeric().isFloat({ min: 0.5 }),
  body('status').optional().isIn(['Pending', 'Approved', 'Rejected', 'Cancelled']),
  body('reason').optional().isString().trim(),
  body('approvedBy').optional().isString().trim(),
  body('approvedAt').optional().isISO8601(),
  body('rejectedReason').optional().isString().trim(),
];

export const validateGetLeaves = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('employeeId').optional().isString(),
  query('leaveType').optional().isString(),
  query('status').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('search').optional().isString().trim(),
];

export const validateGetLeave = [param('leaveId').notEmpty()];
export const validateDeleteLeave = [param('leaveId').notEmpty()];



