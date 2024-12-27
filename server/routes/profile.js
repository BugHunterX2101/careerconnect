const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Get user profile
router.get('/', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            // Create a new profile if it doesn't exist
            profile = new Profile({
                userId: req.user.id,
                education: [],
                experience: [],
                skills: [],
                social: {
                    linkedin: '',
                    github: ''
                }
            });
            await profile.save();
        }
        
        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add education
router.post('/education', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const { school, degree, field, startDate, endDate } = req.body;
        
        profile.education.unshift({
            school,
            degree,
            field,
            startDate,
            endDate
        });

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error adding education:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add experience
router.post('/experience', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const { company, position, level, description, startDate, endDate } = req.body;
        
        profile.experience.unshift({
            company,
            position,
            level,
            description,
            startDate,
            endDate
        });

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error adding experience:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add skill
router.post('/skills', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const { skill } = req.body;
        
        if (profile.skills.includes(skill)) {
            return res.status(400).json({ message: 'Skill already exists' });
        }

        profile.skills.push(skill);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove skill
router.delete('/skills/:skill', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const skill = decodeURIComponent(req.params.skill);
        profile.skills = profile.skills.filter(s => s !== skill);
        
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error removing skill:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update social links
router.put('/social', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        profile.social = { ...profile.social, ...req.body };
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error updating social links:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update entire profile
router.put('/', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        profile = await Profile.findOneAndUpdate(
            { userId: req.user.id },
            { $set: req.body },
            { new: true }
        );

        res.json(profile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 