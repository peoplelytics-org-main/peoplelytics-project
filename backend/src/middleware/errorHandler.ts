import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/helpers/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string | undefined;
  errors?: any[] | undefined;
}

/**
 * Centralized error handling middleware
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';
  let errors = err.errors;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_ERROR';
    message = 'Duplicate entry found';
    const field = Object.keys((err as any).keyPattern)[0];
    errors = [{ field, message: `${field} already exists` }];
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Async handler wrapper to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create custom API error class
 */
export class CustomApiError extends Error {
  statusCode: number;
  code: string;
  errors?: any[] | undefined;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    errors?: any[] | undefined
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

