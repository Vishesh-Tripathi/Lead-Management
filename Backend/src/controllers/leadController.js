import Lead from "../models/Lead.js";
import mongoose from "mongoose";

// Create a new lead
export const createLead = async (req, res) => {
    try {
        const leadData = {
            ...req.body,
            created_by: req.user._id
        };

        const lead = new Lead(leadData);
        await lead.save();

        res.status(201).json({
            message: "Lead created successfully",
            lead
        });
    } catch (error) {
        console.error("Create lead error:", error);
        
        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({
                message: "A lead with this email already exists"
            });
        }
        
        res.status(500).json({
            message: "Failed to create lead",
            error: error.message
        });
    }
};

// Get all leads with pagination and filtering
export const getLeads = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = { created_by: req.user._id };
        
        // Apply filters from query parameters
        if (req.query.status) {
            filter.status = req.query.status;
        }
        
        if (req.query.source) {
            filter.source = req.query.source;
        }
        
        if (req.query.company) {
            filter.company = { $regex: req.query.company, $options: 'i' };
        }
        
        if (req.query.city) {
            filter.city = { $regex: req.query.city, $options: 'i' };
        }
        
        if (req.query.email) {
            filter.email = { $regex: req.query.email, $options: 'i' };
        }
        
        if (req.query.is_qualified !== undefined) {
            filter.is_qualified = req.query.is_qualified === 'true';
        }
        
        // Score filtering
        if (req.query.score_min || req.query.score_max) {
            filter.score = {};
            if (req.query.score_min) filter.score.$gte = parseInt(req.query.score_min);
            if (req.query.score_max) filter.score.$lte = parseInt(req.query.score_max);
        }
        
        // Lead value filtering
        if (req.query.lead_value_min || req.query.lead_value_max) {
            filter.lead_value = {};
            if (req.query.lead_value_min) filter.lead_value.$gte = parseFloat(req.query.lead_value_min);
            if (req.query.lead_value_max) filter.lead_value.$lte = parseFloat(req.query.lead_value_max);
        }
        
        // Date filtering for created_at
        if (req.query.created_after || req.query.created_before) {
            filter.created_at = {};
            if (req.query.created_after) filter.created_at.$gte = new Date(req.query.created_after);
            if (req.query.created_before) filter.created_at.$lte = new Date(req.query.created_before);
        }

        // Build sort object
        let sort = { created_at: -1 }; // Default sort by newest first
        if (req.query.sort_by) {
            const sortDirection = req.query.sort_order === 'asc' ? 1 : -1;
            sort = { [req.query.sort_by]: sortDirection };
        }

        // Execute query
        const [leads, total] = await Promise.all([
            Lead.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Lead.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            data: leads,
            page,
            limit,
            total,
            totalPages
        });
    } catch (error) {
        console.error("Get leads error:", error);
        res.status(500).json({
            message: "Failed to fetch leads",
            error: error.message
        });
    }
};

// Get a single lead by ID
export const getLeadById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid lead ID"
            });
        }

        const lead = await Lead.findOne({
            _id: id,
            created_by: req.user._id
        });

        if (!lead) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.status(200).json({ lead });
    } catch (error) {
        console.error("Get lead by ID error:", error);
        res.status(500).json({
            message: "Failed to fetch lead",
            error: error.message
        });
    }
};

// Update a lead
export const updateLead = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid lead ID"
            });
        }

        const lead = await Lead.findOneAndUpdate(
            { _id: id, created_by: req.user._id },
            { ...req.body, updated_at: new Date() },
            { new: true, runValidators: true }
        );

        if (!lead) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.status(200).json({
            message: "Lead updated successfully",
            lead
        });
    } catch (error) {
        console.error("Update lead error:", error);
        
        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({
                message: "A lead with this email already exists"
            });
        }
        
        res.status(500).json({
            message: "Failed to update lead",
            error: error.message
        });
    }
};

// Bulk create leads
export const bulkCreateLeads = async (req, res) => {
    try {
        const { leads } = req.body;

        if (!Array.isArray(leads) || leads.length === 0) {
            return res.status(400).json({
                message: "Please provide an array of leads"
            });
        }

        // Limit bulk operations to prevent server overload
        if (leads.length > 1000) {
            return res.status(400).json({
                message: "Maximum 1000 leads can be created at once"
            });
        }

        // Add created_by to each lead and validate required fields
        const processedLeads = leads.map((lead, index) => {
            // Basic validation for required fields
            if (!lead.first_name || !lead.email) {
                throw new Error(`Lead at index ${index}: first_name and email are required`);
            }

            return {
                ...lead,
                created_by: req.user._id,
                // Set defaults for missing fields
                last_name: lead.last_name || '',
                status: lead.status || 'new',
                source: lead.source || 'other',
                score: lead.score || 0,
                lead_value: lead.lead_value || 0,
                is_qualified: lead.is_qualified || false,
                last_activity_at: lead.last_activity_at || null
            };
        });

        // Use insertMany with ordered: false to continue on errors
        const result = await Lead.insertMany(processedLeads, { 
            ordered: false,
            rawResult: true 
        });

        const successCount = result.insertedCount;
        const failedCount = leads.length - successCount;
        
        // Get duplicate email errors
        const duplicateEmails = [];
        if (result.writeErrors) {
            result.writeErrors.forEach(error => {
                if (error.code === 11000) { // Duplicate key error
                    const emailMatch = error.errmsg.match(/email: "([^"]+)"/);
                    if (emailMatch) {
                        duplicateEmails.push(emailMatch[1]);
                    }
                }
            });
        }

        let message = `Successfully created ${successCount} leads`;
        if (failedCount > 0) {
            message += `, ${failedCount} failed`;
            if (duplicateEmails.length > 0) {
                message += ` (${duplicateEmails.length} duplicate emails)`;
            }
        }

        res.status(201).json({
            message,
            results: {
                total: leads.length,
                successful: successCount,
                failed: failedCount,
                duplicateEmails: duplicateEmails.slice(0, 10), // Show first 10 duplicates
                duplicateCount: duplicateEmails.length
            }
        });
    } catch (error) {
        console.error("Bulk create leads error:", error);
        
        // Handle validation errors
        if (error.message.includes('index')) {
            return res.status(400).json({
                message: error.message
            });
        }
        
        res.status(500).json({
            message: "Failed to bulk create leads",
            error: error.message
        });
    }
};

// Delete a lead
export const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid lead ID"
            });
        }

        const lead = await Lead.findOneAndDelete({
            _id: id,
            created_by: req.user._id
        });

        if (!lead) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.status(200).json({
            message: "Lead deleted successfully"
        });
    } catch (error) {
        console.error("Delete lead error:", error);
        res.status(500).json({
            message: "Failed to delete lead",
            error: error.message
        });
    }
};