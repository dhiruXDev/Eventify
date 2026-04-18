const Review = require('../models/Review');
const Event = require('../models/Event');

/**
 * @desc    Create or update a review for an event
 * @route   POST /api/events/:eventId/reviews
 * @access  Private (Participants and Organizers)
 */
exports.createReview = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { rating, comment, userName: bodyUserName, userPhoto: bodyUserPhoto } = req.body;

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is registered for the event (for participants) or is organizer/admin
    const isRegistered = event.isUserRegistered(req.user.id);
    const isOrganizerOrAdmin = req.user.role === 'organizer' || req.user.role === 'admin';
    
    if (!isRegistered && !isOrganizerOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You must be registered for this event or be an organizer/admin to leave a review'
      });
    }

    // Check if user already has a review for this event
    let review = await Review.findOne({ eventId, userId: req.user.id });
    let isNew = false;

    // Prioritize userName from request body, otherwise use name/userName from user, or construct from firstName and lastName
    const userName = bodyUserName || req.user.name || req.user.userName || 
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'User';
    // Prioritize userPhoto from request body, otherwise use user photo, or default image path
    const userPhoto = bodyUserPhoto && bodyUserPhoto.trim() !== '' 
      ? bodyUserPhoto 
      : (req.user.photo && req.user.photo.trim() !== '' 
          ? req.user.photo 
          : '/DefaultImg.png');

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment || review.comment;
      review.userName = userName;
      review.userRole = req.user.role;
      review.userPhoto = userPhoto;
      await review.save();
    } else {
      // Create new review
      isNew = true;
      review = await Review.create({
        eventId,
        userId: req.user.id,
        userName,
        userRole: req.user.role,
        userPhoto,
        rating,
        comment: comment || ''
      });
    }

    res.status(201).json({
      success: true,
      message: isNew ? 'Review created successfully' : 'Review updated successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for an event
 * @route   GET /api/events/:eventId/reviews
 * @access  Public
 */
exports.getEventReviews = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const reviews = await Review.find({ eventId })
      .sort({ createdAt: -1 }) // Most recent first
      .select('-__v');

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's review for an event
 * @route   GET /api/events/:eventId/reviews/my-review
 * @access  Private
 */
exports.getMyReview = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const review = await Review.findOne({ eventId, userId: req.user.id });

    if (!review) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No review found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/events/:eventId/reviews/:reviewId
 * @access  Private (Review owner or Admin)
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the review owner or an admin
    if (review.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

