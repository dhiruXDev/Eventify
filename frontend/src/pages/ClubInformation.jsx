import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context';
import { eventService, clubService } from '../services';

const ClubInformation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');



  // Fetch organizer's events and club
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // Fetch Events
        const allEvents = await eventService.getAllEvents();
        const organizerEvents = allEvents.data.filter(event => event.createdBy === user.id);
        organizerEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(organizerEvents);

        // Fetch Club
        try {
          const clubRes = await clubService.getClubByOrganizer(user.id || user._id, user.email);
          if (clubRes && clubRes.data && clubRes.data.name) {
            setClub(clubRes.data);
          }
        } catch (clubErr) {
          console.log("Organizer has no club yet");
        }

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Extract all members (organizers + standard members)
  const allMembers = [];
  if (club) {
    if (club.organizers) {
      club.organizers.forEach(org => {
        allMembers.push({
          id: org.userId?._id || org.userId,
          name: org.userId?.firstName ? `${org.userId.firstName} ${org.userId.lastName}` : (org.userId?.name || 'Unknown Organizer'),
          email: org.userId?.email || 'N/A',
          role: org.designation || 'Organizer',
          photo: org.userId?.photo || null,
          yearBranch: org.userId?.branch ? `${org.userId.branch}` : 'Staff',
          isActive: true,
          isOrganizer: true
        });
      });
    }
    if (club.members) {
      club.members.forEach(mem => {
        allMembers.push({
          id: mem.email || mem.name,
          name: `${mem.firstName || ''} ${mem.lastName || ''}`.trim() || mem.name,
          email: mem.email,
          role: mem.designation || 'Member',
          photo: mem.photo || null,
          yearBranch: mem.branch ? `${mem.year ? mem.year + ' Year, ' : ''}${mem.branch}` : 'Student',
          isActive: true,
          isOrganizer: false
        });
      });
    }
  }

  // Filter members
  const filteredMembers = allMembers.filter(m => {
    if (searchQuery && !(m.name || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (roleFilter !== 'All Roles' && m.role !== roleFilter) return false;
    return true;
  });

  const uniqueRoles = ['All Roles', ...new Set(allMembers.map(m => m.role))];

  // Helper to determine role badge color
  const getRoleBadgeColor = (role) => {
    const r = role.toLowerCase();
    if (r.includes('president') || r.includes('chairman') || r.includes('coordinator')) return 'bg-green-100 text-green-800 border-green-200';
    if (r.includes('vice')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (r.includes('secretary')) return 'bg-teal-100 text-teal-800 border-teal-200';
    if (r.includes('treasurer')) return 'bg-lime-100 text-lime-800 border-lime-200';
    if (r.includes('core')) return 'bg-green-50 text-green-700 border-green-100';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If they don't have a club, show the old minimal dashboard view
  if (!club) {
    return (
      <div className="pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 mt-6">
          <div className="bg-gradient-to-r from-green-600 to-teal-700 px-6 py-4">
            <h1 className="text-3xl font-bold text-white">Club Information</h1>
          </div>
          <div className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {user?.firstName}!</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">It looks like you haven't created a club yet. Creating a club unlocks the full dashboard where you can manage members, view analytics, and organize events seamlessly.</p>
            <Link to="/profile" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Create Your Club Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 bg-gray-50 min-h-screen">
      {/* Top Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-bl-[100px] opacity-10 z-0"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-500 rounded-br-[100px] opacity-10 z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <Link to="/dashboard" className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium mb-4">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold text-gray-900">{club.name}</h1>
              {club.isPublished && (
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-2 font-medium">{club.tags?.join(' • ') || club.type}</p>
            <p className="text-gray-500 mt-1 max-w-2xl">{club.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="px-4 py-2 border-r border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{allMembers.length}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Members</p>
              </div>
            </div>
            <div className="px-4 py-2 flex items-center gap-4 border-r border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{events.length}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Events Organized</p>
              </div>
            </div>
            <div className="px-4 py-2 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">Active</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Club Status</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Club Members */}
          <div className="lg:col-span-1 flex flex-col h-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full min-h-[600px]">
              <div className="bg-[#0f766e] px-6 py-4">
                <h2 className="text-lg font-bold text-white">Club Members ({allMembers.length})</h2>
              </div>
              
              <div className="p-4 border-b border-gray-100 flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Search members..." 
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <select 
                  className="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2 outline-none"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No members found.</p>
                ) : (
                  filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group transition-colors border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-4">
                        {member.photo ? (
                          <img src={member.photo} alt={member.name || 'Member'} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 text-teal-800 flex items-center justify-center font-bold text-lg border border-teal-300">
                            {(member.name || 'U').charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900">{member.name || 'Unknown User'}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getRoleBadgeColor(member.role || '')}`}>
                              {member.role || 'Member'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{member.yearBranch || 'N/A'}</p>
                          <p className="text-xs text-gray-400 font-medium truncate max-w-[160px]">{member.email || 'No Email'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {member.isActive && <span className="flex items-center text-[10px] font-bold text-green-600 uppercase tracking-wide"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span> Active</span>}
                        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-100">
                <button className="w-full py-2 border border-green-600 text-green-700 hover:bg-green-50 font-bold text-sm rounded-lg transition">View All Members</button>
              </div>
            </div>
          </div>

          {/* Right Column: Details, Activities, Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Row: Club Details & Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Club Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#0f766e] px-6 py-4">
                  <h2 className="text-lg font-bold text-white">Club Details</h2>
                </div>
                <div className="p-6">
                  <dl className="space-y-4">
                    <div className="flex border-b border-gray-50 pb-3">
                      <dt className="w-1/3 text-sm font-semibold text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        Type
                      </dt>
                      <dd className="w-2/3 text-sm font-medium text-gray-900">{club.type}</dd>
                    </div>
                    <div className="flex border-b border-gray-50 pb-3">
                      <dt className="w-1/3 text-sm font-semibold text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        Established
                      </dt>
                      <dd className="w-2/3 text-sm font-medium text-gray-900">{new Date(club.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</dd>
                    </div>
                    <div className="flex border-b border-gray-50 pb-3">
                      <dt className="w-1/3 text-sm font-semibold text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        Contact Email
                      </dt>
                      <dd className="w-2/3 text-sm font-medium text-gray-900">{club.organizers[0]?.userId?.email || 'N/A'}</dd>
                    </div>
                    <div className="flex border-b border-gray-50 pb-3">
                      <dt className="w-1/3 text-sm font-semibold text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        Location
                      </dt>
                      <dd className="w-2/3 text-sm font-medium text-gray-900">{club.officeLocation || 'SLIET Campus'}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-1/3 text-sm font-semibold text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Hours
                      </dt>
                      <dd className="w-2/3 text-sm font-medium text-gray-900">{club.officeOpeningTime} - {club.officeClosingTime}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Decorative Image/Graphic */}
              <div className="bg-gradient-to-br from-[#334155] to-[#1e293b] rounded-xl shadow-sm border border-gray-800 overflow-hidden relative flex flex-col justify-end p-6 min-h-[250px]">
                {club.logo ? (
                  <img src={club.logo} alt="Club Logo" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                     <svg className="w-48 h-48 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                  </div>
                )}
                <div className="relative z-10 text-center">
                  <p className="text-xl font-serif italic text-blue-100">"Building solutions, sharing knowledge, and growing together."</p>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#0f766e] px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Upcoming Events</h2>
                <Link to="/events" className="text-teal-100 text-sm font-medium hover:text-white hover:underline">View All</Link>
              </div>
              <div className="p-0">
                {events.filter(e => new Date(e.date) >= new Date().setHours(0,0,0,0)).length === 0 ? (
                  <p className="text-center text-gray-500 py-6">No upcoming events scheduled.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {events.filter(e => new Date(e.date) >= new Date().setHours(0,0,0,0)).slice(0, 3).map((event) => {
                      const dateObj = new Date(event.date);
                      const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                      const day = dateObj.getDate().toString().padStart(2, '0');
                      
                      return (
                        <div key={event._id} className="p-4 flex items-center gap-5 hover:bg-gray-50 transition">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg w-14 h-14 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">{month}</span>
                            <span className="text-lg font-black text-gray-900 leading-none">{day}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-gray-900">{event.title}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                {event.location || 'Online'}
                              </p>
                            </div>
                          </div>
                          <Link to={`/events/${event._id}`} className="text-teal-600 font-bold text-sm bg-teal-50 px-3 py-1.5 rounded hover:bg-teal-100 transition">Manage</Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions (Bottom) */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 ml-1">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/events/create" className="bg-white border border-gray-200 hover:border-teal-500 hover:shadow-md transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Create Event</span>
                </Link>

                <Link to="/recruitment/create" className="bg-white border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Recruitment</span>
                </Link>

                <Link to="/volunteer-scanner" className="bg-white border border-gray-200 hover:border-pink-500 hover:shadow-md transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Scanner</span>
                </Link>
                
                <Link to="/profile" className="bg-white border border-gray-200 hover:border-amber-500 hover:shadow-md transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Manage Club</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ClubInformation;