import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Import routes
import authRoutes from "./src/routes/auth.js";
import leadRoutes from "./src/routes/leads.js";

const app = express();

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://lead-management-zeta.vercel.app',
    'http://localhost:5173', // Local development
    'http://localhost:3000'  // Alternative local port
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // Check if the origin is in the allowed list
        if (allowedOrigins.some(allowedOrigin => allowedOrigin === origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200 // For legacy browser support
}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/leadmanagement";

// MongoDB connection
mongoose.connect(MONGO_URL).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

// Routes
app.get("/", (req, res) => {
    res.json({ 
        message: "Lead Management API is running",
        cors: "enabled",
        allowedOrigins: [
            process.env.FRONTEND_URL,
            'https://lead-management-zeta.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000'
        ]
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
