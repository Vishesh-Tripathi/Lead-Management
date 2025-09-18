import express from "express";
import { register, login, logout, getCurrentUser } from "../controllers/authController.js";
import { registerValidation, loginValidation } from "../utils/validation.js";
import { handleValidation } from "../middleware/validation.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerValidation, handleValidation, register);
router.post("/login", loginValidation, handleValidation, login);
router.post("/logout", logout);

// Protected routes
router.get("/me", authenticate, getCurrentUser);

export default router;