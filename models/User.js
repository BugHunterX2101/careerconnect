const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['jobseeker', 'employer'],
        default: 'jobseeker'
    },
    position: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    experience: {
        type: String,
        enum: ['entry', 'intermediate', 'senior']
    },
    location: {
        type: String,
        trim: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    primaryField: {
        type: String,
        enum: ['technology', 'business', 'healthcare', 'education', 'engineering', 'other']
    },
    preferences: {
        jobAlerts: {
            type: Boolean,
            default: false
        },
        newsletter: {
            type: Boolean,
            default: false
        }
    },
    profile: {
        education: [{
            institution: String,
            degree: String,
            field: String,
            year: Number
        }],
        workHistory: [{
            company: String,
            position: String,
            duration: String,
            description: String
        }],
        bio: String,
        profilePicture: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Update lastActive timestamp
userSchema.methods.updateLastActive = function() {
    this.lastActive = new Date();
    return this.save();
};

// Create indexes for searching
userSchema.index({ 
    username: 'text', 
    skills: 'text', 
    location: 'text',
    position: 'text',
    company: 'text'
});

module.exports = mongoose.model('User', userSchema); 