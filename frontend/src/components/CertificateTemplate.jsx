import React, { forwardRef } from 'react';
import { Box, Typography } from '@mui/material';

const CertificateTemplate = forwardRef(({ participantName, eventName, date, organizerName }, ref) => {
  return (
    <Box 
      ref={ref}
      sx={{
        width: '800px',
        height: '600px',
        border: '10px solid #1976d2',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f0f8ff)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: 'relative'
      }}
    >
      <Box sx={{ border: '2px solid #1976d2', width: '100%', height: '100%', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2', textTransform: 'uppercase', letterSpacing: 2 }}>
          Certificate of Attendance
        </Typography>
        
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            This is to certify that
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', borderBottom: '2px solid #1976d2', display: 'inline-block', px: 4, pb: 1, my: 2 }}>
            {participantName}
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            has successfully participated in the event
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mt: 2 }}>
            {eventName}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ borderBottom: '1px solid #333', width: '150px', pb: 1, mb: 1 }}>
              {new Date(date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Date
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ borderBottom: '1px solid #333', width: '200px', pb: 1, mb: 1, fontFamily: 'cursive' }}>
              {organizerName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Organizer
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default CertificateTemplate;
