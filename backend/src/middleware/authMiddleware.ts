import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv"

dotenv.config();
import { User } from '../models/shared/User'; // Import your TS model

// Extend the Express Request type to include our 'user' payload
export interface AuthenticatedRequest extends Request {
  user?: jwt.JwtPayload | {
    id: string;
    username: string;
    role: string;
    organizationId: string;
  };
}

/**
 * Protects routes by verifying the JWT.
 * Supports both Bearer token (Authorization header) and HTTP-only cookies.
 * Attaches the decoded user payload to req.user.
 */
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Method 1: Check for Bearer token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  // Method 2: Check for token in HTTP-only cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    // Verify the token using your secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;

    // Find the user by ID from the token
    const freshUser = await User.findById(decoded.id);

    if (!freshUser || !freshUser.isActive) {
      return res.status(401).json({ message: 'User not found or deactivated' });
    }

    // Attach the user payload to the request object
    req.user = decoded;

    return next(); // All good, proceed

  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

/**
 * Middleware to restrict routes to specific roles.
 * Example: router.get('/admin', protect, restrictTo('Super Admin', 'Org Admin'), ...);
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes((req.user as any).role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    return next();
  };
};