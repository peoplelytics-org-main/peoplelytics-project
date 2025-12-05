import { Request, Response } from "express";
import { Organization } from "../models/shared/Organization";
import { DatabaseService } from "../services/tenant/databaseService"; // Import Service
import bcrypt from "bcryptjs";
import { logger } from "../utils/helpers/logger";

const dbService = DatabaseService.getInstance();

const rolePermissions: Record<string, string[]> = {
  "Super Admin": ["*"], 
  "Org Admin": ["read", "write", "edit", "delete"], 
  "HR Analyst": ["read:limited"], 
  "Executive": ["read"], 
};

const defaultPreferences = {
  theme: 'light' as const,
  language: 'en',
  notifications: { email: true, push: true, sms: false }
};

/**
 * ✅ Add a new user SPECIFICALLY to the Organization's Database
 */
export const addUserToOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgId } = req.params;
    const { username, password, role, email, firstName, lastName } = req.body;

    if (!username || !password || !role) {
      res.status(400).json({ success: false, message: "Username, password, and role are required" });
      return;
    }

    // Step 1: Check organization exists in MASTER DB
    // We still check Master DB to ensure the Org is valid/active
    const organization = await Organization.findOne({ orgId });
    if (!organization) {
      res.status(404).json({ success: false, message: "Organization not found" });
      return;
    }

    // Step 2: Switch Context to TENANT DB
    // This is the magic line that connects to 'org_xyz'
    const TenantUser = dbService.getTenantUserModel(organization.orgId);

    // Step 3: Check if username exists inside TENANT DB
    const existingUser = await TenantUser.findOne({ 
      $or: [
        { username: username.toLowerCase() },
        { "profile.email": email?.toLowerCase() || username.toLowerCase() }
      ]
    });
    
    if (existingUser) {
      res.status(409).json({ success: false, message: "Username or email already exists in this organization" });
      return;
    }

    // Step 4: Hash password & Prepare Data
    const hashedPassword = await bcrypt.hash(password, 10);

    let finalFirstName = firstName;
    let finalLastName = lastName;
    let finalEmail = email || username.toLowerCase();

    if (!finalFirstName) {
      const emailParts = username.split('@');
      const nameParts = emailParts[0].split(/[._-]/);
      finalFirstName = nameParts[0] || 'User';
      if (nameParts.length > 1 && !finalLastName) finalLastName = nameParts[nameParts.length - 1];
    }
    if (!finalLastName || finalLastName.trim() === '') finalLastName = 'User';

    // Step 5: Create user in TENANT DB
    const newUser = await TenantUser.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      role: role as any,
      organizationId: organization.orgId, // Kept for reference
      organizationName: organization.name,
      isActive: true,
      profile: {
        firstName: finalFirstName.trim(),
        lastName: finalLastName.trim(),
        email: finalEmail.toLowerCase(),
      },
      permissions: rolePermissions[role] || [],
      preferences: defaultPreferences
    });

    logger.info(`👤 User "${username}" added to Tenant DB "${organization.orgId}"`);

    res.status(201).json({
      success: true,
      message: "User added to organization successfully",
      data: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        organizationId: newUser.organizationId,
        email: newUser.profile.email,
      },
    });
  } catch (error) {
    logger.error("Error adding user:", error);
    res.status(500).json({ success: false, message: "Failed to add user" });
  }
};

/**
 * ✅ Get all users from the Organization's Database
 */
export const getAllUsersFromOrganization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orgId } = req.params;
  
      const organization = await Organization.findOne({ orgId });
      if (!organization) {
        res.status(404).json({ success: false, message: "Organization not found" });
        return;
      }
  
      // Switch to Tenant DB
      const TenantUser = dbService.getTenantUserModel(organization.orgId);

      // Fetch all users in this DB
      const users = await TenantUser.find({}).select("-password");
  
      res.json({ success: true, count: users.length, data: users });
    } catch (error) {
      logger.error("Error fetching users:", error);
      res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
  };

  /**
   * ✅ Get specific user from Tenant DB
   */
  export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orgId, userId } = req.params;
  
      const organization = await Organization.findOne({ orgId });
      if (!organization) {
        res.status(404).json({ success: false, message: "Organization not found" });
        return;
      }
  
      const TenantUser = dbService.getTenantUserModel(organization.orgId);

      const user = await TenantUser.findById(userId).select("-password");
  
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
  
      res.json({ success: true, data: user });
    } catch (error) {
      logger.error("Error fetching user by ID:", error);
      res.status(500).json({ success: false, message: "Failed to fetch user" });
    }
  };

  /**
   * ✅ Update user in Tenant DB
   */
  export const updateUserInOrganization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orgId, userId } = req.params;
      const { username, password, role, email, firstName, lastName, isActive } = req.body;
  
      const organization = await Organization.findOne({ orgId });
      if (!organization) {
        res.status(404).json({ success: false, message: "Organization not found" });
        return;
      }
  
      const TenantUser = dbService.getTenantUserModel(organization.orgId);
      const user = await TenantUser.findById(userId);
  
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
  
      // Update fields
      if (username) user.username = username.toLowerCase();
      if (role) user.role = role;
      if (password) user.password = await bcrypt.hash(password, 10);
      if (isActive !== undefined) user.isActive = isActive;
      if (email) user.profile.email = email.toLowerCase();
      if (firstName) user.profile.firstName = firstName;
      if (lastName) user.profile.lastName = lastName;
      if (role && rolePermissions[role]) {
        user.permissions = rolePermissions[role];
      }
  
      await user.save();
  
      logger.info(`✏️ Updated user "${user.username}" in Tenant DB "${organization.orgId}"`);
  
      res.json({
        success: true,
        message: "User updated successfully",
        data: {
          id: user._id,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error("Error updating user:", error);
      res.status(500).json({ success: false, message: "Failed to update user" });
    }
  };
  
  /**
   * ✅ Delete user from Tenant DB
   */
  export const deleteUserFromOrganization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orgId, userId } = req.params;
  
      const organization = await Organization.findOne({ orgId });
      if (!organization) {
        res.status(404).json({ success: false, message: "Organization not found" });
        return;
      }
  
      const TenantUser = dbService.getTenantUserModel(organization.orgId);
      const deletedUser = await TenantUser.findByIdAndDelete(userId);
  
      if (!deletedUser) {
        res.status(404).json({ success: false, message: "User not found or failed to delete" });
        return;
      }
  
      logger.info(`🗑️ Deleted user "${deletedUser.username}" from Tenant DB "${organization.orgId}"`);
  
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      logger.error("Error deleting user:", error);
      res.status(500).json({ success: false, message: "Failed to delete user" });
    }
  };

  export const getAllUsersFromAllOrganizations = async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Fetch all registered organizations from Master DB
      const organizations = await Organization.find({});
  
      if (!organizations || organizations.length === 0) {
        res.json({ success: true, count: 0, data: [] });
        return;
      }
  
      // 2. Create an array of promises to fetch users from each Tenant DB in parallel
      const userPromises = organizations.map(async (org) => {
        try {
          // Switch context to specific Tenant DB
          const TenantUser = dbService.getTenantUserModel(org.orgId);
          
          // Fetch users (excluding passwords)
          const users = await TenantUser.find({}).select("-password").lean();
          
          // Optional: Attach the orgName to the user object explicitly if not already there
          // (Though your create function already saves organizationName, this ensures it)
          return users.map(user => ({
            ...user,
            _sourceOrgId: org.orgId // distinct flag to know where this user came from
          }));
  
        } catch (err) {
          // If one DB fails (e.g., connection issue), log it but don't break the whole request
          logger.warn(`Failed to fetch users for org: ${org.orgId}`, err);
          return []; 
        }
      });
  
      // 3. Wait for all DB queries to finish
      const results = await Promise.all(userPromises);
  
      // 4. Flatten the array of arrays into a single list
      const allUsers = results.flat();
  
      logger.info(`Fetched ${allUsers.length} users across ${organizations.length} organizations.`);
  
      res.json({ 
        success: true, 
        totalOrganizations: organizations.length,
        totalUsers: allUsers.length, 
        data: allUsers 
      });
  
    } catch (error) {
      logger.error("Error fetching global users:", error);
      res.status(500).json({ success: false, message: "Failed to fetch global users" });
    }
  };