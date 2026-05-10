import React, { useState, useEffect } from 'react';
import { eventService } from '../services';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GavelIcon from '@mui/icons-material/Gavel';
import SettingsIcon from '@mui/icons-material/Settings';
import MicIcon from '@mui/icons-material/Mic';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const CertificatesListPage = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await eventService.getAttendanceHistory();
        const certs = res.data.filter(record => record.certificateIssued);
        setCertificates(certs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getIconForTitle = (title) => {
    const t = title.toLowerCase();
    if (t.includes('code') || t.includes('tech') || t.includes('robot')) return <SettingsIcon sx={{ fontSize: 40, color: '#4b5563' }} />;
    if (t.includes('speak') || t.includes('tedx') || t.includes('talk')) return <MicIcon sx={{ fontSize: 40, color: '#4b5563' }} />;
    if (t.includes('award') || t.includes('win') || t.includes('1st')) return <EmojiEventsIcon sx={{ fontSize: 40, color: '#d97706' }} />;
    if (t.includes('work') || t.includes('volunteer')) return <GavelIcon sx={{ fontSize: 40, color: '#78350f' }} />;
    return <WorkspacePremiumIcon sx={{ fontSize: 40, color: '#d97706' }} />;
  };

  const getType = (title) => {
    const t = title.toLowerCase();
    if (t.includes('win') || t.includes('1st') || t.includes('award')) return 'Winner';
    if (t.includes('volunteer') || t.includes('work')) return 'Volunteer/Club Work';
    return 'Participation';
  };

  const filteredCerts = certificates.filter(c => {
    if (filter !== 'All' && getType(c.title) !== filter) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name || 'User';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="z-10 max-w-2xl">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">My Certifications</h1>
            <p className="text-lg text-gray-600">
              Congratulations, <span className="font-bold text-gray-900">{userName}</span>! You have earned certifications for your participation and achievements.
            </p>
          </div>
          
          <div className="mt-6 md:mt-0 z-10 flex gap-6 items-center">
            {/* Simple abstract illustration instead of person */}
            <div className="hidden lg:flex w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full items-center justify-center relative">
               <div className="absolute w-24 h-32 bg-white shadow-md border-2 border-yellow-400 rounded rotate-6 flex flex-col items-center justify-center p-2">
                 <div className="w-8 h-8 rounded-full border-4 border-yellow-400 bg-yellow-100 mb-2"></div>
                 <div className="w-full h-1 bg-gray-200 rounded mb-1"></div>
                 <div className="w-3/4 h-1 bg-gray-200 rounded"></div>
               </div>
            </div>

            <div className="bg-white border border-gray-100 shadow-md rounded-xl p-6 text-center min-w-[200px]">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Certifications Earned:</p>
              <p className="text-5xl font-black text-gray-900">{certificates.length}</p>
            </div>
          </div>

          {/* Decorative background blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -bottom-24 left-1/2 w-72 h-72 bg-indigo-50 rounded-full opacity-50 blur-2xl"></div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-64">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {['All', 'Volunteer/Club Work', 'Winner', 'Participation'].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === cat ? 'bg-green-100 text-green-800' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
              >
                {cat === 'Volunteer/Club Work' ? 'Club Work' : cat === 'Winner' ? 'Event Winning' : cat === 'Participation' ? 'Event Participation' : 'All'}
              </button>
            ))}
          </div>

          <div className="flex gap-4 w-full lg:w-auto">
            <select className="flex-1 lg:w-48 py-2 px-3 border border-gray-300 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-green-500 shadow-sm">
              <option>Club/Event...</option>
            </select>
            <select className="flex-1 lg:w-32 py-2 px-3 border border-gray-300 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-green-500 shadow-sm">
              <option>Year</option>
            </select>
          </div>
        </div>

        {/* Certificates Grid */}
        {filteredCerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <WorkspacePremiumIcon sx={{ fontSize: 60, color: '#9ca3af', mb: 2 }} />
            <h3 className="text-xl font-bold text-gray-900 mb-1">No certificates found</h3>
            <p className="text-gray-500">Try adjusting your filters or attend more events to earn certificates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCerts.map((record) => {
              const type = getType(record.title);
              const dateStr = new Date(record.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              
              return (
                <div key={record.eventId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col h-full">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-bold text-gray-900">{type}</span>
                      {getIconForTitle(record.title)}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 min-h-[56px]">{record.title}</h3>
                    
                    <div className="space-y-1.5 mb-6 text-sm">
                      <p className="text-gray-600"><span className="text-gray-900 font-medium">Issuer:</span> {record.organizerName || 'Eventify Committee'}</p>
                      <p className="text-gray-600"><span className="text-gray-900 font-medium">Date:</span> {dateStr}</p>
                      <p className="text-gray-600"><span className="text-gray-900 font-medium">Award:</span> {type === 'Winner' ? 'Champion' : type === 'Volunteer/Club Work' ? 'Presidential Service' : 'Attendee'}</p>
                    </div>

                    {/* Preview Image Placeholder (Certificate Thumbnail style) */}
                    {type === 'Participation' && (
                      <div className="w-full aspect-[4/3] bg-gradient-to-br from-blue-50 to-white rounded border border-gray-200 mb-4 flex items-center justify-center p-4 relative overflow-hidden">
                        <div className="absolute inset-0 m-2 border-2 border-blue-900/10 flex flex-col items-center justify-center">
                          <p className="text-[10px] font-bold tracking-widest text-blue-900 uppercase">Certificate of Participation</p>
                          <p className="text-xs font-serif italic mt-2 text-gray-800">{userName}</p>
                          <div className="w-8 h-8 rounded-full bg-yellow-100 border-2 border-yellow-400 mx-auto mt-2 flex items-center justify-center">
                            <span className="text-[6px] font-bold text-yellow-600">SEAL</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="px-6 pb-6 pt-0 flex gap-3 mt-auto">
                    <Link 
                      to={`/certificates/${record.eventId}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded shadow-sm text-center transition text-sm whitespace-nowrap"
                    >
                      [View Certificate]
                    </Link>
                    <button 
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded shadow-sm text-center transition text-sm whitespace-nowrap"
                    >
                      [Download PDF]
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredCerts.length > 0 && (
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-6">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
              &larr; Previous
            </button>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium text-gray-700 hover:bg-gray-50">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium bg-green-600 text-white shadow-sm">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium text-gray-700 hover:bg-gray-50">3</button>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesListPage;
