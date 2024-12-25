const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Admin middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Admin only.'
            });
        }

        // Add user info to request for later use
        req.adminUser = user;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all users
router.get('/users', auth, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            status: 'success',
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching users',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get user by ID
router.get('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }
        res.json({
            status: 'success',
            data: user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update user
router.put('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        // Prevent updating password through this route
        const { password, ...updateData } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating user',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Delete user
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.adminUser._id.toString()) {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot delete your own admin account'
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting user',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 