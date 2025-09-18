import User from "../models/User.js";
import { generateToken, setCookieToken, clearCookieToken } from "../utils/jwt.js";

export const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        // Create new user
        const user = new User({
            email,
            password,
            firstName,
            lastName
        });

        await user.save();

        // Generate token and set cookie
        const token = generateToken({ userId: user._id });
        setCookieToken(res, token);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }
        
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate token and set cookie
        const token = generateToken({ userId: user._id });
        setCookieToken(res, token);

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        clearCookieToken(res);
        res.status(200).json({
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            message: "Logout failed"
        });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        res.status(200).json({
            user: {
                id: req.user._id,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName
            }
        });
    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({
            message: "Failed to get current user"
        });
    }
};