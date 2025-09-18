import { validationResult } from "express-validator";

export const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg
        }));
        
        return res.status(400).json({
            message: "Validation failed",
            errors: errorMessages
        });
    }
    
    next();
};