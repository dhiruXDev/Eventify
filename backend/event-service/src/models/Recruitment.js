const mongoose = require('mongoose');

const recruitmentSchema = new mongoose.Schema({
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: [true, 'Club ID is required']
    },
    clubName: {
        type: String,
        required: [true, 'Club Name is required']
    },
    title: {
        type: String,
        required: [true, 'Recruitment title is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['Organizer', 'Member', 'Volunteer'],
        required: [true, 'Role is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    mode: {
        type: String,
        enum: ['Online', 'Offline'],
        required: [true, 'Mode is required']
    },
    deadline: {
        type: Date,
        required: [true, 'Registration deadline is required']
    },
    date: {
        type: Date,
        required: [true, 'Recruitment date is required']
    },
    time: {
        type: String,
        required: [true, 'Recruitment time is required']
    },
    venue: {
        type: String,
        required: function () { return this.mode === 'Offline'; }
    },
    status: {
        type: String,
        enum: ['Ongoing', 'Completed'],
        default: 'Ongoing'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recruitment', recruitmentSchema);
