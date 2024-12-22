const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    requiredSkills: [{
        type: String,
        required: true,
        trim: true
    }],
    location: {
        type: String,
        required: true,
        trim: true
    },
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    experience: {
        type: String,
        enum: ['entry', 'intermediate', 'senior'],
        required: true
    },
    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship'],
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'draft'],
        default: 'open'
    },
    applications: [{
        applicantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'accepted', 'rejected'],
            default: 'pending'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        coverLetter: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

// Update the updatedAt timestamp before saving
jobSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Create indexes for searching
jobSchema.index({ 
    title: 'text', 
    description: 'text', 
    requiredSkills: 'text', 
    location: 'text',
    company: 'text'
});

// Create compound indexes for filtering
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ employerId: 1, status: 1 });
jobSchema.index({ location: 1, salary: 1 });

module.exports = mongoose.model('Job', jobSchema); 