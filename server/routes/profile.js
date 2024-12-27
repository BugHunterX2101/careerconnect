const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Get user profile
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching profile for user:', req.user.id);
        
        if (!req.user || !req.user.id) {
            console.error('No user ID in request');
            return res.status(401).json({
                status: 'error',
                message: 'User not authenticated'
            });
        }

        let profile = await Profile.findOne({ userId: req.user.id });
        console.log('Found profile:', profile ? 'Yes' : 'No');
        
        if (!profile) {
            console.log('Creating new profile for user:', req.user.id);
            profile = new Profile({
                userId: req.user.id,
                education: [],
                experience: [],
                skills: [],
                socialLinks: {
                    linkedin: '',
                    github: '',
                    portfolio: ''
                }
            });
            await profile.save();
            console.log('New profile created successfully');
        }
        
        console.log('Sending profile data');
        res.json({
            status: 'success',
            data: profile
        });
    } catch (error) {
        console.error('Error in profile route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Add education
router.post('/education', auth, async (req, res) => {
    try {
        console.log('Adding education for user:', req.user.id);
        console.log('Education data received:', req.body);

        const profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            console.log('Profile not found for user:', req.user.id);
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        const { school, degree, field, startDate, endDate } = req.body;
        
        if (!school || !degree || !field || !startDate) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        profile.education.unshift({
            school,
            degree,
            field,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null
        });

        await profile.save();
        console.log('Education added successfully');
        
        res.json({
            status: 'success',
            data: profile
        });
    } catch (error) {
        console.error('Error adding education:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to add education',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Add experience
router.post('/experience', auth, async (req, res) => {
    try {
        console.log('Adding experience for user:', req.user.id);
        console.log('Experience data received:', req.body);

        const profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            console.log('Profile not found for user:', req.user.id);
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        const { company, position, description, startDate, endDate } = req.body;
        
        if (!company || !position || !startDate) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        profile.experience.unshift({
            company,
            position,
            description: description || '',
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null
        });

        await profile.save();
        console.log('Experience added successfully');
        
        res.json({
            status: 'success',
            data: profile
        });
    } catch (error) {
        console.error('Error adding experience:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to add experience',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Add skill
router.post('/skills', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const { name, level } = req.body;
        
        // Check if skill already exists
        const skillExists = profile.skills.some(skill => 
            skill.name.toLowerCase() === name.toLowerCase()
        );

        if (skillExists) {
            return res.status(400).json({ message: 'Skill already exists' });
        }

        profile.skills.push({ name, level });
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Remove skill
router.delete('/skills/:skillId', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        profile.skills = profile.skills.filter(skill => 
            skill._id.toString() !== req.params.skillId
        );
        
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error removing skill:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update social links
router.put('/social', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        profile.socialLinks = { ...profile.socialLinks, ...req.body };
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error updating social links:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update entire profile
router.put('/', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Ensure dates are properly converted
        if (req.body.education) {
            req.body.education = req.body.education.map(edu => ({
                ...edu,
                startDate: new Date(edu.startDate),
                endDate: edu.endDate ? new Date(edu.endDate) : null
            }));
        }

        if (req.body.experience) {
            req.body.experience = req.body.experience.map(exp => ({
                ...exp,
                startDate: new Date(exp.startDate),
                endDate: exp.endDate ? new Date(exp.endDate) : null
            }));
        }

        profile = await Profile.findOneAndUpdate(
            { userId: req.user.id },
            { $set: req.body },
            { new: true }
        );

        res.json(profile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 