const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Admin middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        console.log('Admin middleware - checking auth:', req.user);
        
        if (!req.user || !req.user.userId) {
            console.log('No user ID found in request');
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        const user = await User.findById(req.user.userId);
        console.log('Found user:', user ? 'User exists' : 'User not found');
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            console.log('User is not admin, role:', user.role);
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Admin only.'
            });
        }

        console.log('Admin access granted for user:', user.email);
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
        console.log('Fetching all users...');
        const users = await User.find().select('-password');
        console.log('Found users:', users.length);
        
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
        console.log('Fetching user by ID:', req.params.id);
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            console.log('User not found with ID:', req.params.id);
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        console.log('Found user:', user.email);
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
        console.log('Updating user:', req.params.id);
        console.log('Update data:', req.body);

        // Prevent updating password through this route
        const { password, ...updateData } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            console.log('User not found for update:', req.params.id);
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        console.log('User updated successfully:', user.email);
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
        console.log('Deleting user:', req.params.id);
        
        // Prevent admin from deleting themselves
        if (req.params.id === req.adminUser._id.toString()) {
            console.log('Admin attempted to delete their own account');
            return res.status(400).json({
                status: 'error',
                message: 'Cannot delete your own admin account'
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            console.log('User not found for deletion:', req.params.id);
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        console.log('User deleted successfully:', user.email);
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