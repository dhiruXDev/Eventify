const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    recruitmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruitment',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    cutoffMarks: {
        type: Number,
        default: 0
    },
    questions: [{
        text: { type: String, required: true },
        type: { type: String, enum: ['MCQ', 'Objective', 'Paragraph'], default: 'MCQ' },
        options: [String],
        correctAnswer: { type: String },
        marks: { type: Number, default: 1 },
        wordLimit: { type: Number, default: 500 }
    }],
    isReleased: {
        type: Boolean,
        default: false
    },
    targetAudience: {
        type: [String], // Array of statuses like ['Applied', 'Shortlisted']
        default: ['Applied'] // By default everyone who applied can see it
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Exam', examSchema);
