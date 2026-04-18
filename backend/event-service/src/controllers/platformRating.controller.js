const PlatformRating = require('../models/PlatformRating');

/**
 * @desc    Create or update a platform rating
 * @route   POST /api/events/platform/rating
 * @access  Private (All authenticated users)
 */
exports.createPlatformRating = async (req, res, next) => {
  try {
    const { rating, comment, userName: bodyUserName, userPhoto: bodyUserPhoto } = req.body;
    const userId = req.user.id;
    // Prioritize userName from request body, otherwise use name/userName from user, or construct from firstName and lastName
    const userName = bodyUserName || req.user.name || req.user.userName || 
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'User';
    const userRole = req.user.role;
    // Prioritize userPhoto from request body, otherwise use user photo, or default image path
    const userPhoto = bodyUserPhoto && bodyUserPhoto.trim() !== '' 
      ? bodyUserPhoto 
      : (req.user.photo && req.user.photo.trim() !== '' 
          ? req.user.photo 
          : '/DefaultImg.png');

    // Basic validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if user already has a rating
    let platformRating = await PlatformRating.findOne({ userId });

    if (platformRating) {
      // Update existing rating
      platformRating.rating = rating;
      platformRating.comment = comment || '';
      platformRating.userName = userName;
      platformRating.userRole = userRole;
      platformRating.userPhoto = userPhoto;
      await platformRating.save();
      res.status(200).json({ 
        success: true, 
        message: 'Platform rating updated successfully', 
        data: platformRating 
      });
    } else {
      // Create new rating
      platformRating = await PlatformRating.create({
        userId,
        userName,
        userRole,
        userPhoto,
        rating,
        comment: comment || ''
      });
      res.status(201).json({ 
        success: true, 
        message: 'Platform rating created successfully', 
        data: platformRating 
      });
    }
  } catch (error) {
    // Handle duplicate key error for unique index
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted a platform rating.' 
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all platform ratings
 * @route   GET /api/events/platform/ratings
 * @access  Public
 */
exports.getPlatformRatings = async (req, res, next) => {
  try {
    const ratings = await PlatformRating.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    // Calculate average rating
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
      : 0;

    res.status(200).json({
      success: true,
      count: ratings.length,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      data: ratings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's own platform rating
 * @route   GET /api/events/platform/rating/my-rating
 * @access  Private
 */
exports.getMyPlatformRating = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const rating = await PlatformRating.findOne({ userId });

    if (!rating) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No platform rating found from this user'
      });
    }

    res.status(200).json({
      success: true,
      data: rating
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a platform rating
 * @route   DELETE /api/events/platform/rating/:ratingId
 * @access  Private (Rating owner or Admin)
 */
exports.deletePlatformRating = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const rating = await PlatformRating.findById(ratingId);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Platform rating not found'
      });
    }

    // Check if user is the owner of the rating or an admin
    if (rating.userId.toString() !== userId.toString() && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this rating'
      });
    }

    await rating.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Platform rating deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

