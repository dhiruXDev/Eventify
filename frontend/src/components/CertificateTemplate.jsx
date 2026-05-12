import { forwardRef } from 'react';
import { Box, Typography } from '@mui/material';

// --- SVGs and Assets ---

const GoldSeal = ({ sealImage }) => (
  <Box sx={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {sealImage ? (
      <Box component="img" src={sealImage} sx={{ width: 80, height: 80, objectFit: 'contain' }} />
    ) : (
      <svg width="88" height="88" viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="gsGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f5d97e" />
            <stop offset="60%" stopColor="#c9a227" />
            <stop offset="100%" stopColor="#7a5c00" />
          </radialGradient>
        </defs>
        <circle cx="44" cy="44" r="29" fill="url(#gsGrad)" />
        <circle cx="44" cy="44" r="27" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
        <circle cx="44" cy="44" r="24" fill="#1a1a1a" />
        <circle cx="44" cy="44" r="22" fill="none" stroke="#c9a227" strokeWidth="0.8" />
        <text x="44" y="40" textAnchor="middle" fill="#f5d97e" fontSize="7" fontFamily="serif" fontWeight="bold">SLIET</text>
        <text x="44" y="50" textAnchor="middle" fill="#c9a227" fontSize="5.5" fontFamily="serif">OFFICIAL</text>
        <text x="44" y="58" textAnchor="middle" fill="#c9a227" fontSize="4.5" fontFamily="serif">SEAL</text>
      </svg>
    )}
  </Box>
);

const BlueSeal = ({ sealImage }) => (
  <Box sx={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {sealImage ? (
      <Box component="img" src={sealImage} sx={{ width: 80, height: 80, objectFit: 'contain' }} />
    ) : (
      <svg width="88" height="88" viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bsGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e88e5" />
            <stop offset="100%" stopColor="#0d47a1" />
          </radialGradient>
        </defs>
        <circle cx="44" cy="44" r="30" fill="url(#bsGrad)" />
        <circle cx="44" cy="44" r="28" fill="none" stroke="#90caf9" strokeWidth="1.5" />
        <text x="44" y="40" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="serif" fontWeight="bold">SLIET</text>
        <text x="44" y="50" textAnchor="middle" fill="#bbdefb" fontSize="5.5" fontFamily="serif">OFFICIAL</text>
        <text x="44" y="58" textAnchor="middle" fill="#bbdefb" fontSize="4.5" fontFamily="serif">SEAL</text>
      </svg>
    )}
  </Box>
);

// --- Main Template ---

const CertificateTemplate = forwardRef(({ 
  participantName, 
  eventName, 
  date, 
  organizerName, 
  clubLogo, 
  clubSeal, 
  coordinatorSignature, 
  directorSignature,
  theme = 'blue-light' // 'gold-dark' or 'blue-light'
}, ref) => {
  
  const isGold = theme === 'gold-dark';

  const styles = {
    container: {
      width: '800px',
      height: '580px',
      backgroundColor: isGold ? '#111111' : '#ffffff',
      backgroundImage: isGold 
        ? 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 50%, #161410 100%)'
        : 'linear-gradient(160deg, #e3f2fd 0%, #ffffff 40%, #fafeff 100%)',
      border: isGold ? '5px solid #c9a227' : '5px solid #1565c0',
      outline: isGold ? '1px solid #7a5c00' : '2px solid #90caf9',
      outlineOffset: '-12px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      overflow: 'hidden',
      boxSizing: 'border-box',
      color: isGold ? '#ffffff' : '#333333',
    },
    header: {
      width: '100%',
      background: isGold 
        ? 'linear-gradient(90deg, #0d0d0d 0%, #1e1a0e 40%, #1e1a0e 60%, #0d0d0d 100%)'
        : 'linear-gradient(90deg, #0d47a1 0%, #1976d2 50%, #0d47a1 100%)',
      py: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
      borderBottom: isGold ? '2px solid #c9a227' : '3px solid #90caf9',
      zIndex: 1,
    },
    title: {
      fontSize: '40px',
      fontWeight: 'bold',
      background: isGold 
        ? 'linear-gradient(180deg, #f5d97e 0%, #c9a227 50%, #a07800 100%)'
        : 'none',
      WebkitBackgroundClip: isGold ? 'text' : 'none',
      WebkitTextFillColor: isGold ? 'transparent' : '#0d47a1',
      color: isGold ? 'transparent' : '#0d47a1',
      letterSpacing: '4px',
      textTransform: 'uppercase',
      fontFamily: "'Palatino Linotype', Palatino, serif",
      lineHeight: 1.1,
      filter: isGold ? 'drop-shadow(0 0 8px rgba(201,162,39,0.3))' : 'none',
    },
    name: {
      fontSize: '38px',
      fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
      color: isGold ? '#f5d97e' : '#0d47a1',
      lineHeight: 1.2,
      textShadow: isGold ? '0 0 12px rgba(245,217,126,0.25)' : 'none',
    }
  };

  return (
    <Box ref={ref} sx={styles.container}>
      {/* --- Decorative Corners --- */}
      {/* (Adding simple decorative corners) */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, p: 2, zIndex: 2 }}>
        <Box sx={{ width: 40, height: 40, borderTop: `4px solid ${isGold ? '#c9a227' : '#1565c0'}`, borderLeft: `4px solid ${isGold ? '#c9a227' : '#1565c0'}` }} />
      </Box>
      <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, zIndex: 2 }}>
        <Box sx={{ width: 40, height: 40, borderTop: `4px solid ${isGold ? '#c9a227' : '#1565c0'}`, borderRight: `4px solid ${isGold ? '#c9a227' : '#1565c0'}` }} />
      </Box>
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, p: 2, zIndex: 2 }}>
        <Box sx={{ width: 40, height: 40, borderBottom: `4px solid ${isGold ? '#c9a227' : '#1565c0'}`, borderLeft: `4px solid ${isGold ? '#c9a227' : '#1565c0'}` }} />
      </Box>
      <Box sx={{ position: 'absolute', bottom: 0, right: 0, p: 2, zIndex: 2 }}>
        <Box sx={{ width: 40, height: 40, borderBottom: `4px solid ${isGold ? '#c9a227' : '#1565c0'}`, borderRight: `4px solid ${isGold ? '#c9a227' : '#1565c0'}` }} />
      </Box>

      {/* --- Header --- */}
      <Box sx={styles.header}>
        {clubLogo ? (
          <Box component="img" src={clubLogo} sx={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid white' }} />
        ) : (
          <Box sx={{
            width: 48, height: 48, borderRadius: '50%',
            background: isGold ? 'radial-gradient(circle, #f5d97e 0%, #c9a227 55%, #7a5c00 100%)' : 'radial-gradient(circle, #e3f2fd 0%, #90caf9 50%, #1565c0 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white',
          }}>
            <Typography sx={{ fontSize: '9px', fontWeight: 'bold', color: isGold ? '#111' : '#0d47a1' }}>Eventify</Typography>
          </Box>
        )}
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: isGold ? '#f5d97e' : '#e3f2fd', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Sant Longowal Institute
          </Typography>
          <Typography sx={{ color: isGold ? '#c9a227' : '#bbdefb', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            of Engineering and Technology
          </Typography>
        </Box>
      </Box>

      {/* --- Body --- */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', px: '60px', py: '20px', width: '100%', boxSizing: 'border-box', zIndex: 1 }}>
        
        {/* Title Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={styles.title}>Certificate</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 0.5 }}>
            <Box sx={{ height: '1px', width: '50px', bgcolor: isGold ? '#c9a227' : '#1976d2' }} />
            <Typography sx={{ fontSize: '11px', letterSpacing: '4px', color: isGold ? '#c9a227' : '#1565c0', textTransform: 'uppercase' }}>
              of Participation
            </Typography>
            <Box sx={{ height: '1px', width: '50px', bgcolor: isGold ? '#c9a227' : '#1976d2' }} />
          </Box>
        </Box>

        {/* Recipient Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '14px', color: isGold ? '#aaa' : '#555', fontStyle: 'italic', mb: 1 }}>
            This is to certify that
          </Typography>
          <Typography sx={styles.name}>
            {participantName || 'Recipient Name'}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: isGold ? '#aaa' : '#555', mt: 1 }}>
            has successfully participated in the event
          </Typography>
          <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: isGold ? '#f5d97e' : '#0d47a1', mt: 1, textTransform: 'uppercase' }}>
            {eventName}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: isGold ? '#aaa' : '#555', mt: 1 }}>
            organized by
          </Typography>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: isGold ? '#ffffff' : '#333333', mt: 0.5 }}>
            {organizerName}
          </Typography>
        </Box>

        {/* Seal Section */}
        {isGold ? <GoldSeal sealImage={clubSeal} /> : <BlueSeal sealImage={clubSeal} />}

        {/* Footer / Signatures Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end', mt: 2 }}>
          
          <Box sx={{ textAlign: 'center', minWidth: '150px' }}>
            <Typography sx={{ fontSize: '12px', color: isGold ? '#ffffff' : '#333333', fontWeight: 'bold', mb: 1 }}>
              {new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
            <Box sx={{ borderBottom: `1px solid ${isGold ? '#c9a227' : '#1976d2'}`, width: '150px', mb: 1 }} />
            <Typography sx={{ fontSize: '10px', color: isGold ? '#888' : '#666', textTransform: 'uppercase' }}>Date</Typography>
          </Box>

          <Box sx={{ textAlign: 'center', minWidth: '150px' }}>
            {coordinatorSignature && (
              <Box component="img" src={coordinatorSignature} sx={{ height: 40, mb: 1, objectFit: 'contain' }} />
            )}
             <Typography sx={{ fontSize: '12px', color: isGold ? '#ffffff' : '#333333', fontWeight: 'bold', mb: 1 }}>
              Dr.Jatinder Kaur
            </Typography>
            <Box sx={{ borderBottom: `1px solid ${isGold ? '#c9a227' : '#1976d2'}`, width: '150px', mb: 1 }} />
            <Typography sx={{ fontSize: '10px', color: isGold ? '#888' : '#666', textTransform: 'uppercase' }}>Faculty Coordinator</Typography>
          </Box>

          <Box sx={{ textAlign: 'center', minWidth: '150px' }}>
            {directorSignature && (
              <Box component="img" src={directorSignature} sx={{ height: 40, mb: 1, objectFit: 'contain' }} />
            )}
              <Typography sx={{ fontSize: '12px', color: isGold ? '#ffffff' : '#333333', fontWeight: 'bold', mb: 1 }}>
              Dr.Manoj Sachhan
            </Typography>
            <Box sx={{ borderBottom: `1px solid ${isGold ? '#c9a227' : '#1976d2'}`, width: '150px', mb: 1 }} />
            <Typography sx={{ fontSize: '10px', color: isGold ? '#888' : '#666', textTransform: 'uppercase' }}>Director</Typography>
          </Box>

        </Box>

      </Box>

      {/* Bottom Stripe */}
      <Box sx={{ width: '100%', height: '8px', background: isGold 
        ? 'linear-gradient(90deg, #7a5c00, #f5d97e, #c9a227, #f5d97e, #7a5c00)'
        : 'linear-gradient(90deg, #0d47a1, #42a5f5, #1976d2, #42a5f5, #0d47a1)' 
      }} />
    </Box>
  );
});

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;