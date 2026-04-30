const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    recruitmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruitment',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: String,
    userEmail: String,
    userMobile: String,
    branch: String,
    year: String,
    status: {
        type: String,
        enum: ['Applied', 'Interested', 'Exam Attempted', 'Shortlisted', 'Rejected', 'Selected'],
        default: 'Applied'
    },
    examResponses: [{
        questionIndex: Number,
        answer: String,
        isCorrect: Boolean,
        marksObtained: Number
    }],
    totalMarks: {
        type: Number,
        default: 0
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    lastRoundDetails: String,
    selectionDetails: {
        venue: String,
        date: Date,
        time: String,
        offlineNote: String,
        assignedPosition: String
    }
});

module.exports = mongoose.model('RecruitmentApplication', applicationSchema);
