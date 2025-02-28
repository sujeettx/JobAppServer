import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
  try {
    const { email, password, role, profile } = req.body;

    // Basic validation
    if (!email || !password || !role || !profile || !['company', 'student'].includes(role)) {
      return res.status(400).json({ 
        message: "Invalid input - check all required fields and role type" 
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create & save user
    const user = await (new User({ email, password, role, profile })).save();
    
    return res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "4d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.find({});
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error getting user", error });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params; // Extract user ID from URL parameters
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findById(id); // Find user by ID
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error getting user", error });
  }
};

/// update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the existing user
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Merge existing profile with new data
    const updatedProfile = {
      ...existingUser.profile,  // Keep all existing profile data
      ...req.body.profile       // Add new profile fields
    };

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { profile: updatedProfile } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Updated profile successfully"
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      message: "Error updating user profile",
      error: error.message 
    });
  }
};

// Register multiple users
export const registerMultipleUsers = async (req, res) => {
  try {
    const users = req.body; // Expecting an array of user objects
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "Invalid input, expected an array of users" });
    }

    const existingEmails = await User.find({ email: { $in: users.map(u => u.email) } });
    if (existingEmails.length > 0) {
      return res.status(400).json({
        message: "Some users already exist",
        existingEmails: existingEmails.map(u => u.email)
      });
    }

    const createdUsers = await User.insertMany(users);
    res.status(201).json({ message: "Users registered successfully", createdUsers });
  } catch (error) {
    res.status(500).json({ message: "Error registering multiple users", error });
  }
};

// get all company users

export const getAllcompany = async (req, res) => {
  try {
    const users = await User.find({role : "company" });
    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: "Error getting users", error });
  }
};