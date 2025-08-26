import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Card, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Profile = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setForm({ username: res.data.username, email: res.data.email, phone: res.data.phone || '', password: '' });
      } catch (err) {
        setError(t('error'));
      }
    };
    fetchProfile();
  }, [t]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      // Assume backend has a /auth/update endpoint (add it if needed)
      await api.put('/auth/update', form);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(t('error'));
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Edit Profile</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField label={t('username')} name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" />
      <TextField label={t('email')} name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" />
      <TextField label={t('phone')} name="phone" value={form.phone} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="New Password (optional)" name="password" type="password" value={form.password} onChange={handleChange} fullWidth margin="normal" />
      <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>Update Profile</Button>
    </Card>
  );
};

export default Profile;