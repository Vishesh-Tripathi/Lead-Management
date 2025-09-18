import express from "express";
import {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    deleteLead,
    bulkCreateLeads
} from "../controllers/leadController.js";
import { leadValidation } from "../utils/validation.js";
import { handleValidation } from "../middleware/validation.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All lead routes require authentication
router.use(authenticate);

// CRUD routes for leads
router.post("/", leadValidation, handleValidation, createLead);
router.post("/bulk", bulkCreateLeads); // No validation middleware for bulk - handled internally
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.put("/:id", leadValidation, handleValidation, updateLead);
router.delete("/:id", deleteLead);

export default router;