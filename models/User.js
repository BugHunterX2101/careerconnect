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
    skills: [{
        type: String,
        trim: true
    }],
    location: {
        type: String,
        trim: true
    },
    experience: {
        type: String,
        enum: ['entry', 'intermediate', 'senior']
    },
    createdAt: {
        type: Date,
        default: Date.now
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

// Create indexes
userSchema.index({ username: 'text', skills: 'text', location: 'text' });

module.exports = mongoose.model('User', userSchema); 