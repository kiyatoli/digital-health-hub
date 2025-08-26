import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const EMRView = () => {
  const { t } = useTranslation();
  const [emr, setEmr] = useState([]);
  const [notes, setNotes] = useState('');
  const [patientId, setPatientId] = useState('');

  useEffect(() => {
    const fetchEMR = async () => {
      try {
        const res = await api.get(`/emr/${patientId || 'me'}`);
        setEmr(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (patientId) fetchEMR();
  }, [patientId]);

  const handleUpdate = async () => {
    try {
      await api.post('/emr', { patient_id: patientId, notes });
      alert('EMR updated');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">{t('view_emr')}</Typography>
      <TextField label="Patient ID" value={patientId} onChange={(e) => setPatientId(e.target.value)} fullWidth margin="normal" />
      <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth margin="normal" multiline />
      <Button variant="contained" onClick={handleUpdate}>Update EMR</Button>
      {emr.map(record => (
        <Box key={record.id} sx={{ mt: 2 }}>
          <Typography>Notes: {record.notes}</Typography>
          <Typography>Updated: {new Date(record.updated_at).toLocaleString()}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default EMRView;