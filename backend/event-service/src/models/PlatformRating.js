const mongoose = require('mongoose');

const platformRatingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  userName: {
    type: String,
    required: [true, 'User name is required']
  },
  userRole: {
    type: String,
    enum: ['participant', 'organizer', 'admin'],
    required: true
  },
  userPhoto: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one rating per user
platformRatingSchema.index({ userId: 1 }, { unique: true });

// Update the updatedAt field on save
platformRatingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PlatformRating = mongoose.model('PlatformRating', platformRatingSchema);

module.exports = PlatformRating;

