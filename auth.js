const express = require('express');
const router = express.Router();
const User = require('./models/User');

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

        // Return success
        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                userId: user._id,
                username: user.username,
                email: user.email
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

        res.status(500).json({
            status: 'error',
            message: 'Registration failed'
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Return success
        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                userId: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Login failed'
        });
    }
});

module.exports = router; 