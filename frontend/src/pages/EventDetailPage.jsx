import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService } from '../services';
import { useAuth } from '../context/AuthContext';
import EventRegistrationForm from '../components/events/EventRegistrationForm';
import EventAnnouncements from '../components/events/EventAnnouncements';
import EventReviews from '../components/events/EventReviews';
import { QRCodeSVG } from 'qrcode.react';

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Check if user is an organizer or admin
  const isOrganizerOrAdmin = user && (user.role === 'organizer' || user.role === 'admin');
  // Check if user is the event creator
  const isEventCreator = event && user && event.createdBy === user.id;
  // Check if user is a participant (not admin or organizer)
  // eslint-disable-next-line no-unused-vars
  const isParticipant = user && user.role === 'participant';

  // Function to fetch event details
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate eventId before making API call
      if (!eventId) {
        setError('Invalid event ID');
        setLoading(false);
        return;
      }

      // console.log('Fetching event with ID:', eventId); // Debug log
      
      const eventData = await eventService.getEventById(eventId);
      // console.log('Event data received:', eventData); // Debug log to see what's returned
      setEvent(eventData);
      
      // Fetch participants in a separate call to avoid race conditions
      await fetchParticipants();
      
    } catch (err) {
      console.error('Failed to fetch event details:', err);
      setError('Failed to load event details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch participants
  const fetchParticipants = async () => {
    if (!user || !eventId) return;
    
    try {
      const participantsData = await eventService.getEventParticipants(eventId);
      // console.log('Participants data received:', participantsData); // Debug log
      
      // Ensure we have an array of participants
      const list = Array.isArray(participantsData) ? participantsData : 
                  (participantsData && participantsData.data ? participantsData.data : []);
      
      setParticipants(list);
      setIsRegistered(list.some(p => p.userId === user.id));
    } catch (participantError) {
      console.warn('Failed to fetch participants:', participantError);
      setParticipants([]);
    }
  };

  useEffect(() => {
    // Only fetch if eventId exists
    if (eventId) {
      fetchEventDetails();
    } else {
      setError('No event ID provided');
      setLoading(false);
    }
    
    // Set up polling to refresh participant data every 10 seconds
    const participantPolling = setInterval(() => {
      if (eventId && user) {
        fetchParticipants();
      }
    }, 10000); // 10 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(participantPolling);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user]);

  const handleRegister = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }
    
    // Admins cannot register for events, but organizers can (to test QR/attendance)
    if (user.role === 'admin') {
      return;
    }
    
    setShowRegistrationForm(true);
  };

  const handleCancelRegistration = async () => {
    try {
      await eventService.cancelRegistration(eventId);
      setIsRegistered(false);
      // Fetch updated participants list after cancellation
      fetchParticipants();
    } catch (err) {
      console.error('Failed to cancel registration:', err);
      // Show error message
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await eventService.deleteEvent(eventId);
        navigate('/events');
      } catch (err) {
        console.error('Failed to delete event:', err);
        // Show error message
      }
    }
  };

  const handleFetchQr = async () => {
    try {
      const res = await eventService.getQrCode(eventId);
      setQrCodeData(res.qrToken);
      setShowQrModal(true);
    } catch (err) {
      console.error('Failed to get QR code', err);
      alert('Failed to get QR code: ' + err.message);
    }
  };

  const handleReleaseCertificates = async () => {
    if (window.confirm('Release certificates for all attendees?')) {
      try {
        const res = await eventService.releaseCertificates(eventId);
        alert(res.message);
        fetchParticipants(); // refresh
      } catch (err) {
        alert('Failed: ' + err.message);
      }
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) return 'Invalid Date';
    const options = {
      weekday: 'long', year: 'numeric',
      month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if event is past
  const isEventPast = () => {
    if (!event || !event.date) return false;
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate < now;
  };
  

  // Show error if no eventId
  if (!eventId) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <svg className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-center text-gray-800">Invalid Event ID</h2>
          <p className="mt-2 text-center text-gray-600">The event ID is missing or invalid.</p>
          <div className="mt-6 text-center">
            <Link to="/events" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <svg className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-center text-gray-800">{error}</h2>
          <div className="mt-6 text-center">
            <Link to="/events" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800">Event not found</h2>
          <p className="mt-2 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
          <div className="mt-6">
            <Link to="/events" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            to="/events"
            className="text-indigo-600 hover:text-indigo-900 flex items-center"
          >
            <svg
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Events
          </Link>
        </div>

        {/* Event details card */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
            <div>
              <h3 className="text-2xl leading-6 font-bold text-gray-900">
                {event?.title || 'Event Title'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Organized by{" "}
                {event?.organizerName &&
                event.organizerName.trim() !== "undefined undefined"
                  ? event.organizerName
                  : "Event Organizer"}
              </p>
            </div>
            {/* Admin/Organizer actions */}
            <div className="flex space-x-3">
              {isEventCreator && (
                <>
                  <Link
                    to={`/events/${eventId}/edit`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </>
              )}
              <Link
                to={`/leaderboard/${eventId}`}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Date and Time
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {event?.date ? formatDate(event.date) : 'Date not specified'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {event?.location || 'Location not specified'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {event?.description || 'No description provided'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {participants && event ? `${participants.length} / ${event.capacity || 0} registered` : 'Loading capacity information...'}
                </dd>
              </div>
              {/* Removing duplicate Description section */}
              {event?.tags && event.tags.length > 0 && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Tags</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Registration section - visible to participants and organizers */}
        {user?.role !== 'admin' && (
          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Event Registration
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  {isEventPast()
                    ? "This event has ended. Registration is closed."
                    : isRegistered
                    ? "You are registered for this event."
                    : participants && event && participants.length >= (event.capacity || 0)
                    ? "This event has reached its capacity."
                    : "Register to secure your spot for this event."}
                </p>
              </div>
              <div className="mt-5">
                {isEventPast() ? (
                  <button
                    disabled
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed opacity-60"
                  >
                    Register Closed
                  </button>
                ) : isRegistered ? (
                  <div className="flex gap-4">
                    <button
                      onClick={handleCancelRegistration}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel Registration
                    </button>
                    <button
                      onClick={handleFetchQr}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      View Ticket QR
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={participants && event && participants.length >= (event.capacity || 0)}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      participants && event && participants.length >= (event.capacity || 0)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    }`}
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Registration form modal */}
        {showRegistrationForm && (
          <EventRegistrationForm
            event={event}
            onClose={() => setShowRegistrationForm(false)}
            onSuccess={() => {
              setIsRegistered(true);
              setShowRegistrationForm(false);
              // Fetch updated participants list after successful registration
              fetchParticipants();
            }}
          />
        )}

        {/* Participants section (visible to organizers/admins) */}
        {isOrganizerOrAdmin && (
          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Registered Participants ({participants ? participants.length : 0})
                </h3>
                {isEventPast() && (
                  <button onClick={handleReleaseCertificates} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition">
                    Release Certificates
                  </button>
                )}
              </div>
              <div className="mt-4">
                {participants && participants.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <li key={participant.userId || `participant-${Math.random()}`} className="py-4 flex justify-between items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {participant.name || 'Unnamed Participant'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {participant.email || 'No email provided'}
                          </p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs rounded-full font-bold ${participant.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {participant.attended ? 'Present' : 'Absent'}
                          </span>
                          {participant.certificateIssued && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full font-bold bg-blue-100 text-blue-800">
                              Certificate Issued
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No participants registered yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Event Announcements Section */}
        <div className="mt-8">
          <EventAnnouncements eventId={eventId} eventTitle={event?.title} />
        </div>

        {/* Event Reviews Section */}
        <div className="mt-8">
          <EventReviews eventId={eventId} />
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && qrCodeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Your Event Ticket</h3>
              <button onClick={() => setShowQrModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="bg-gray-100 p-4 rounded-lg mb-4 flex justify-center w-full">
                <QRCodeSVG value={qrCodeData} size={200} />
              </div>
              <p className="text-sm text-center text-gray-600">
                Show this QR code to the event organizers upon arrival to mark your attendance.
              </p>
            </div>
            <button 
              onClick={() => setShowQrModal(false)}
              className="w-full mt-4 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;