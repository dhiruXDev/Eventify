import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Alert, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import QRScanner from '../components/QRScanner';
import { eventService } from '../services';

const VolunteerDashboardPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  
  // Select event to scan for (ideally we should have an event selector, or extract from QR if it contains eventId)
  // For simplicity, assuming the QR code itself has enough information or the scanner endpoint handles it if we pass eventId.
  // Wait, our backend scanQrCode endpoint expects eventId in the URL: `/api/events/:id/attendance/scan`.
  // So the QR token MUST contain the eventId, or the volunteer must select the event first.
  // Let's modify the QR token to be a JSON object stringified: `{"eventId": "...", "token": "..."}` or just a combined string: `eventId:token`.
  // Wait! In event.controller.js we did `const participantIndex = event.participants.findIndex(p => p.qrToken === qrToken);`
  // And the route is `/:id/attendance/scan`. So the frontend needs to know the `eventId` to call this.
  
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');

  useEffect(() => {
    // Fetch all events and history
    const fetchData = async () => {
      try {
        const eventsRes = await eventService.getAllEvents();
        // Just show upcoming or today's events
        setEvents(eventsRes.data || eventsRes);
        
        const historyRes = await eventService.getScanHistory();
        setScanHistory(historyRes.data);
      } catch (err) {
        console.error('Failed to load data', err);
      }
    };
    fetchData();
  }, []);

  const handleScanSuccess = async (decodedText) => {
    // If we haven't selected an event, we can't scan.
    if (!selectedEventId) {
      setError('Please select an event first before scanning.');
      return;
    }

    try {
      // Decode text could be the raw token
      const response = await eventService.scanQrCode(selectedEventId, decodedText);
      setScanResult(response.data);
      setError('');
      
      // Refresh history
      const historyRes = await eventService.getScanHistory();
      setScanHistory(historyRes.data);
      
      // Clear success message after 3 seconds
      setTimeout(() => setScanResult(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to record attendance');
      setScanResult(null);
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleScanError = (errMessage) => {
    // Only log, don't show UI error for every frame
    console.warn(errMessage);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Volunteer Dashboard</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>1. Select Event to Scan For</Typography>
            <select 
              className="w-full p-2 border rounded mb-4"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="">-- Select Event --</option>
              {Array.isArray(events) && events.map(e => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>

            {selectedEventId && (
              <>
                <Typography variant="h6" gutterBottom>2. Scan QR Code</Typography>
                {scanResult && <Alert severity="success" sx={{ mb: 2 }}>Attendance marked for {scanResult.name}!</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
              </>
            )}
          </Paper>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Your Scan History</Typography>
            <List>
              {Array.isArray(scanHistory) && scanHistory.map((scan, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemText 
                      primary={scan.participantName} 
                      secondary={`${scan.eventTitle} - ${new Date(scan.scanTime).toLocaleTimeString()}`} 
                    />
                    <Chip label="Present" color="success" size="small" />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {(!Array.isArray(scanHistory) || scanHistory.length === 0) && (
                <Typography color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>No scans recorded yet.</Typography>
              )}
            </List>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default VolunteerDashboardPage;
