import React, { useState } from 'react';
import { Button, TextField, Box, FormControl, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const AppointmentForm = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ doctor_id: '', hospital_id: '', clinic_id: '', date_time: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await api.post('/appointments', form);
      alert('Appointment booked');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <TextField label="Doctor ID" name="doctor_id" value={form.doctor_id} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Hospital ID" name="hospital_id" value={form.hospital_id} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Clinic ID" name="clinic_id" value={form.clinic_id} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Date & Time" type="datetime-local" name="date_time" value={form.date_time} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
      <Button variant="contained" onClick={handleSubmit}>{t('book_appointment')}</Button>
    </Box>
  );
};

export default AppointmentForm;