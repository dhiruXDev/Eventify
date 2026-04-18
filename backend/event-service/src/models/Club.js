const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Club name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Club description is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Club type is required'],
    enum: ['Technical', 'Social Service', 'Sports', 'Cultural', 'Academic', 'Entrepreneurship', 'Arts', 'Other'],
    default: 'Other'
  },
  tags: {
    type: [String],
    default: []
  },
  logo: {
    type: String,
    default: ''
  },
  about: {
    type: String,
    default: ''
  },
  officeLocation: {
    type: String,
    default: ''
  },
  officeOpeningTime: {
    type: String,
    default: '09:00'
  },
  officeClosingTime: {
    type: String,
    default: '17:00'
  },
  organizers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    designation: {
      type: String,
      enum: ['Chairman', 'Co-ordination', 'OverallCoordination', 'Secretary', 'Treasurer', 'Member', 'Other'],
      default: 'Member'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  eventImages: [{
    type: String
  }],
  gallery: [{
    image: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  memberLimit: {
    type: Number,
    enum: [10, 15, 20],
    default: 10
  },
  members: [{
    firstName: String,
    lastName: String,
    photo: String,
    graduationYear: Number,
    branch: String,
    mobileNo: String,
    email: String,
    designation: {
      type: String,
      enum: ['Coordinator', 'Co-coordinator', 'Member'],
      default: 'Member'
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
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

// Update the updatedAt field on save
clubSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
clubSchema.index({ name: 1 });
clubSchema.index({ type: 1 });
clubSchema.index({ isPublished: 1 });
clubSchema.index({ 'organizers.userId': 1 });

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;

