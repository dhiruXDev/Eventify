import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Typography, Paper } from '@mui/material';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [scannerReady, setScannerReady] = useState(false);

  useEffect(() => {
    // Check if the scanner element exists to prevent multiple renderings
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        // Optional: you can clear scanner here or just keep scanning
        if (onScanSuccess) onScanSuccess(decodedText);
      },
      (errorMessage) => {
        if (onScanError) onScanError(errorMessage);
      }
    );
    
    setScannerReady(true);

    // Cleanup function when component will unmount
    return () => {
      scanner.clear().catch(error => console.error("Failed to clear html5QrcodeScanner. ", error));
    };
  }, [onScanSuccess, onScanError]);

  return (
    <Box sx={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Scan Participant QR Code
        </Typography>
        <Box id="qr-reader" sx={{ width: '100%' }}></Box>
      </Paper>
    </Box>
  );
};

export default QRScanner;
