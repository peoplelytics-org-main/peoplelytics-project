import { Request, Response } from "express";
import { getOrgModels } from "../../docs/database/organization";
import { Organization } from "../models/shared/Organization";
import bcrypt from "bcryptjs";
import { logger } from "../utils/helpers/logger";
import { getOrgConnection } from "../../docs/database/orgConnection";

/**
 * Add a new user inside the specific organization's Users collection
 */
export const addUserToOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgId } = req.params;
    const { username, password, role } = req.body;

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

    const orgIdentifier = organization.orgId;

    // Step 2: Get that org’s DB models
    const { User } = await getOrgModels(orgIdentifier);

    // Step 3: Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Username already exists in this organization",
      });
      return;
    }

    // Step 4: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 5: Create and save user
    const newUser = new User({
      username,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    logger.info(`👤 User "${username}" added to organization "${orgIdentifier}"`);

    res.status(201).json({
      success: true,
      message: "User added successfully",
      data: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
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
  
      const { User } = await getOrgModels(organization.orgId);
      const users = await User.find().select("-password"); // Hide password hash
  
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
  
      const { User } = await getOrgModels(organization.orgId);
      const user = await User.findById(userId).select("-password");
  
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
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
      const { username, password, role } = req.body;
  
      const organization = await Organization.findOne({ orgId });
      if (!organization) {
        res.status(404).json({ success: false, message: "Organization not found" });
        return;
      }
  
      const { User } = await getOrgModels(organization.orgId);
      const user = await User.findById(userId);
  
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
  
      if (username) user.username = username;
      if (role) user.role = role;
      if (password) user.password = await bcrypt.hash(password, 10);
  
      await user.save();
  
      logger.info(`✏️ Updated user "${user.username}" in organization "${organization.orgId}"`);
  
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
  
      const { User } = await getOrgModels(organization.orgId);
      const deletedUser = await User.findByIdAndDelete(userId);
  
      if (!deletedUser) {
        res.status(404).json({ success: false, message: "User not found" });
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


