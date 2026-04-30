const Event = require('../models/Event');
const axios = require('axios');
const crypto = require('crypto');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (Organizers and Admins only)
 */
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, capacity, tags, image } = req.body;
    
    // Get user info from request (set by auth middleware)
    const userId = req.user.id; // Use id directly from JWT token
    
    // Check if firstName and lastName are available in the token
    // If not, use a default value or extract from request body if provided
    let organizerName = 'Event Organizer'; // Default value
    
    if (req.body.organizerName) {
      // If client provides the organizer name, use it
      organizerName = req.body.organizerName;
    } else if (req.user.firstName && req.user.lastName) {
      // If available in the token (future-proofing)
      organizerName = `${req.user.firstName} ${req.user.lastName}`;
    }
    
    // Create new event
    const event = await Event.create({
      title,
      description,
      date,
      location,
      capacity: parseInt(capacity, 10),
      tags: tags || [],
      createdBy: userId,
      organizerName,
      image: image || ''
    });
    
    // Send announcement to notification-service
    try {
      const notificationServiceUrl = 'https://univent-notification-service.onrender.com' || 'http://localhost:8003';
      await axios.post(`${notificationServiceUrl}/api/announcements`, {
        title: `New Event: ${title}`,
        content: `A new event '${title}' has been announced by ${organizerName}.`,
        eventId: event._id,
        priority: 'high',
        creatorName: organizerName,
        isPublished: true
      }, {
        headers: {
          Authorization: req.headers['authorization'] || ''
        }
      });
    } catch (announceErr) {
      console.error('Failed to announce new event:', announceErr.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all events
 * @route   GET /api/events
 * @access  Public
 */
exports.getAllEvents = async (req, res, next) => {
  try {
    // Build query based on request query parameters
    const query = {};
    
    // Filter by tags if provided
    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      query.tags = { $in: tags };
    }
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    }
    
    // Filter by organizer if provided
    if (req.query.organizer) {
      query.createdBy = req.query.organizer;
    }
    
    // Get events
    const events = await Event.find(query).sort({ date: 1 });
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Private (Event creator or Admin only)
 */
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is authorized to update this event
    if (event.createdBy.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    
    // Update event
    event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete event
 * @route   DELETE /api/events/:id
 * @access  Private (Event creator or Admin only)
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is authorized to delete this event
    if (event.createdBy.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }
    
    await event.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register for event
 * @route   POST /api/events/:id/register
 * @access  Private
 */
exports.registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for past events'
      });
    }
    
    // Check if event is full
    if (event.participants.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is at full capacity'
      });
    }
    
    // Check if user is already registered
    if (event.isUserRegistered(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }
    
    // Get registration details from request body
    const { specialRequirements, name, email } = req.body;
    
    const qrToken = crypto.randomBytes(16).toString('hex');

    // Add user to participants
    event.participants.push({
      userId: req.user.id,
      name: name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Participant', // Use provided name or default
      email: email || req.user.email || 'No email provided', // Use provided email or default
      college: req.user.college || 'No college', // Add college information
      specialRequirements: specialRequirements || '',
      qrToken: qrToken
    });
    
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel registration for event
 * @route   DELETE /api/events/:id/register
 * @access  Private
 */
exports.cancelRegistration = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is registered
    if (!event.isUserRegistered(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }
    
    // Remove user from participants
    event.participants = event.participants.filter(
      participant => participant.userId.toString() !== req.user.id.toString()
    );
    
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get event participants
 * @route   GET /api/events/:id/participants
 * @access  Private (Event creator or Admin only)
 */
exports.getEventParticipants = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is authorized to view participants
    // Allow event creator, admin, or registered participants to view
    const isAuthorized = 
      event.createdBy.toString() === req.user.id.toString() ||
      req.user.role === 'admin' || 'organizer' ||
      event.isUserRegistered(req.user.id);
      
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view participants'
      });
    }
    
    res.status(200).json({
      success: true,
      count: event.participants.length,
      data: event.participants
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get QR Code for participant
 * @route   GET /api/events/:id/qrcode
 * @access  Private
 */
exports.getQrCode = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    const participant = event.participants.find(p => p.userId.toString() === req.user.id.toString());
    if (!participant) return res.status(404).json({ success: false, message: 'You are not registered for this event' });
    
    // Check if qrToken exists, if not generate one (for backwards compatibility with old registrations)
    if (!participant.qrToken) {
      participant.qrToken = crypto.randomBytes(16).toString('hex');
      await event.save();
    }
    
    res.status(200).json({
      success: true,
      data: {
        eventId: event._id,
        userId: req.user.id,
        qrToken: participant.qrToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Scan QR Code for attendance
 * @route   POST /api/events/:id/attendance/scan
 * @access  Private (Volunteers, Organizers, Admins)
 */
exports.scanQrCode = async (req, res, next) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken) return res.status(400).json({ success: false, message: 'QR token is required' });
    
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    // Check authorization: Admin, event creator, or volunteer
    const isAuthorized = 
      req.user.role === 'admin' ||
      event.createdBy.toString() === req.user.id.toString() ||
      (event.volunteers && event.volunteers.some(v => v.toString() === req.user.id.toString()));
      
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to scan QR codes for this event' });
    }
    
    const participantIndex = event.participants.findIndex(p => p.qrToken === qrToken);
    if (participantIndex === -1) {
      return res.status(400).json({ success: false, message: 'Invalid QR token or participant not found in this event' });
    }
    
    const participant = event.participants[participantIndex];
    
    if (participant.attended) {
      return res.status(400).json({ success: false, message: 'Participant has already been marked as present' });
    }
    
    event.participants[participantIndex].attended = true;
    event.participants[participantIndex].scanTime = Date.now();
    event.participants[participantIndex].scannedBy = req.user.id;
    
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        name: participant.name,
        email: participant.email,
        attended: true,
        scanTime: event.participants[participantIndex].scanTime
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Attendance History for a participant
 * @route   GET /api/events/attendance/history
 * @access  Private
 */
exports.getAttendanceHistory = async (req, res, next) => {
  try {
    // Find events where user is a participant
    const events = await Event.find({ 'participants.userId': req.user.id }).sort({ date: -1 });
    
    const history = events.map(event => {
      const participantInfo = event.participants.find(p => p.userId.toString() === req.user.id.toString());
      return {
        eventId: event._id,
        title: event.title,
        date: event.date,
        location: event.location,
        organizerName: event.organizerName,
        attended: participantInfo ? participantInfo.attended : false,
        certificateIssued: participantInfo ? participantInfo.certificateIssued : false,
        certificateUrl: participantInfo ? participantInfo.certificateUrl : null
      };
    });
    
    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Scan History for a volunteer
 * @route   GET /api/events/attendance/scans
 * @access  Private
 */
exports.getScanHistory = async (req, res, next) => {
  try {
    // Find events where user is a volunteer or creator, and return the scans they performed
    const events = await Event.find({ 'participants.scannedBy': req.user.id }).sort({ date: -1 });
    
    let scans = [];
    events.forEach(event => {
      const scannedParticipants = event.participants.filter(p => p.scannedBy && p.scannedBy.toString() === req.user.id.toString());
      scannedParticipants.forEach(p => {
        scans.push({
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.date,
          participantName: p.name,
          participantEmail: p.email,
          scanTime: p.scanTime
        });
      });
    });
    
    // Sort scans by scanTime descending
    scans.sort((a, b) => new Date(b.scanTime) - new Date(a.scanTime));
    
    res.status(200).json({
      success: true,
      count: scans.length,
      data: scans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Attendance Stats for an event
 * @route   GET /api/events/:id/attendance/stats
 * @access  Private (Event creator or Admin only)
 */
exports.getAttendanceStats = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    const isAuthorized = event.createdBy.toString() === req.user.id.toString() || req.user.role === 'admin';
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const totalParticipants = event.participants.length;
    const attended = event.participants.filter(p => p.attended).length;
    const absent = totalParticipants - attended;
    
    res.status(200).json({
      success: true,
      data: {
        totalParticipants,
        attended,
        absent
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign volunteers to an event
 * @route   POST /api/events/:id/volunteers
 * @access  Private (Event creator or Admin only)
 */
exports.assignVolunteers = async (req, res, next) => {
  try {
    const { volunteerIds } = req.body;
    if (!Array.isArray(volunteerIds)) {
      return res.status(400).json({ success: false, message: 'volunteerIds must be an array' });
    }
    
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    const isAuthorized = event.createdBy.toString() === req.user.id.toString() || req.user.role === 'admin';
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    event.volunteers = volunteerIds;
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Volunteers assigned successfully',
      data: event.volunteers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Release Certificates for an event
 * @route   POST /api/events/:id/certificates/release
 * @access  Private (Event creator or Admin only)
 */
exports.releaseCertificates = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    const isAuthorized = event.createdBy.toString() === req.user.id.toString() || req.user.role === 'admin';
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Mark certificateIssued = true for all attended participants
    let certificatesIssuedCount = 0;
    event.participants.forEach((p, index) => {
      if (p.attended && !p.certificateIssued) {
        event.participants[index].certificateIssued = true;
        certificatesIssuedCount++;
      }
    });
    
    await event.save();
    
    res.status(200).json({
      success: true,
      message: `Released certificates to ${certificatesIssuedCount} attended participants`,
      data: {
        issuedCount: certificatesIssuedCount
      }
    });
  } catch (error) {
    next(error);
  }
};