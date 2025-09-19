import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required. Please login." 
            });
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select("-password");
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token. User not found." 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ 
            success: false,
            message: "Invalid token. Please login again." 
        });
    }
};

// Optional auth middleware - doesn't fail if no token
export const optionalAuthenticate = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select("-password");
        
        req.user = user || null;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};