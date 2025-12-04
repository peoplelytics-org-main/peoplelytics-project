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
 * Attaches the decoded user payload to req.user.
 */
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // Check for the "Bearer" token in the Authorization header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // 1. Get token from header. 
      // We declare it here. TypeScript knows it's a string.
      const token = authHeader.split(' ')[1];

      // 2. Verify the token using your secret
      // No more error, as 'token' is guaranteed to be a string in this block
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;

      // 3. Find the user by ID from the token
      const freshUser = await User.findById(decoded.id);

      if (!freshUser || !freshUser.isActive) {
        return res.status(401).json({ message: 'User not found or deactivated' });
      }

      // 4. Attach the user payload to the request object
      req.user = decoded; 

      next(); // All good, proceed

    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // This replaces the 'if (!token)' check at the end
    return res.status(401).json({ message: 'Not authorized, no token provided' });
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
    next();
  };
};