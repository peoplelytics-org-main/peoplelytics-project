import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/shared/User"; // Import your TS model

import { DatabaseService } from "../services/tenant/databaseService";

const dbService = DatabaseService.getInstance();
/**
 * Generates a JWT for a given user.
 */
const generateToken = (user: IUser) => {
  // Create the payload for the token
  // This is the data that will be securely stored inside the JWT
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
    organizationId: user.organizationId, // CRITICAL for your multi-tenant logic
    permissions: user.permissions,
   
  };

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */


export const loginUser = async (req: Request, res: Response) => {
  try {
    // Added organizationId to inputs (Required for Tenant Users)
    const { username, password, organizationId } = req.body;

    console.log("\n--- NEW LOGIN ATTEMPT ---");

    if (!username || !password) {
      return res.status(400).json({ message: "Please provide username and password" });
    }

    const lowercaseInput = username.toLowerCase();
    
    // Build flexible query to match username or email (exact or partial)
    // This handles cases like: user enters "khan" but username is "khan@farooq.com"
    const buildUserQuery = (input: string) => {
      // Escape special regex characters
      const escapedInput = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      return {
        $or: [
          { username: input }, // Exact username match
          { "profile.email": input }, // Exact email match
          { username: { $regex: `^${escapedInput}@`, $options: 'i' } }, // Username starts with input@ (e.g., "khan" matches "khan@farooq.com")
          { "profile.email": { $regex: `^${escapedInput}@`, $options: 'i' } }, // Email starts with input@
          { username: { $regex: `^${escapedInput}$`, $options: 'i' } }, // Exact match (case-insensitive)
        ]
      };
    };
    
    // =========================================================
    // STEP 1: ATTEMPT MASTER DB LOGIN (Super Admin)
    // =========================================================
    // We explicitly check the Master DB first
    let user: any = await User.findOne(buildUserQuery(lowercaseInput)).select("+password");

    let isTenantUser = false;
    let activeOrgId = null;

    // =========================================================
    // STEP 2: IF NOT MASTER, ATTEMPT TENANT DB LOGIN
    // =========================================================
    if (!user) {
      if (!organizationId) {
        // If not in Master, and no Org ID provided, we cannot proceed
        return res.status(401).json({ message: "Invalid credentials or missing Organization ID." });
      }

      console.log(`DEBUG: User not in Master. Checking Tenant DB: ${organizationId}`);

      try {
        // Normalize organization ID (handle both "org_xxx" and "xxx" formats)
        // DatabaseService normalizes by removing "org_" prefix, but we need to pass the full orgId
        // The service will handle normalization internally
        const normalizedOrgId = organizationId.startsWith('org_') ? organizationId : `org_${organizationId}`;
        console.log(`DEBUG: Normalized Org ID: ${normalizedOrgId}`);
        
        // Get the User Model specifically connected to this Organization's DB
        // This uses the helper method we added to DatabaseService
        const TenantUser = dbService.getTenantUserModel(normalizedOrgId);
        
        console.log(`DEBUG: Searching for user with query:`, JSON.stringify(buildUserQuery(lowercaseInput), null, 2));
        user = await TenantUser.findOne(buildUserQuery(lowercaseInput)).select("+password");

        if (user) {
            console.log(`DEBUG: User found in tenant DB: ${user.username}`);
            isTenantUser = true;
            activeOrgId = normalizedOrgId;
        } else {
            console.log(`DEBUG: User not found in tenant DB with query`);
        }

      } catch (err) {
        console.error("Error connecting to tenant DB:", err);
        return res.status(500).json({ message: "Error accessing organization database." });
      }
    }

    // =========================================================
    // STEP 3: VALIDATE PASSWORD
    // =========================================================
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account is deactivated." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // =========================================================
    // STEP 4: GENERATE TOKEN
    // =========================================================
    
    // Update lastLogin (Save back to the correct DB)
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Payload: The 'organizationId' claim is crucial for the middleware later
    const payload = {
      id: user._id,
      username: user.username,
      role: user.role,
      // If SuperAdmin, orgId is null/MASTER. If Tenant, it's the specific Org ID.
      organizationId: isTenantUser ? activeOrgId : "MASTER", 
      permissions: user.permissions,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        organizationId: payload.organizationId,
        email: user.profile?.email,
        isSuperAdmin: !isTenantUser
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

/**
 * @desc    Log user out (clears the cookie)
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutUser = (req: Request, res: Response) => {
  try {
    // To log out, we send a new cookie with the same name,
    // but with an empty string and a past expiry date.
    res.cookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  // req.user is already populated by the 'protect' middleware
  // regardless of which database they came from.
  
  if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
  }

  return res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
      organizationId: req.user.organizationId,
      email: req.user.profile?.email,
      preferences: req.user.preferences,
    }
  });
};