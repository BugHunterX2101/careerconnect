const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    school: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }
});

const experienceSchema = new mongoose.Schema({
    company: { type: String, required: true },
    position: { type: String, required: true },
    level: { type: String },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date }
});

const socialSchema = new mongoose.Schema({
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' }
});

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    education: [educationSchema],
    experience: [experienceSchema],
    skills: [{ type: String }],
    social: {
        type: socialSchema,
        default: () => ({
            linkedin: '',
            github: '',
            portfolio: ''
        })
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
profileSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Profile', profileSchema); 