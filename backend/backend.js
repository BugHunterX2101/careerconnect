require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/database');

// Import models
const User = require('../models/User');
const Job = require('../models/Job');
const Quiz = require('../models/Quiz');

const app = express();

// Enhanced CORS configuration for Vercel
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Basic test route
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({ 
        message: 'Server is running',
        database: dbStatus,
        environment: process.env.VERCEL_ENV || 'development'
    });
});

// API routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User already exists with this email or username' 
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            role: role || 'jobseeker'
        });

        await user.save();

        res.status(201).json({ 
            message: 'User registered successfully',
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Registration failed', 
            error: error.message 
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ 
            message: 'Login successful',
            username: user.username,
            role: user.role,
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Login failed', 
            error: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: err.message 
    });
});

// Vercel serverless function export
module.exports = app;

// Start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
