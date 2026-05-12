import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { eventService } from '../services';
import CertificateTemplate from '../components/CertificateTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button, Box, Typography, Container, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CertificatePage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const certificateRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const history = await eventService.getAttendanceHistory();
        const record = history.data.find(h => h.eventId === eventId);
        
        if (!record) {
          setError('Certificate not found or you have not attended this event.');
          setLoading(false);
          return;
        }
        
        if (!record.certificateIssued) {
          setError('Certificate has not been issued for this event yet.');
          setLoading(false);
          return;
        }

        setEventData(record);
        setLoading(false);
      } catch (err) {
        setError('Failed to load certificate details.');
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId]);

  const [theme, setTheme] = useState('blue-light');

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher quality
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${eventData.title.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
  };

  if (loading) return <Container sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;
  
  if (error) return (
    <Container sx={{ mt: 10, textAlign: 'center' }}>
      <Typography variant="h5" color="error" gutterBottom>{error}</Typography>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/profile')} variant="outlined">
        Back to Profile
      </Button>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/profile')} sx={{ mb: 4 }}>
        Back to Profile
      </Button>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Your Certificate
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => setTheme(theme === 'blue-light' ? 'gold-dark' : 'blue-light')}
          >
            Switch to {theme === 'blue-light' ? 'Gold' : 'Blue'} Theme
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPdf}
          >
            Download PDF
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyItems: 'center', justifyContent: 'center', overflow: 'auto', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <CertificateTemplate 
          ref={certificateRef}
          participantName={user?.name || `${user?.firstName} ${user?.lastName}`}
          eventName={eventData.title}
          date={eventData.date}
          organizerName={eventData.organizerName || 'Univent Organizer'}
          clubLogo={eventData.clubLogo}
          clubSeal={eventData.clubSeal}
          coordinatorSignature={eventData.coordinatorSignature}
          directorSignature={eventData.directorSignature}
          theme={theme}
        />
      </Box>
    </Container>
  );
};

export default CertificatePage;
