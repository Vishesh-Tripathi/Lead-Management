import { body } from "express-validator";

export const registerValidation = [
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    body("firstName")
        .trim()
        .isLength({ min: 1 })
        .withMessage("First name is required"),
    body("lastName")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Last name is required")
];

export const loginValidation = [
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
];

export const leadValidation = [
    body("first_name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("First name is required"),
    body("last_name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Last name is required"),
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    body("phone")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Phone number is required"),
    body("company")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Company is required"),
    body("city")
        .trim()
        .isLength({ min: 1 })
        .withMessage("City is required"),
    body("state")
        .trim()
        .isLength({ min: 1 })
        .withMessage("State is required"),
    body("source")
        .isIn(["website", "facebook_ads", "google_ads", "referral", "events", "other"])
        .withMessage("Source must be one of: website, facebook_ads, google_ads, referral, events, other"),
    body("status")
        .optional()
        .isIn(["new", "contacted", "qualified", "lost", "won"])
        .withMessage("Status must be one of: new, contacted, qualified, lost, won"),
    body("score")
        .isInt({ min: 0, max: 100 })
        .withMessage("Score must be an integer between 0 and 100"),
    body("lead_value")
        .isFloat({ min: 0 })
        .withMessage("Lead value must be a positive number"),
    body("last_activity_at")
        .optional()
        .isISO8601()
        .withMessage("Last activity date must be a valid date"),
    body("is_qualified")
        .optional()
        .isBoolean()
        .withMessage("is_qualified must be a boolean")
];