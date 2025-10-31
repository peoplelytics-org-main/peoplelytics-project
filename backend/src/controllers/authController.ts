import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/shared/User"; // Import your TS model

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
    email: user.profile.email,
  };

  const secret = process.env.JWT_SECRET;
  const options = {
    expiresIn: "7d",
  };

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  return jwt.sign(payload, secret, options);
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log("\n--- NEW LOGIN ATTEMPT ---");
    console.log("Time:", new Date().toLocaleTimeString());
    console.log("Request Body:", req.body);

    // 1. Check if username and password exist
    if (!email || !password) {
      console.log("DEBUG: Failed step 1 (missing username or password)");
      return res
        .status(400)
        .json({ message: "Please provide username and password" });
    }

    // 2. Find the user by username
    const lowercaseEmail = email.toLowerCase();
    console.log("DEBUG: Querying database for user:", lowercaseEmail);

    const user = await User.findOne({ "profile.email": lowercaseEmail }).select(
      "+password"
    );

    // 3. Check if user exists
    if (!user) {
      console.log("DEBUG: Failed step 3 (User not found in database)");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("DEBUG: User was found:", user.profile.email);
    console.log(
      "DEBUG: Hashed password from DB:",
      user.password.substring(0, 10) + "..."
    ); // Show first 10 chars

    // 3. ...and password is correct
    console.log("DEBUG: Comparing provided password with hashed password...");
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("DEBUG: Password match result:", isMatch);

    if (!isMatch) {
      console.log("DEBUG: Failed step 3 (Password comparison FAILED)");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // 4. Check if user account is active
    if (!user.isActive) {
      console.log("DEBUG: Failed step 4 (User is not active)");
      return res.status(403).json({ message: "Your account is deactivated." });
    }

    // 5. User is valid!
    console.log("DEBUG: SUCCESS! User is valid. Generating token...");
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);

    // ✅ After generating the token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        organizationId: user.organizationId,
        email: user.profile.email,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
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
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: "User not found" });

    // ✅ Wrap the response in a "user" object to match frontend expectations
    res.json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        organizationId: user.organizationId,
        email: user.profile.email,
        preferences: user.preferences,
      }
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};