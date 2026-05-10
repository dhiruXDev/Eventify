import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const lastScanTime = useRef(0);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setError('');
      scannerRef.current = new Html5Qrcode("qr-reader");
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          const now = Date.now();
          if (now - lastScanTime.current > 3000) { // 3 seconds debounce
            lastScanTime.current = now;
            if (onScanSuccess) onScanSuccess(decodedText);
          }
        },
        (errorMessage) => {
          // Ignore frequent scan errors when no QR is in view
          if (onScanError) onScanError(errorMessage);
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setError("Failed to access camera. Please ensure you have granted camera permissions.");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        setIsScanning(false);
      }).catch(err => {
        console.error("Error stopping scanner:", err);
      });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Scan QR Code</h3>
          <p className="text-sm text-gray-500 mt-1">Scan participant tickets to mark attendance</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {/* QR Reader Container */}
        <div className="relative overflow-hidden rounded-xl bg-black shadow-inner min-h-[400px] flex items-center justify-center mb-6">
          <div id="qr-reader" className="w-full h-full object-cover"></div>
          
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Green Scanning Box */}
              <div className="w-64 h-64 border-4 border-green-500 rounded-lg relative">
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-400"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-400"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-400"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-400"></div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-white text-lg font-semibold drop-shadow-md">Scanning...</p>
                <p className="text-white text-sm opacity-90 drop-shadow-md">Waiting for code.</p>
              </div>
            </div>
          )}

          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 z-10 px-4">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-300 font-medium text-lg">Camera is inactive</p>
              <p className="text-gray-500 text-sm mt-2 max-w-xs text-center">Click the button below to grant permission and start scanning.</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          {!isScanning ? (
            <button
              onClick={startScanner}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-all flex items-center gap-2 w-full justify-center text-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition-all flex items-center gap-2 w-full justify-center text-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Camera
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
