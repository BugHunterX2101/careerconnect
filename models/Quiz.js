const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: [{
        type: String,
        required: true,
        trim: true
    }],
    correctAnswer: {
        type: Number,
        required: true,
        min: 0
    },
    explanation: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    skillType: {
        type: String,
        required: true,
        trim: true
    },
    points: {
        type: Number,
        default: 10
    },
    timeLimit: {
        type: Number,
        default: 60, // seconds
        min: 10
    },
    attempts: {
        type: Number,
        default: 0
    },
    successRate: {
        type: Number,
        default: 0
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

// Update timestamps before saving
quizSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Create indexes
quizSchema.index({ category: 1, difficulty: 1 });
quizSchema.index({ skillType: 1 });

// Method to update success rate
quizSchema.methods.updateSuccessRate = function(isCorrect) {
    this.attempts += 1;
    const currentSuccesses = this.successRate * (this.attempts - 1);
    this.successRate = (currentSuccesses + (isCorrect ? 1 : 0)) / this.attempts;
    return this.save();
};

module.exports = mongoose.model('Quiz', quizSchema); 