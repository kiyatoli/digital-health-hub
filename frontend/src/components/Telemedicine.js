import React, { useState, useRef, useEffect } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SimplePeer from 'simple-peer';

const Telemedicine = () => {
  const { t } = useTranslation();
  const [stream, setStream] = useState(null);
  const videoRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(s => {
        setStream(s);
        videoRef.current.srcObject = s;
      })
      .catch(err => console.error(err));
  }, []);

  const startCall = () => {
    const peer = new SimplePeer({ initiator: true, stream });
    peer.on('signal', data => {
      // Send signal data to backend or signaling server
      console.log('Signal data:', data);
    });
    peer.on('stream', remoteStream => {
      // Handle remote stream
    });
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">Telemedicine</Typography>
      <video ref={videoRef} autoPlay style={{ width: '300px' }} />
      <Button variant="contained" onClick={startCall}>Start Call</Button>
    </Box>
  );
};

export default Telemedicine;