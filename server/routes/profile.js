const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Get user profile
router.get('/', auth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const profile = await Profile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create or update profile
router.post('/', auth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        let profile = await Profile.findOne({ userId: req.user.id });
        if (profile) {
            // Update existing profile
            profile = await Profile.findOneAndUpdate(
                { userId: req.user.id },
                { $set: req.body },
                { new: true }
            );
        } else {
            // Create new profile
            profile = new Profile({
                userId: req.user.id,
                ...req.body
            });
            await profile.save();
        }
        res.json(profile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add education
router.post('/education', auth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const profile = await Profile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        profile.education.unshift(req.body);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error adding education:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete education
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const profile = await Profile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        profile.education = profile.education.filter(
            edu => edu._id.toString() !== req.params.edu_id
        );
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error deleting education:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add experience
router.post('/experience', auth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const profile = await Profile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        profile.experience.unshift(req.body);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error adding experience:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete experience
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const profile = await Profile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        profile.experience = profile.experience.filter(
            exp => exp._id.toString() !== req.params.exp_id
        );
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error deleting experience:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update skills
router.put('/skills', auth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const profile = await Profile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        profile.skills = req.body.skills;
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error updating skills:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update social links
router.put('/social', auth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const profile = await Profile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        profile.social = req.body;
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error updating social links:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 