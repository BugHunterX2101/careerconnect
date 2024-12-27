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
                socialLinks: {
                    linkedin: '',
                    github: '',
                    portfolio: ''
                }
            });
            await profile.save();
        }
        
        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
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
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null
        });

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error adding education:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add experience
router.post('/experience', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const { company, position, description, startDate, endDate } = req.body;
        
        profile.experience.unshift({
            company,
            position,
            description,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null
        });

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error adding experience:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
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