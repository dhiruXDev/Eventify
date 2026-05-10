import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService, clubService } from '../services';
import QRScanner from '../components/QRScanner';
import { useAuth } from '../context/AuthContext';

const AttendanceManagementPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [manualIdentifier, setManualIdentifier] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMarkingPresent, setIsMarkingPresent] = useState(false);
  const [loadingParticipantId, setLoadingParticipantId] = useState(null);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [isSendingCertificates, setIsSendingCertificates] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Stats
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    // Fetch all events created by this organizer or if admin
    const fetchEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const eventsRes = await eventService.getAllEvents();
        // Assuming we show all events or filter by organizer
        const relevantEvents = Array.isArray(eventsRes?.data) ? eventsRes.data : (Array.isArray(eventsRes) ? eventsRes : []);
        
        let clubEvents = [];
        const currentUserId = user?.id || user?._id;
        
        try {
          if (currentUserId) {
            const clubRes = await clubService.getClubByOrganizer(currentUserId, user?.email || '');
            if (clubRes?.data?.name) {
              const isOrganizer = clubRes.data.organizers?.some(org => 
                org.userId?._id === currentUserId || org.userId === currentUserId || org.userId?.toString() === currentUserId
              );
              const isMember = clubRes.data.members?.some(mem => 
                mem.email === user?.email || mem.userId === currentUserId || mem.userId?.toString() === currentUserId
              );
              if (isOrganizer || isMember) {
                clubEvents = relevantEvents.filter(e => e.organizerName === clubRes.data.name);
              }
            }
          }
        } catch (e) {
          // Ignore if user is not in a club
        }
        
        // Filter events
        const filtered = user?.role === 'admin' 
          ? relevantEvents 
          : relevantEvents.filter(e => 
              e.createdBy === currentUserId || 
              (e?.volunteers && e.volunteers.includes(currentUserId)) ||
              clubEvents.some(ce => ce._id === e._id)
            );
          
        setEvents(filtered);
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    if (user) {
      fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEventId) {
      const ev = events.find(e => e._id === selectedEventId);
      setSelectedEvent(ev);
      fetchParticipants(selectedEventId);
      setSelectedParticipants([]); // Reset selection when event changes
    } else {
      setSelectedEvent(null);
      setParticipants([]);
      setStats({ total: 0, checkedIn: 0 });
      setSelectedParticipants([]);
    }
  }, [selectedEventId, events]);

  const fetchParticipants = async (eventId) => {
    try {
      const res = await eventService.getEventParticipants(eventId);
      const list = Array.isArray(res) ? res : (res.data || []);
      setParticipants(list);
      
      const checkedIn = list.filter(p => p.attended).length;
      setStats({ total: list.length, checkedIn });
    } catch (err) {
      console.error('Failed to fetch participants', err);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    if (!selectedEventId) {
      setError('Please select an event first.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const response = await eventService.scanQrCode(selectedEventId, decodedText);
      setScanResult({
        success: true,
        message: response.alreadyScanned ? 'Already Present' : 'Attendance Marked',
        name: response.data?.name || 'Participant'
      });
      setError('');
      
      // Refresh list
      fetchParticipants(selectedEventId);
      
      setTimeout(() => setScanResult(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to record attendance');
      setScanResult(null);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleManualCheckIn = async (identifier = manualIdentifier) => {
    if (!selectedEventId) {
      setError('Please select an event first.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    const checkIdentifier = typeof identifier === 'string' ? identifier : manualIdentifier;
    if (!checkIdentifier.trim()) {
      setError('Please enter a name or email.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setIsMarkingPresent(true);
      const response = await eventService.manualCheckIn(selectedEventId, checkIdentifier);
      setScanResult({
        success: true,
        message: response.alreadyScanned ? 'Already Present' : 'Manual Check-In Successful',
        name: response.data?.name || 'Participant'
      });
      setError('');
      setManualIdentifier(''); // Clear input
      
      // Refresh list
      fetchParticipants(selectedEventId);
      
      setTimeout(() => setScanResult(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to manually check in');
      setScanResult(null);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsMarkingPresent(false);
      setLoadingParticipantId(null);
    }
  };

  const handleDownloadList = () => {
    if (!participants || participants.length === 0) {
      setError('No participants to download');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    const headers = ['Rank', 'Name', 'Email', 'College', 'Status', 'Scan Time'];
    const csvRows = [headers.join(',')];
    
    filteredParticipants.forEach((p, index) => {
      const scanTimeStr = p.scanTime ? new Date(p.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
      const status = p.attended ? 'Present' : 'Absent';
      const row = [
        index + 1,
        `"${p.name || ''}"`,
        `"${p.email || ''}"`,
        `"${p.college || ''}"`,
        status,
        `"${scanTimeStr}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedEvent?.title || 'Attendance'}_List.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter participants by search
  const filteredParticipants = participants.filter(p => 
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.college && p.college.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectParticipant = (id) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const presentParticipants = filteredParticipants
      .filter(p => p.attended)
      .map(p => p.userId || p._id);
    
    if (selectedParticipants.length === presentParticipants.length && presentParticipants.length > 0) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(presentParticipants);
    }
  };

  const handleSendCertificates = async () => {
    if (selectedParticipants.length === 0) return;
    
    try {
      setIsSendingCertificates(true);
      setError('');
      const response = await eventService.sendCertificates(selectedEventId, selectedParticipants);
      setSuccessMessage(response.message || `Certificates sent to ${selectedParticipants.length} students`);
      setSelectedParticipants([]);
      
      // Refresh participants to show updated certificate status if any
      fetchParticipants(selectedEventId);
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to send certificates');
    } finally {
      setIsSendingCertificates(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link to="/organizerdashboard" className="hover:text-indigo-600 underline">Organizer Dashboard</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900">Attendance</span>
          </div>
          
          <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-green-600">Attendance</span> Management
              </h1>
              <p className="mt-2 text-gray-600">
                Effortlessly manage attendee presence at your club events using QR Codes.
              </p>
            </div>
            <div className="hidden md:block">
              {/* Simple illustration placeholder using SVG */}
              <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
                <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error/Success Popups */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded shadow-sm flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="text-green-900 font-bold">&times;</button>
          </div>
        )}
        
        {/* Success Popup Modal */}
        {scanResult && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center transform scale-100 animate-bounce pointer-events-auto border-4 border-green-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{scanResult.message}</h2>
              <p className="text-lg text-gray-600 font-medium">{scanResult.name}</p>
            </div>
          </div>
        )}

        {!isLoadingEvents && events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center mt-8">
            <div className="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user?.role === 'organizer' ? 'No Events Found' : 'Access Restricted'}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {user?.role === 'organizer' 
                ? "You haven't created any events yet. Create an event first to manage its attendance."
                : "You do not have any events assigned to you for marking attendance. Only authorized club members or assigned volunteers can access this feature."}
            </p>
            <Link to={user?.role === 'organizer' ? '/events/create' : '/dashboard'} className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-md transition">
              {user?.role === 'organizer' ? 'Create an Event' : 'Return to Dashboard'}
            </Link>
          </div>
        ) : (
          <>
            {/* 3-Column Layout for Top Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* 1. Select Event */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-green-700 px-4 py-3 border-b border-green-800">
              <h2 className="text-white font-semibold text-lg">Select Event</h2>
            </div>
            <div className="p-5 flex-grow flex flex-col justify-center">
              <select
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-3 bg-gray-50 text-gray-800 border"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                disabled={isLoadingEvents}
              >
                <option value="">{isLoadingEvents ? 'Loading events...' : '-- Choose an Event --'}</option>
                {events.map(e => (
                  <option key={e._id} value={e._id}>{e.title}</option>
                ))}
              </select>
              {selectedEvent && (
                <div className="mt-4 text-sm text-gray-600 font-medium">
                  Scanning for active event: <span className="text-gray-900 font-bold">{selectedEvent.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Scan QR */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-green-700 px-4 py-3 border-b border-green-800">
              <h2 className="text-white font-semibold text-lg">Scan Attendee Profile QR</h2>
            </div>
            <div className="p-0 flex-grow bg-black flex items-center justify-center relative min-h-[100px]">
              {selectedEventId ? (
                <div className="w-full h-full p-2">
                  <QRScanner onScanSuccess={handleScanSuccess} />
                </div>
              ) : (
                <div className="text-gray-400 text-sm flex flex-col items-center">
                  <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  Select an event to enable scanner
                </div>
              )}
            </div>
          </div>

          {/* 3. Real-time Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-green-700 px-4 py-3 border-b border-green-800">
              <h2 className="text-white font-semibold text-lg">Real-time Statistics</h2>
            </div>
            <div className="p-5 flex-grow flex flex-col justify-center gap-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-600 font-medium text-lg">Total Registered:</span>
                <span className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {stats.total}
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium text-lg">Checked In:</span>
                <span className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {stats.checkedIn}
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Attendance List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">Current Attendance List</h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <input
                  type="text"
                  placeholder="Search name, email..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <button 
                onClick={handleDownloadList}
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md font-medium text-sm transition shadow-sm flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download List
              </button>
              <button 
                type="button"
                onClick={handleSendCertificates}
                disabled={selectedParticipants.length === 0 || isSendingCertificates}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition shadow-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                {isSendingCertificates ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                )}
                {isSendingCertificates ? 'Sending...' : `Send Certificates (${selectedParticipants.length})`}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                      checked={selectedParticipants.length > 0 && selectedParticipants.length === filteredParticipants.filter(p => p.attended).length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rank/No.</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Profile Avatar</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email/ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">College/University</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Scan Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((p, index) => (
                    <tr key={p.userId || p._id || index} className={`hover:bg-gray-50 ${selectedParticipants.includes(p.userId || p._id) ? 'bg-indigo-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                          disabled={!p.attended}
                          checked={selectedParticipants.includes(p.userId || p._id)}
                          onChange={() => handleSelectParticipant(p.userId || p._id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                          {p.name ? p.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {p.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {p.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex flex-col">
                        <span>{p.college || 'N/A'}</span>
                        {p.isClubMember && (
                          <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 w-max">
                            {p.clubName || 'Club Member'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {p.scanTime ? new Date(p.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:-- --'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {p.attended ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800 border border-green-200">
                            <svg className="w-3 h-3 mr-1 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                            Present
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              const participantId = p.userId || p._id || index;
                              setLoadingParticipantId(participantId);
                              handleManualCheckIn(p.email || p.name);
                            }}
                            disabled={loadingParticipantId === (p.userId || p._id || index) || isMarkingPresent}
                            className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800 transition-colors shadow-sm disabled:opacity-50"
                          >
                            {loadingParticipantId === (p.userId || p._id || index) ? 'Marking...' : 'Mark Present'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      {selectedEventId ? 'No participants found matching your criteria.' : 'Please select an event to view the attendance list.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Placeholder */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-end sm:px-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 mr-2">Pagination:</span>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  &laquo;
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-green-500 bg-green-50 text-sm font-bold text-green-600">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  &raquo;
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Manual Check-in */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Manual Check-in (Over-ride)</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter Participant Name or Email..."
                className="flex-grow border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-3 border bg-gray-50"
                value={manualIdentifier}
                onChange={(e) => setManualIdentifier(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleManualCheckIn();
                }}
              />
              <button 
                id="manual-checkin-btn"
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-md font-bold transition shadow-sm whitespace-nowrap disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                onClick={() => handleManualCheckIn()}
                disabled={!selectedEventId || isMarkingPresent}
              >
                {isMarkingPresent && !loadingParticipantId ? 'Please Wait...' : 'Mark Present'}
              </button>
            </div>
          </div>
        </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AttendanceManagementPage;
