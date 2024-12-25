const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide username, email and password'
            });
        }

        // Create user
        const user = new User({
            username,
            email,
            password
        });

        // Save user
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success with token
        return res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'Username or email already exists'
            });
        }

        return res.status(500).json({
            status: 'error',
            message: 'Registration failed'
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);

        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            console.log('Missing credentials');
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({
                status: 'error',
                message: 'Please provide email and password'
            });
        }

        // Find user with password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('User not found:', email);
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for:', email);
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        const responseData = {
            status: 'success',
            message: 'Login successful',
            data: {
                userId: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role,
                token: token
            }
        };

        console.log('Login successful:', { email, role: user.role });

        // Set headers and send response
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(responseData);
    } catch (error) {
        console.error('Login error:', error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred during login',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 