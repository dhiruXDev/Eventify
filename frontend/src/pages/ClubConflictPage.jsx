import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import image from "../assets/Custom.png";

const ClubConflictPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock Data for the Timeline
  const timelineData = [
    { id: 1, start: '10:00', end: '12:00', color: 'bg-green-500', width: 'w-24', left: 'left-0' },
    { id: 2, start: '11:30', end: '13:30', color: 'bg-green-600', width: 'w-32', left: 'left-16' },
    { id: 3, start: '14:00', end: '16:00', color: 'bg-green-500', width: 'w-28', left: 'left-48' },
    { id: 4, start: '15:30', end: '17:30', color: 'bg-green-700', width: 'w-20', left: 'left-64' },
  ];

  // Mock Data for the Table
  const scheduleData = [
    {
      id: 1,
      status: 'ok',
      title: 'Chess Comp',
      date: 'Dec 1, 2025',
      time: '10:00-12:00',
      venue: 'SLIET Academic block',
      conflicts: 'None',
    },
    {
      id: 2,
      status: 'conflict',
      title: 'TechFest 2025',
      date: 'Dec 2, 2025',
      time: '14:00-16:00',
      venue: 'New ECE Block SLIET',
      conflicts: "Venues clash with 'TechFest 2025 (Workshop)'",
    },
    {
      id: 3,
      status: 'ok',
      title: 'Code Quest',
      date: 'Dec 3, 2025',
      time: '09:00-11:00',
      venue: 'CS Hall',
      conflicts: 'None',
    },
  ];

  const filteredData = scheduleData.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Scheduling & Conflict Detection</h1>
        </div>

        {/* Top Section: Report and Illustration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Integrity Report Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-start gap-8">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Schedule Integrity Report</h2>
              <p className="text-gray-500 mb-6">System Status: <span className="text-green-600 font-bold uppercase">OK</span>. All scheduled events are conflict-free.<br />Last check: 2 mins ago.</p>
              
              {/* Timeline Visualization */}
              <div className="relative h-24 border-l border-b border-gray-200 mt-4 mb-2">
                {timelineData.map(item => (
                  <div 
                    key={item.id} 
                    className={`absolute h-6 ${item.color} rounded-full ${item.width} ${item.left}`} 
                    style={{ top: `${(item.id - 1) * 20}%` }}
                  ></div>
                ))}
                {/* Horizontal marker line */}
                <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-gray-300"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
              </div>
            </div>
          </div>

          {/* Illustration Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-center relative overflow-hidden">
             {/* Abstract background hex patterns */}
                  <img src={image} alt="" />
          </div>
        </div>

        {/* Checker and Adder Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Conflict Checker */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Conflict Checker</h2>
            <p className="text-sm text-gray-500 mb-6">Test dates, times, and venues to tutor yours platform.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
                <div className="relative">
                  <input type="text" value="Dec 1, 2025" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm" readOnly />
                  <svg className="w-4 h-4 absolute right-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Start Time</label>
                <input type="text" value="10:00-12:00" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-center" readOnly />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">End Time</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm appearance-none">
                  <option>Venue</option>
                  <option>Main Audit</option>
                </select>
              </div>
            </div>
            <button className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 transition mb-3">Check Availability</button>
            <div className="text-center">
              <span className="text-green-600 font-bold text-sm tracking-widest uppercase">Venue Available</span>
            </div>
          </div>

          {/* Add New Schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Add New Schedule</h2>
            <p className="text-sm text-gray-500 mb-6">Schedule a new event entry.</p>
            
            <div className="mb-4">
              <input type="text" placeholder="Event Title (linked)" className="w-full border border-gray-200 rounded-lg p-3 text-sm" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
                <div className="relative">
                  <input type="text" value="Dec 1, 2025" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm" readOnly />
                  <svg className="w-4 h-4 absolute right-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Time</label>
                <div className="flex items-center gap-2">
                  <input type="text" value="10:00-12:00" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-center" readOnly />
                  <span className="text-gray-400">-</span>
                  <input type="text" value="14:00-16:00" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-center" readOnly />
                </div>
              </div>
            </div>
            <div className="mb-4">
               <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                  <option>Venue</option>
               </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Event Schedule & Conflict Details</h2>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option>Date Range</option>
              </select>
              <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option>Venue</option>
              </select>
              <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option>Conflict Status</option>
              </select>
              <div className="relative flex-grow md:flex-grow-0">
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="w-full md:w-48 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Event Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Start/End Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Venue</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Conflicts Detected</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map(item => (
                  <tr key={item.id} className={item.status === 'conflict' ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      {item.status === 'ok' ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 text-gray-600">{item.date}</td>
                    <td className="px-6 py-4 text-gray-600">{item.time}</td>
                    <td className="px-6 py-4 text-gray-600">{item.venue}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.conflicts}</td>
                    <td className="px-6 py-4">
                      {item.status === 'ok' ? (
                        <button className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-800 transition">Edit Schedule</button>
                      ) : (
                        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition">Resolve Conflict</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center gap-2 text-gray-500 text-sm">
           <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
           <span>Trusted by 1000+ Students</span>
        </div>

      </div>
    </div>
  );
};

export default ClubConflictPage;
