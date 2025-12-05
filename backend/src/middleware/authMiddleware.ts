import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/shared/User";
import { DatabaseService } from "../services/tenant/databaseService";

const dbService = DatabaseService.getInstance();

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // SCENARIO 1: SUPER ADMIN (Master DB)
    if (!decoded.organizationId || decoded.organizationId === "MASTER") {
       req.user = await User.findById(decoded.id).select("-password");
    } 
    // SCENARIO 2: TENANT USER (Tenant DB)
    else {
        // Dynamically get the model for this specific organization
        const TenantUser = dbService.getTenantUserModel(decoded.organizationId);
        req.user = await TenantUser.findById(decoded.id).select("-password");
        
        // Optional: Attach orgId to request for use in controllers
        // req.organizationId = decoded.organizationId; 
    }

    if (!req.user) {
         return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};