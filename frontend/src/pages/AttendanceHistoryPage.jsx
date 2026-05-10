import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Chip, Box, CircularProgress } from '@mui/material';
import { eventService } from '../services';
import { Link } from 'react-router-dom';

const AttendanceHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await eventService.getAttendanceHistory();
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <Container sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Attendance History</Typography>
      
      {history.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">No attendance records found. You haven't attended any events yet.</Typography>
        </Paper>
      ) : (
        <div className="space-y-4 mt-6">
          {history.map(record => (
            <div key={record.eventId} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {record.clubLogo ? (
                  <img 
                    src={record.clubLogo} 
                    alt={record.organizerName} 
                    className="w-16 h-16 object-cover rounded-full border-2 border-gray-100 shadow-sm flex-shrink-0"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%234f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>'; 
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-indigo-50 rounded-full border-2 border-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{record.title}</h4>
                  <div className="flex flex-wrap gap-4 mt-1 items-center">
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{record.organizerName}</span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {record.location || 'N/A'}
                    </span>
                  </div>
                  {record.clubDescription && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 max-w-2xl">{record.clubDescription}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-3 mt-4 sm:mt-0">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold w-max ${record.attended ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                  {record.attended ? 'Attended ✓' : 'Absent ✗'}
                </span>
                {record.certificateIssued && (
                  <Link 
                    to={`/certificates/${record.eventId}`}
                    className="px-4 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm font-bold transition"
                  >
                    View Certificate
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default AttendanceHistoryPage;
