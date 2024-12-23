const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User already exists'
            });
        }

        const user = new User({ username, email, password, role: role || 'jobseeker' });
        await user.save();

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: { userId: user._id }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing credentials'
            });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        res.json({
            status: 'success',
            data: {
                userId: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router; 