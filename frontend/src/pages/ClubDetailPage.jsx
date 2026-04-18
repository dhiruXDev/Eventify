import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clubService, eventService } from '../services';
import Navbar from '../components/layout/Navbar';
import GeneralFooter from './GeneralFooter';

const ClubDetailPage = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        setLoading(true);
        const response = await clubService.getClubById(id);
        setClub(response.data);

        // Events are included in the response
        if (response.data.events) {
          setEvents(response.data.events);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch club details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClubData();
    }
  }, [id]);
  console.log("Club ", club);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Club Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The club you are looking for does not exist.'}</p>
          <Link to="/" className="text-green-600 hover:text-green-800 font-medium">
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  const publishedGallery = club.gallery?.filter(img => img.isPublished) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Club Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {club.logo && (
                <img
                  src={club.logo}
                  alt={club.name}
                  className="w-32 h-32 rounded-lg bg-white p-2 object-contain"
                />
              )}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-2">{club.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-5">

                  {/* Club Type – Primary Badge */}
                  <span className="px-5 py-2 bg-white text-green-700 rounded-full font-bold text-sm shadow-md">
                    {club.type}
                  </span>

                  {/* Divider (Desktop only) */}
                  {club.tags?.length > 0 && (
                    <span className="hidden md:inline-block h-5 w-px bg-white/40"></span>
                  )}

                  {/* Club Tags – Secondary Chips */}
                  {club.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-medium border border-white/30 hover:bg-white/30 transition"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <p className="text-white text-lg opacity-90">{club.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {club.about && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About the Club</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{club.about}</p>
              </div>
            )}

            {/* Events Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Related Events</h2>
              {events && events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <Link
                      key={event._id}
                      to={`/events/${event._id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {event.image && (
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">{event.title}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                            <span>📍 {event.location}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No events available for this club yet.</p>
              )}
            </div>

            {/* Gallery Section - Carousel */}
            {club.gallery && club.gallery.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Club Gallery</h2>
                <div className="relative group h-[400px] bg-gray-900 rounded-xl overflow-hidden">
                  <img
                    src={club.gallery[currentGalleryIndex].image}
                    alt={club.gallery[currentGalleryIndex].caption || 'Gallery'}
                    className="w-full h-full object-contain transition-all duration-500"
                  />

                  {/* Caption */}
                  {club.gallery[currentGalleryIndex].caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4 backdrop-blur-sm">
                      <p className="text-center italic">{club.gallery[currentGalleryIndex].caption}</p>
                    </div>
                  )}

                  {/* Controls */}
                  {club.gallery.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentGalleryIndex((prev) => (prev === 0 ? club.gallery.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Previous image"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentGalleryIndex((prev) => (prev === club.gallery.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Next image"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* Indicators */}
                      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2">
                        {club.gallery.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentGalleryIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentGalleryIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Club Details Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Club Details</h3>
              <div className="space-y-4">
                {club.officeLocation && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">📍 Office Location</h4>
                    <p className="text-gray-800">{club.officeLocation}</p>
                  </div>
                )}
                {(club.officeOpeningTime || club.officeClosingTime) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">🕐 Office Hours</h4>
                    <p className="text-gray-800">
                      {club.officeOpeningTime} - {club.officeClosingTime}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-gray-600">Members & Seats</h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                      {club.memberLimit - (club.members?.length || 0)} Vacant
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    Limit: {club.memberLimit} | Currently: {club.members?.length || 0}
                  </p>

                  {club.members && club.members.length > 0 && (
                    <div className="space-y-3">
                      {/* Priority List for Sidebar: Only Coords and Co-Coords */}
                      {[...club.members]
                        .sort((a, b) => {
                          const order = { 'Coordinator': 0, 'Co-coordinator': 1, 'Member': 2 };
                          return order[a.designation] - order[b.designation];
                        })
                        .slice(0, 3)
                        .map((member, index) => (
                          <div key={index} className="flex items-center gap-3">
                            {member.photo ? (
                              <img src={member.photo} alt={member.firstName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                {member.firstName?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-gray-800 leading-none">{member.firstName} {member.lastName}</p>
                              <p className="text-[10px] text-green-600 font-bold uppercase mt-1">{member.designation}</p>
                            </div>
                          </div>
                        ))
                      }

                      <button
                        onClick={() => setIsMembersModalOpen(true)}
                        className="w-full mt-4 py-2 bg-gray-800 text-white text-sm font-bold rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        View All Members
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Event Images */}
            {club.eventImages && club.eventImages.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Event Images</h3>
                <div className="grid grid-cols-2 gap-3">
                  {club.eventImages.slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Event ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <GeneralFooter /> */}

      {/* Members Modal */}
      {isMembersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Club Members</h3>
                <p className="text-sm text-gray-500">Full directory of {club.name} team</p>
              </div>
              <button
                onClick={() => setIsMembersModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...club.members]
                  .sort((a, b) => {
                    const order = { 'Coordinator': 0, 'Co-coordinator': 1, 'Member': 2 };
                    return order[a.designation] - order[b.designation];
                  })
                  .map((member, index) => (
                    <div key={index} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        {member.photo ? (
                          <img src={member.photo} alt={member.firstName} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-2xl font-bold shadow-sm">
                            {member.firstName?.charAt(0)}
                          </div>
                        )}
                        <span className={`absolute bottom-0 right-0 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase text-white ${member.designation === 'Coordinator' ? 'bg-amber-500' : member.designation === 'Co-coordinator' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                          {member.designation}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-800 text-lg mb-1">{member.firstName} {member.lastName}</h4>
                      <p className="text-sm text-green-600 font-semibold mb-3">{member.branch}, {member.graduationYear}</p>

                      <div className="w-full space-y-2 pt-3 border-t border-gray-50">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{member.mobileNo}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
              <p className="text-[10px] text-gray-400 font-medium">UniVento Club Management System</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDetailPage;

