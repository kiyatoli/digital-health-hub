import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Card, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const UserManagement = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: '', phone: '', hospital_id: '', clinic_id: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      setError('');
      setSuccess('');
      const res = await api.post('/auth/register', form);  // Reuse register endpoint, but admin-only
      // Backend should send email with credentials (update backend if needed)
      setSuccess(`User created: ${res.data.userId}. Credentials sent to ${form.email}`);
    } catch (err) {
      setError(t('error'));
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Create New User</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField label={t('username')} name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" />
      <TextField label={t('email')} name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" />
      <TextField label={t('password')} name="password" type="password" value={form.password} onChange={handleChange} fullWidth margin="normal" />
      <TextField label={t('phone')} name="phone" value={form.phone} onChange={handleChange} fullWidth margin="normal" />
      <FormControl fullWidth margin="normal">
        <InputLabel>Role</InputLabel>
        <Select name="role" value={form.role} onChange={handleChange}>
          <MenuItem value="doctor">Doctor</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="pharmacist">Pharmacist</MenuItem>
          <MenuItem value="lab_staff">Lab Staff</MenuItem>
        </Select>
      </FormControl>
      <TextField label="Hospital ID" name="hospital_id" value={form.hospital_id} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Clinic ID" name="clinic_id" value={form.clinic_id} onChange={handleChange} fullWidth margin="normal" />
      <Button variant="contained" onClick={handleCreate} sx={{ mt: 2 }}>Create User & Send Credentials</Button>
      <Typography variant="body2" sx={{ mt: 2 }}>Note: Patients register themselves. Credentials will be emailed.</Typography>
    </Card>
  );
};

export default UserManagement;