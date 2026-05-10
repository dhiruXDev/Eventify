const mongoose = require('mongoose');
const Club = require('../models/Club');
const Event = require('../models/Event');
const { populateOrganizers } = require('../services/userService');

/**
 * @desc    Create a new club
 * @route   POST /api/clubs
 * @access  Private (Organizers and Admins only)
 */
// exports.createClub = async (req, res, next) => {
//   try {
//     console.log("Inside createClub controller")
//     // Check if user is authenticated
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required to create a club'
//       });
//     }

//     const { 
//       name, 
//       description, 
//       type, 
//       tags, 
//       logo, 
//       about,  
//       officeLocation, 
//       officeOpeningTime, 
//       officeClosingTime 
//     } = req.body;

//     // Validate required fields
//     if (!name || !description) {
//       return res.status(400).json({
//         success: false,
//         message: 'Club name and description are required'
//       });
//     }

//     const userId = req.user.id;

//     // Check if club with same name already exists
//     const existingClub = await Club.findOne({ name });
//     if (existingClub) {
//       return res.status(400).json({
//         success: false,
//         message: 'Club with this name already exists'
//       });
//     }

//     // Ensure userId is a valid ObjectId
//     let organizerUserId;
//     if (mongoose.Types.ObjectId.isValid(userId)) {
//       organizerUserId = new mongoose.Types.ObjectId(userId);
//     } else {
//       organizerUserId = userId;
//     }

//     // Create new club
//     const club = await Club.create({
//       name,
//       description,
//       type: type || 'Other',
//       tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []),
//       logo: logo || '',
//       about: about || '',
//       officeLocation: officeLocation || '',
//       officeOpeningTime: officeOpeningTime || '09:00',
//       officeClosingTime: officeClosingTime || '17:00',
//       organizers: [{
//         userId: organizerUserId,
//         designation: req.body.designation || 'Chairman',
//         isPrimary: true
//       }],
//       isPublished: req.body.isPublished !== undefined ? req.body.isPublished : false
//     });

//     // Populate the club before sending response
//     const populatedClub = await Club.findById(club._id)
//       .populate('organizers.userId', 'firstName lastName email photo');

//     res.status(201).json({
//       success: true,
//       message: 'Club created successfully',
//       data: populatedClub
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.createClub = async (req, res, next) => {
  try {

    // Check authentication
    if (!req.user || !req.user.id) {
      console.log('[CONTROLLER] ERROR: No user authenticated');
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create a club'
      });
    }

    const {
      name,
      description,
      type,
      tags,
      logo,
      about,
      officeLocation,
      officeOpeningTime,
      officeClosingTime
    } = req.body;

    console.log('[CONTROLLER] Extracted fields:');
    console.log('[CONTROLLER] - name:', name);
    console.log('[CONTROLLER] - description:', description ? 'Present' : 'Missing');
    console.log('[CONTROLLER] - logo:', logo ? `Present (${logo.length} chars)` : 'Missing');

    // Validate required fields
    if (!name || !description) {
      console.log('[CONTROLLER] ERROR: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Club name and description are required'
      });
    }

    const userId = req.user.id;
    console.log('[CONTROLLER] Creating club for user:', userId);

    // Check if club with same name exists
    const existingClub = await Club.findOne({ name });
    if (existingClub) {
      console.log('[CONTROLLER] ERROR: Club name already exists');
      return res.status(400).json({
        success: false,
        message: 'Club with this name already exists'
      });
    }

    // Ensure userId is valid ObjectId
    let organizerUserId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      organizerUserId = new mongoose.Types.ObjectId(userId);
    } else {
      organizerUserId = userId;
    }

    console.log('[CONTROLLER] Creating club document...');

    // Create new club
    const club = await Club.create({
      name,
      description,
      type: type || 'Other',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []),
      logo: logo || '',
      about: about || '',
      officeLocation: officeLocation || '',
      officeOpeningTime: officeOpeningTime || '09:00',
      officeClosingTime: officeClosingTime || '17:00',
      organizers: [{
        userId: organizerUserId,
        designation: req.body.designation || 'Chairman',
        isPrimary: true
      }],
      isPublished: req.body.isPublished !== undefined ? req.body.isPublished : false
    });

    console.log('[CONTROLLER] Club created with ID:', club._id);

    // Populate organizers with user data from auth-service
    const authToken = req.headers.authorization;
    const populatedOrganizers = await populateOrganizers(club.organizers, authToken);

    const clubData = club.toObject();
    clubData.organizers = populatedOrganizers;

    console.log('[CONTROLLER] Club populated with user data');
    console.log('[CONTROLLER] createClub - SUCCESS\n');

    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      data: clubData
    });

    /* OPTION 2: Try to populate, but catch errors gracefully
    try {
      const populatedClub = await Club.findById(club._id)
        .populate('organizers.userId', 'firstName lastName email photo');
      
      console.log('[CONTROLLER] Club populated successfully');
      console.log('[CONTROLLER] createClub - SUCCESS\n');
      
      res.status(201).json({
        success: true,
        message: 'Club created successfully',
        data: populatedClub
      });
    } catch (populateError) {
      console.log('[CONTROLLER] WARNING: Could not populate user data');
      console.log('[CONTROLLER] Returning club without population');
      console.log('[CONTROLLER] createClub - SUCCESS (with warning)\n');
      
      // Return the club without populated user data
      res.status(201).json({
        success: true,
        message: 'Club created successfully',
        data: club,
        warning: 'User details not populated'
      });
    }
    */

  } catch (error) {
    console.error('[CONTROLLER] ERROR in createClub:', error.message);
    console.error('[CONTROLLER] Stack:', error.stack);
    next(error);
  }
};
/**
 * @desc    Get all clubs
 * @route   GET /api/clubs
 * @access  Public
 */
exports.getAllClubs = async (req, res, next) => {
  try {
    const query = {};

    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by tags if provided
    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      query.tags = { $in: tags };
    }

    // Handle isPublished filter
    // For authenticated admin/organizer users, respect the query parameter
    // For public users or unauthenticated users, only show published clubs
    //-> Here && (req.user.role === 'admin' || req.user.role === 'organizer')YE hatana hai 
    if (req.user) {
      // Admin/organizer can see all clubs or filter by isPublished
      if (req.query.isPublished !== undefined) {
        query.isPublished = req.query.isPublished === 'true';
      }
      // If no filter specified, show all (both published and unpublished)
    } else {
      // Public users (including unauthenticated) only see published clubs
      query.isPublished = true;
    }

    const clubs = await Club.find(query)
      .sort({ createdAt: -1 });

    // Populate organizers with user data from auth-service
    const authToken = req.headers.authorization;
    const clubsWithUsers = await Promise.all(
      clubs.map(async (club) => {
        const clubData = club.toObject();
        clubData.organizers = await populateOrganizers(club.organizers, authToken);
        return clubData;
      })
    );

    // Always return success, even if no clubs found
    res.status(200).json({
      success: true,
      count: clubsWithUsers.length,
      data: clubsWithUsers || []
    });
  } catch (error) {
    // Return empty array on error instead of failing
    // This ensures the frontend doesn't break if there's a database issue
    res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
};

/**
 * @desc    Get club by ID
 * @route   GET /api/clubs/:id
 * @access  Public
 */
exports.getClubById = async (req, res, next) => {
  try {
    // Don't process if the id is 'organizer' - this should be handled by /organizer/:userId route
    // This prevents /:id from matching /organizer/:userId
    if (req.params.id === 'organizer') {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if club is published or user is admin/organizer
    if (!club.isPublished &&
      (!req.user || (req.user.role !== 'admin' && req.user.role !== 'organizer'))) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this club'
      });
    }

    // Populate organizers with user data from auth-service
    const authToken = req.headers.authorization;
    const populatedOrganizers = await populateOrganizers(club.organizers, authToken);

    const clubData = club.toObject();
    clubData.organizers = populatedOrganizers;

    // Get related events for this club
    // Try to find events by organizer name matching club name, or by tags
    const events = await Event.find({
      $or: [
        { organizerName: club.name },
        { tags: { $in: club.tags || [] } }
      ]
    }).sort({ date: 1 }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...clubData,
        events
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update club
 * @route   PUT /api/clubs/:id
 * @access  Private (Club organizer or Admin only)
 */
exports.updateClub = async (req, res, next) => {
  try {
    console.log('[UPDATE-CLUB] Starting update process');
    console.log('[UPDATE-CLUB] Club ID:', req.params.id);
    console.log('[UPDATE-CLUB] User:', req.user ? { id: req.user.id, role: req.user.role } : 'NO USER');
    console.log('[UPDATE-CLUB] Update data keys:', Object.keys(req.body));

    let club = await Club.findById(req.params.id);

    if (!club) {
      console.log('[UPDATE-CLUB] ERROR: Club not found');
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    console.log('[UPDATE-CLUB] Club found:', club.name);
    console.log('[UPDATE-CLUB] Organizers:', club.organizers.map(org => ({
      userId: org.userId?.toString(),
      designation: org.designation
    })));

    // Check if user is authorized to update this club
    // Handle both string and ObjectId comparisons
    const userIdStr = req.user.id?.toString();
    const isOrganizer = club.organizers.some(org => {
      const orgUserIdStr = org.userId?.toString();
      return orgUserIdStr === userIdStr;
    });

    console.log('[UPDATE-CLUB] User ID:', userIdStr);
    console.log('[UPDATE-CLUB] Is Organizer:', isOrganizer);
    console.log('[UPDATE-CLUB] User Role:', req.user.role);

    if (!isOrganizer && req.user.role !== 'admin') {
      console.log('[UPDATE-CLUB] ERROR: Not authorized');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this club'
      });
    }

    // Update club - only allow specific fields to be updated
    const allowedFields = [
      'name', 'description', 'type', 'tags', 'logo', 'about',
      'officeLocation', 'officeOpeningTime', 'officeClosingTime', 'isPublished',
      'memberLimit', 'members', 'gallery'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle tags - ensure it's an array
    if (updateData.tags !== undefined) {
      if (typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(t => t);
      } else if (!Array.isArray(updateData.tags)) {
        updateData.tags = [];
      }
    }

    console.log('[UPDATE-CLUB] Update data:', Object.keys(updateData));
    console.log('[UPDATE-CLUB] Update data size:', JSON.stringify(updateData).length, 'bytes');

    // Validate update data before attempting update
    if (Object.keys(updateData).length === 0) {
      console.log('[UPDATE-CLUB] WARNING: No valid fields to update');
      // Still return the club, but with a message
      const authToken = req.headers.authorization;
      const populatedOrganizers = await populateOrganizers(club.organizers, authToken);
      const clubData = club.toObject();
      clubData.organizers = populatedOrganizers;

      return res.status(200).json({
        success: true,
        message: 'No changes to update',
        data: clubData
      });
    }

    try {
      club = await Club.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!club) {
        console.log('[UPDATE-CLUB] ERROR: Club not found after update');
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      console.log('[UPDATE-CLUB] Club updated successfully');

      // Sync designations with User DB
      try {
        const mongoose = require('mongoose');
        const usersCollection = mongoose.connection.collection('users');

        if (updateData.members && Array.isArray(updateData.members)) {
          for (const member of updateData.members) {
            if (member.email && member.designation) {
              await usersCollection.updateOne(
                { email: member.email },
                { $set: { clubDesignation: member.designation } }
              );
            }
          }
        }
        
        if (updateData.organizers && Array.isArray(updateData.organizers)) {
          for (const org of updateData.organizers) {
            if (org.userId && org.designation) {
              await usersCollection.updateOne(
                { _id: new mongoose.Types.ObjectId(org.userId) },
                { $set: { clubDesignation: org.designation } }
              );
            }
          }
        }
        console.log('[UPDATE-CLUB] Successfully synced designations to User DB');
      } catch (dbErr) {
        console.error('[UPDATE-CLUB] Failed to sync designations:', dbErr);
      }
    } catch (updateError) {
      console.error('[UPDATE-CLUB] Database update error:', updateError.message);
      console.error('[UPDATE-CLUB] Error name:', updateError.name);
      console.error('[UPDATE-CLUB] Error code:', updateError.code);

      // Handle validation errors
      if (updateError.name === 'ValidationError') {
        const messages = Object.values(updateError.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: messages
        });
      }

      // Handle duplicate key errors
      if (updateError.code === 11000) {
        const field = Object.keys(updateError.keyPattern || {})[0] || 'field';
        return res.status(400).json({
          success: false,
          message: `Duplicate ${field} value. This ${field} already exists.`
        });
      }

      // Re-throw to be handled by error middleware
      throw updateError;
    }

    // Populate organizers with user data from auth-service
    const authToken = req.headers.authorization;
    let populatedOrganizers;
    try {
      populatedOrganizers = await populateOrganizers(club.organizers, authToken);
    } catch (populateError) {
      console.error('[UPDATE-CLUB] Error populating organizers:', populateError.message);
      // Continue without populated data rather than failing
      populatedOrganizers = club.organizers.map(org => ({
        ...org.toObject ? org.toObject() : org,
        user: null
      }));
    }

    const clubData = club.toObject();
    clubData.organizers = populatedOrganizers;

    console.log('[UPDATE-CLUB] Returning updated club data');

    res.status(200).json({
      success: true,
      message: 'Club updated successfully',
      data: clubData
    });
  } catch (error) {
    console.error('[UPDATE-CLUB] ERROR:', error.message);
    console.error('[UPDATE-CLUB] Error name:', error.name);
    console.error('[UPDATE-CLUB] Error code:', error.code);
    console.error('[UPDATE-CLUB] Stack:', error.stack);
    next(error);
  }
};

/**
 * @desc    Add organizer to club
 * @route   POST /api/clubs/:id/organizers
 * @access  Private (Club organizer or Admin only)
 */
exports.addOrganizer = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is authorized
    const isOrganizer = club.organizers.some(
      org => org.userId.toString() === req.user.id
    );

    if (!isOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add organizers to this club'
      });
    }

    const { userId, designation } = req.body;

    // Check if organizer already exists
    const existingOrganizer = club.organizers.find(
      org => org.userId.toString() === userId
    );

    if (existingOrganizer) {
      return res.status(400).json({
        success: false,
        message: 'User is already an organizer of this club'
      });
    }

    // Add organizer
    club.organizers.push({
      userId,
      designation: designation || 'Member',
      isPrimary: false
    });

    await club.save();

    // Populate organizers with user data from auth-service
    const authToken = req.headers.authorization;
    const populatedOrganizers = await populateOrganizers(club.organizers, authToken);

    const clubData = club.toObject();
    clubData.organizers = populatedOrganizers;

    res.status(200).json({
      success: true,
      message: 'Organizer added successfully',
      data: clubData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add image to gallery
 * @route   POST /api/clubs/:id/gallery
 * @access  Private (Club organizer or Admin only)
 */
exports.addGalleryImage = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is authorized
    const isOrganizer = club.organizers.some(
      org => org.userId.toString() === req.user.id
    );

    if (!isOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add gallery images to this club'
      });
    }

    const { image, caption, isPublished } = req.body;

    club.gallery.push({
      image,
      caption: caption || '',
      isPublished: isPublished !== undefined ? isPublished : false
    });

    await club.save();

    res.status(200).json({
      success: true,
      message: 'Gallery image added successfully',
      data: club
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get club by organizer user ID
 * @route   GET /api/clubs/organizer/:userId
 * @access  Private
 */
exports.getClubByOrganizer = async (req, res, next) => {
  try {
    // This route requires authentication - check if user is authenticated

    if (!req) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - Authentication required'
      });
    }

    // Get userId from params or from authenticated user
    let userId = req.params.userId;

    // If no userId in params, try to get from authenticated user
    if (!userId && req.user) {
      userId = req.user.id || req.user._id;
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Convert userId to ObjectId if it's a valid ObjectId string
    let userIdQuery;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userIdQuery = new mongoose.Types.ObjectId(userId);
    } else {
      userIdQuery = userId;
    }

    // Try multiple query formats to find the club
    let club = null;

    // First try with ObjectId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      club = await Club.findOne({
        'organizers.userId': new mongoose.Types.ObjectId(userId)
      });
    }

    // If not found, try with string format
    if (!club) {
      club = await Club.findOne({
        'organizers.userId': userId.toString()
      });
    }

    // If still not found, try with the original userId
    if (!club) {
      club = await Club.findOne({
        'organizers.userId': userId
      });
    }

    // Try finding by member email if provided in query
    if (!club && req.query.email) {
      club = await Club.findOne({
        'members.email': req.query.email
      });
    }

    // Here i update this : 
    if (!club) {
      return res.status(200).json({
        success: false,
        message: 'No club found for this organizer'
      });
    }

    // Populate organizers with user data from auth-service
    const authToken = req.headers.authorization;
    const populatedOrganizers = await populateOrganizers(club.organizers, authToken);

    const clubData = club.toObject();
    clubData.organizers = populatedOrganizers;

    res.status(200).json({

      success: true,
      data: clubData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete club
 * @route   DELETE /api/clubs/:id
 * @access  Private (Admin only)
 */
exports.deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is authorized to delete this club
    const isOrganizer = club.organizers.some(org =>
      org.userId.toString() === req.user.id
    );

    if (!isOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this club'
      });
    }

    await club.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Club deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

