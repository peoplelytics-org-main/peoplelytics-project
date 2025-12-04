import { Request, Response } from "express";
import { Organization } from "../models/shared/Organization";
import { User } from "../models/shared/User";
import bcrypt from "bcryptjs";
import { logger } from "../utils/helpers/logger";

const rolePermissions: Record<string, string[]> = {
  "Super Admin": ["*"], // All permissions
  "Org Admin": ["read", "write", "edit", "delete"], // full access
  "HR Analyst": ["read:limited"], // limited read
  "Executive": ["read"], // full read
};

const defaultPreferences = {
  theme: 'light' as const,
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false
  }
};

/**
 * Add a new user to the master database (users are stored in master_db, not org_db)
 * Users are associated with organizations via organizationId field
 */
export const addUserToOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgId } = req.params;
    const { username, password, role, email, firstName, lastName } = req.body;

    // Validate input
    if (!username || !password || !role) {
      res.status(400).json({
        success: false,
        message: "Username, password, and role are required",
      });
      return;
    }

    // Step 1: Check organization exists in master DB
    const organization = await Organization.findOne({ orgId });
    if (!organization) {
      res.status(404).json({
        success: false,
        message: "Organization not found",
      });
      return;
    }

    // Step 2: Check if username already exists in master DB
    const existingUser = await User.findOne({ 
      $or: [
        { username: username.toLowerCase() },
        { "profile.email": email?.toLowerCase() || username.toLowerCase() }
      ]
    });
    
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
      return;
    }

    // Step 3: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 4: Extract firstName and lastName from username/email if not provided
    let finalFirstName = firstName;
    let finalLastName = lastName;
    let finalEmail = email || username.toLowerCase();

    // If firstName not provided, try to extract from username/email
    if (!finalFirstName) {
      const emailParts = username.split('@');
      const nameParts = emailParts[0].split(/[._-]/);
      finalFirstName = nameParts[0] || 'User';
      // If there are more parts, use the last one as lastName
      if (nameParts.length > 1 && !finalLastName) {
        finalLastName = nameParts[nameParts.length - 1];
      }
    }

    // Ensure lastName is not empty (required by schema)
    if (!finalLastName || finalLastName.trim() === '') {
      finalLastName = 'User'; // Default value
    }

    // Step 5: Create user in master database
    const newUser = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      role: role as 'Super Admin' | 'Org Admin' | 'HR Analyst' | 'Executive',
      organizationId: organization.orgId,
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

    logger.info(`👤 User "${username}" added to organization "${organization.name}" (${organization.orgId})`);

    res.status(201).json({
      success: true,
      message: "User added successfully",
      data: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        organizationId: newUser.organizationId,
        organizationName: newUser.organizationName,
        email: newUser.profile.email,
        permissions: newUser.permissions,
      },
    });
  } catch (error) {
    logger.error("Error adding user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllUsersFromOrganization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orgId } = req.params;
  
      const organization = await Organization.findOne({ orgId });
      if (!organization) {
        res.status(404).json({ success: false, message: "Organization not found" });
        return;
      }
  
      // Get users from master database filtered by organizationId
      const users = await User.find({ organizationId: organization.orgId })
        .select("-password"); // Hide password hash
  
      res.json({ success: true, data: users });
    } catch (error) {
      logger.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orgId, userId } = req.params;
  
      const organization = await Organization.findOne({ orgId });
      if (!organization) {
        res.status(404).json({ success: false, message: "Organization not found" });
        return;
      }
  
      // Get user from master database, verify it belongs to the organization
      const user = await User.findOne({ 
        _id: userId,
        organizationId: organization.orgId 
      }).select("-password");
  
      if (!user) {
        res.status(404).json({ success: false, message: "User not found in this organization" });
        return;
      }
  
      res.json({ success: true, data: user });
    } catch (error) {
      logger.error("Error fetching user by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  export const updateUserInOrganization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orgId, userId } = req.params;
      const { username, password, role, email, firstName, lastName, isActive } = req.body;
  
      const organization = await Organization.findOne({ orgId });
      if (!organization) {
        res.status(404).json({ success: false, message: "Organization not found" });
        return;
      }
  
      // Get user from master database, verify it belongs to the organization
      const user = await User.findOne({ 
        _id: userId,
        organizationId: organization.orgId 
      });
  
      if (!user) {
        res.status(404).json({ success: false, message: "User not found in this organization" });
        return;
      }
  
      // Update fields
      if (username) user.username = username.toLowerCase();
      if (role) user.role = role as 'Super Admin' | 'Org Admin' | 'HR Analyst' | 'Executive';
      if (password) user.password = await bcrypt.hash(password, 10);
      if (isActive !== undefined) user.isActive = isActive;
      if (email) user.profile.email = email.toLowerCase();
      if (firstName) user.profile.firstName = firstName;
      if (lastName) user.profile.lastName = lastName;
      if (role && rolePermissions[role]) {
        user.permissions = rolePermissions[role];
      }
  
      await user.save();
  
      logger.info(`✏️ Updated user "${user.username}" in organization "${organization.orgId}"`);
  
      res.json({
        success: true,
        message: "User updated successfully",
        data: {
          id: user._id,
          username: user.username,
          role: user.role,
          organizationId: user.organizationId,
          email: user.profile.email,
        },
      });
    } catch (error) {
      logger.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  
  /**
   * 🗑️ Delete a user from organization
   */
  export const deleteUserFromOrganization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orgId, userId } = req.params;
  
      const organization = await Organization.findOne({ orgId });
      if (!organization) {
        res.status(404).json({ success: false, message: "Organization not found" });
        return;
      }
  
      // Get user from master database, verify it belongs to the organization
      const user = await User.findOne({ 
        _id: userId,
        organizationId: organization.orgId 
      });
  
      if (!user) {
        res.status(404).json({ success: false, message: "User not found in this organization" });
        return;
      }
  
      const deletedUser = await User.findByIdAndDelete(userId);
  
      if (!deletedUser) {
        res.status(404).json({ success: false, message: "Failed to delete user" });
        return;
      }
  
      logger.info(`🗑️ Deleted user "${deletedUser.username}" from organization "${organization.orgId}"`);
  
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      logger.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };


